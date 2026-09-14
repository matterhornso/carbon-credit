// Tells a developer what they will have to prove, before they spend money
// proving it.
//
// Every input here is declarative: the methodology states its required inputs,
// its additionality tiers' required evidence, its baseline variables and where
// each is sourced from, and its monitoring parameters. Comparing that against
// what the project has actually supplied is arithmetic, not judgement — so
// this needs no model call, runs in milliseconds, and works in an environment
// with no LLM configured at all.
//
// The expensive failure mode in this market is discovering a missing piece of
// evidence at validation, months and a validator's invoice later. This moves
// that discovery to intake.

import { IMethodologyInterface } from '../../../domain/methodology/methodologyInterface';
import { IProjectInterface } from '../../../domain/project/projectInterface';
import { ISourceDocumentInterface } from '../../../domain/source_document/sourceDocumentInterface';

export type GapCategory =
  | 'intake' | 'applicability' | 'additionality' | 'baseline' | 'monitoring' | 'evidence';

export type GapSeverity =
  /** Generation cannot proceed until this is supplied. */
  | 'blocking'
  /** Generation can proceed, but the case will not survive validation without it. */
  | 'required'
  /** Worth having; its absence weakens the case rather than invalidating it. */
  | 'advisory';

export interface IEvidenceGap {
  category: GapCategory;
  severity: GapSeverity;
  /** The field, condition, tier, variable or document the gap concerns. */
  key: string;
  summary: string;
  /** What the developer should actually do about it. */
  whatToProvide: string;
}

export interface IEvidenceGapReport {
  methodologyCode: string;
  /** True when nothing blocking remains — not a claim that the case is complete. */
  readyToGenerate: boolean;
  counts: { blocking: number; required: number; advisory: number };
  gaps: IEvidenceGap[];
}

const SEVERITY_ORDER: Record<GapSeverity, number> = { blocking: 0, required: 1, advisory: 2 };

function isEmpty(value: any): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/** Documents that actually contribute text. An unreadable upload is not evidence. */
function usableDocuments(documents: ISourceDocumentInterface[]): ISourceDocumentInterface[] {
  return (documents || []).filter((d) => d.status === 'processed' && !isEmpty(d.extractedText));
}

function documentsForSection(documents: ISourceDocumentInterface[], section: string): ISourceDocumentInterface[] {
  return usableDocuments(documents).filter(
    // An unlinked document is general-purpose and counts toward every section,
    // matching how excerpts are assembled for generation.
    (d) => !d.linkedSections || d.linkedSections.length === 0 || d.linkedSections.includes(section)
  );
}

export function analyseEvidenceGaps(
  methodology: IMethodologyInterface,
  project: IProjectInterface,
  documents: ISourceDocumentInterface[] = []
): IEvidenceGapReport {
  const gaps: IEvidenceGap[] = [];
  const intake: Record<string, any> = (project.intake as any) || {};
  const usable = usableDocuments(documents);

  // --- intake --------------------------------------------------------------
  for (const field of methodology.requiredInputs || []) {
    if (field.required && isEmpty(intake[field.key])) {
      gaps.push({
        category: 'intake', severity: 'blocking', key: field.key,
        summary: `Required input '${field.label || field.key}' has not been provided.`,
        whatToProvide: field.helpText
          ? `${field.helpText}${field.unit ? ` Expressed in ${field.unit}.` : ''}`
          : `Supply a value for ${field.label || field.key}${field.unit ? ` in ${field.unit}` : ''}.`,
      });
    }
  }

  // --- applicability -------------------------------------------------------
  for (const condition of methodology.applicabilityConditions || []) {
    if (condition.operator === 'manual_review') {
      gaps.push({
        category: 'applicability', severity: 'required', key: condition.key,
        summary: `'${condition.statement}' cannot be decided automatically and needs a human determination.`,
        whatToProvide: condition.guidance || 'Record the basis on which this condition is judged to be met.',
      });
      continue;
    }
    if (condition.checksInputKey && isEmpty(intake[condition.checksInputKey])) {
      gaps.push({
        category: 'applicability', severity: 'blocking', key: condition.key,
        summary: `Eligibility condition '${condition.statement}' cannot be evaluated: '${condition.checksInputKey}' is missing.`,
        whatToProvide: `Supply '${condition.checksInputKey}' so this condition can be checked before any work is commissioned.`,
      });
    }
  }

  // --- additionality -------------------------------------------------------
  const additionalityDocs = documentsForSection(documents, 'additionality');
  for (const tier of methodology.additionalityTiers || []) {
    const required = tier.requiredEvidence || [];
    if (required.length === 0) continue;
    if (additionalityDocs.length === 0) {
      gaps.push({
        category: 'additionality', severity: 'required', key: tier.tier,
        summary: `Tier ${tier.tier} (${tier.name}) has no supporting evidence attached.`,
        whatToProvide: `Upload documents covering: ${required.join('; ')}.`,
      });
    } else {
      gaps.push({
        category: 'additionality', severity: 'advisory', key: tier.tier,
        summary: `Tier ${tier.tier} (${tier.name}) will be argued from ${additionalityDocs.length} document(s); confirm they cover what it requires.`,
        whatToProvide: `This tier requires: ${required.join('; ')}.`,
      });
    }
  }

  // --- baseline ------------------------------------------------------------
  for (const variable of methodology.baselineFormula?.variables || []) {
    if (variable.source === 'input') {
      const key = variable.sourceRef || variable.name;
      const declaredAsInput = (methodology.requiredInputs || []).some((f) => f.key === key);
      if (!declaredAsInput && isEmpty(intake[key])) {
        // The methodology says this comes from intake but names no intake field
        // that supplies it. No amount of diligence by the developer fixes that,
        // so reporting it as missing evidence would send them hunting for a
        // document that was never the problem.
        gaps.push({
          category: 'baseline', severity: 'required', key: variable.name,
          summary: `Baseline variable ${variable.name} (${variable.label}) is declared as coming from intake, but the methodology defines no intake field that supplies it.`,
          whatToProvide: `This is a gap in the methodology definition rather than in your evidence. Either '${key}' should be added to the required inputs, or ${variable.name} should be derived rather than supplied.`,
        });
      } else if (isEmpty(intake[key])) {
        gaps.push({
          category: 'baseline', severity: 'blocking', key: variable.name,
          summary: `Baseline variable ${variable.name} (${variable.label}) is taken from intake field '${key}', which is missing.`,
          whatToProvide: `Supply '${key}'${variable.unit ? ` in ${variable.unit}` : ''}; the baseline cannot be quantified without it.`,
        });
      }
    } else if (variable.source === 'reference') {
      // A reference value comes from outside the project and is the single most
      // common reason a quantification section cannot be completed.
      gaps.push({
        category: 'baseline', severity: 'required', key: variable.name,
        summary: `Baseline variable ${variable.name} (${variable.label}) needs a published reference value.`,
        whatToProvide: variable.sourceRef
          ? `Attach the published figure for ${variable.sourceRef}${variable.unit ? ` in ${variable.unit}` : ''}, with its source and vintage.`
          : `Attach the published figure with its source and vintage${variable.unit ? `, in ${variable.unit}` : ''}.`,
      });
    }
  }

  // --- monitoring ----------------------------------------------------------
  const monitoring = methodology.monitoringParameters || [];
  if (monitoring.length > 0 && documentsForSection(documents, 'monitoring').length === 0) {
    gaps.push({
      category: 'monitoring', severity: 'advisory', key: 'monitoring_plan',
      summary: `${monitoring.length} monitoring parameter(s) are required and no supporting documentation has been supplied.`,
      whatToProvide: `Provide evidence for: ${monitoring.map((m) => m.parameter).join('; ')}.`,
    });
  }

  // --- evidence that cannot be read ---------------------------------------
  for (const doc of documents || []) {
    if (doc.status === 'failed' || (doc.status === 'processed' && isEmpty(doc.extractedText))) {
      gaps.push({
        category: 'evidence', severity: 'required', key: doc.filename || 'unnamed document',
        summary: `'${doc.filename}' was uploaded but no text could be read from it, so nothing can cite it.`,
        whatToProvide: 'Re-upload a text-based version. A scan needs to be converted before it can support any claim.',
      });
    }
  }

  gaps.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const counts = {
    blocking: gaps.filter((g) => g.severity === 'blocking').length,
    required: gaps.filter((g) => g.severity === 'required').length,
    advisory: gaps.filter((g) => g.severity === 'advisory').length,
  };

  return {
    methodologyCode: methodology.code || 'unknown',
    readyToGenerate: counts.blocking === 0,
    counts,
    gaps,
  };
}
