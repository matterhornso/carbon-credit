import {
  IRegistryInterface,
  IRegistrySection,
  IMethodologySectionOverlay,
  IResolvedSection,
} from '../../../domain/registry/registryInterface';
import { IMethodologyInterface, ISectionGuidance } from '../../../domain/methodology/methodologyInterface';

/**
 * Merges a registry's document template with a methodology's overlays to
 * produce the section list that drives case-document seeding and generation.
 *
 * Pure. No I/O, no LLM. The whole point is that "what sections does this
 * document have" becomes a function of (registry, methodology) rather than a
 * hand-copied array, so it needs to be cheap to test across many pairs.
 */

/**
 * Reads a methodology's sections, separating two things the legacy shape
 * cannot distinguish.
 *
 * An OVERLAY is what this methodology has to say about a section its registry
 * already asks for. If the registry does not ask for that section, the overlay
 * has nothing to attach to and is dropped — VM0047's `project_boundary` text
 * exists because the VCS template has a Project Boundary section, not because
 * VM0047 believes every document everywhere needs one. Carrying it onto a Gold
 * Standard document would invent a section GS never asked for.
 *
 * An ADDITIONAL section is one the methodology contributes regardless of
 * registry — something the activity type genuinely requires that no template
 * happens to name. Those travel.
 *
 * The legacy `sectionGuidance` array cannot express the difference, because
 * every entry in it was written against the VCS template. So legacy entries are
 * read as overlays only, never as additions. That is the conservative reading:
 * the failure mode of treating a real addition as an overlay is a section
 * missing from a non-VCS document, which the registry template's own required
 * sections make visible. The opposite error silently fabricates sections.
 *
 * Migration matters because live case documents were seeded from the legacy
 * field, and a resolver that only understood the new shape would produce zero
 * sections for them — an empty document rather than an error, the worst
 * available failure mode.
 */
export function readSections(methodology: IMethodologyInterface): {
  overlays: IMethodologySectionOverlay[];
  additional: IMethodologySectionOverlay[];
} {
  const declaredOverlays = (methodology as any).sectionOverlays as IMethodologySectionOverlay[] | undefined;
  const declaredAdditional = (methodology as any).additionalSections as IMethodologySectionOverlay[] | undefined;

  if ((declaredOverlays && declaredOverlays.length) || (declaredAdditional && declaredAdditional.length)) {
    return { overlays: declaredOverlays || [], additional: declaredAdditional || [] };
  }

  return {
    overlays: (methodology.sectionGuidance || []).map((guidance: ISectionGuidance) => ({
      section: guidance.section,
      promptFragment: guidance.promptFragment,
      contentType: guidance.contentType,
    })),
    additional: [],
  };
}

/**
 * Every section the methodology mentions, in declared order. Used for the
 * no-registry fallback, where the distinction between overlay and addition is
 * meaningless because there is no template to overlay onto.
 */
export function readOverlays(methodology: IMethodologyInterface): IMethodologySectionOverlay[] {
  const { overlays, additional } = readSections(methodology);
  return [...overlays, ...additional];
}

/**
 * Joins the registry's expectation for a section with the methodology's.
 *
 * Both, not either. The registry says what the document must contain; the
 * methodology says what is true of this activity type. Dropping the registry
 * half produces text that is scientifically right and fails review on form;
 * dropping the methodology half produces a correctly-shaped document that says
 * nothing specific. A reviewer needs both, so the prompt carries both, labelled
 * — an unlabelled concatenation reads as one voice contradicting itself when
 * the two disagree.
 */
function mergeGuidance(registryGuidance: string | undefined, methodologyFragment: string | undefined): string {
  const parts: string[] = [];
  if (registryGuidance) parts.push(`REGISTRY EXPECTATION: ${registryGuidance}`);
  if (methodologyFragment) parts.push(`METHODOLOGY GUIDANCE: ${methodologyFragment}`);
  return parts.join('\n\n');
}

export function resolveSections(
  registry: IRegistryInterface | undefined,
  methodology: IMethodologyInterface
): IResolvedSection[] {
  const { overlays, additional } = readSections(methodology);
  const overlayByKey = new Map(overlays.map((o) => [o.section, o]));
  const templateSections: IRegistrySection[] = registry?.documentTemplate?.sections || [];

  // No registry: the methodology's own list is the document. This is the
  // pre-registry behaviour, preserved exactly so migrating a methodology is a
  // data change rather than a behaviour change — and so a methodology whose
  // registry row is missing degrades to "works, less structured" instead of
  // "produces an empty document".
  if (templateSections.length === 0) {
    return [...overlays, ...additional].map((overlay, index) => ({
      key: overlay.section,
      title: overlay.section,
      order: overlay.order ?? index,
      required: true,
      contentType: overlay.contentType || 'narrative',
      promptFragment: overlay.promptFragment,
      origin: 'methodology' as const,
    }));
  }

  const resolved: IResolvedSection[] = templateSections
    // A registry section the methodology says nothing about is still part of
    // the document — the registry requires it. It generates from the registry's
    // own guidance. Dropping it would hand the customer a document missing a
    // mandatory section, which fails validation at the VVB rather than here.
    .map((section) => {
      const overlay = overlayByKey.get(section.key);
      return {
        key: section.key,
        title: section.title,
        order: section.order,
        required: section.required,
        contentType: overlay?.contentType || section.contentType,
        promptFragment: mergeGuidance(section.registryGuidance, overlay?.promptFragment),
        origin: (overlay ? 'registry+methodology' : 'registry') as IResolvedSection['origin'],
      };
    });

  // Sections the methodology contributes regardless of registry. Note this uses
  // `additional`, not the leftover overlays: an overlay whose registry section
  // does not exist here is dropped, because it was written for a template this
  // document is not using.
  const templateKeys = new Set(templateSections.map((s) => s.key));
  const maxTemplateOrder = templateSections.reduce((max, s) => Math.max(max, s.order), 0);

  additional
    .filter((section) => !templateKeys.has(section.section))
    .forEach((section, index) => {
      resolved.push({
        key: section.section,
        title: section.section,
        order: section.order ?? maxTemplateOrder + 1 + index,
        required: true,
        contentType: section.contentType || 'narrative',
        promptFragment: mergeGuidance(undefined, section.promptFragment),
        origin: 'methodology',
      });
    });

  return resolved.sort((a, b) => a.order - b.order);
}

/**
 * The section keys, in document order — what CreateCaseDocument seeds from and
 * what generation iterates. Kept as its own function because that is the only
 * thing most callers want, and because it makes the call sites read as
 * "sections of this document" rather than "map over a merge".
 */
export function resolveSectionKeys(
  registry: IRegistryInterface | undefined,
  methodology: IMethodologyInterface
): string[] {
  return resolveSections(registry, methodology).map((section) => section.key);
}

/**
 * Adapter back to the shape GenerationService already consumes, so the merge
 * can be adopted without rewriting the generator in the same change. The
 * generator asks for guidance by section key and gets the merged fragment.
 */
export function resolveGuidance(
  registry: IRegistryInterface | undefined,
  methodology: IMethodologyInterface
): ISectionGuidance[] {
  return resolveSections(registry, methodology).map((section) => ({
    section: section.key,
    contentType: section.contentType,
    promptFragment: section.promptFragment,
  }));
}
