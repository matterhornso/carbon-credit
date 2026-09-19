import { Types } from 'mongoose';

/**
 * A validation finding as structured data.
 *
 * Why this is an aggregate rather than a field on a section
 * ---------------------------------------------------------
 * A finding recorded as prose, or as a PDF attachment from a VVB, teaches
 * nothing. The value of findings is entirely in the series: which sections
 * attract findings, under which methodology, against which kind of evidence
 * gap, and what resolved them. That question can only be asked of data that
 * outlives the section it was raised against and can be grouped across
 * projects — so a finding is its own record, pointing at the section and claim
 * that produced it rather than living inside them.
 *
 * This is the one asset a competitor cannot acquire by buying the same models.
 *
 * Why `origin` exists from the first version
 * ------------------------------------------
 * There is no real VVB in the loop yet, so every finding today comes from the
 * platform's own adversarial pre-validation pass. That is not a placeholder:
 * self-review findings are the series starting early. But a self-review finding
 * and a finding a validator actually raised are different evidence — the second
 * is ground truth about whether the first was right — so they are distinguished
 * at the point of capture rather than inferred later from a timestamp.
 *
 * Recording them in one shape is what makes the comparison possible at all:
 * "how many of our pre-validation findings did the VVB also raise, and what did
 * it raise that we missed" is the measure of whether pre-validation works.
 */

export interface IFindingInterface {
  tenantId?: string;
  projectId?: Types.ObjectId | string;

  // Where the finding lands. sectionKey matches ICaseSection.key, so a finding
  // survives the section being regenerated and can still be traced to it.
  sectionKey?: string;

  // The specific assertion the finding is about, quoted from the generated
  // content. Not a summary: a reviewer resolving this needs to find the exact
  // sentence, and a later analysis needs to group by what kind of claim fails.
  claim?: string;

  // What is wrong with it, in the reviewer's own terms.
  issue?: string;

  // What would resolve it. The difference between a finding that costs an hour
  // and one that costs a survey is entirely here, and it is the field a
  // developer actually plans against.
  remediation?: string;

  severity?: string;      // 'blocking' | 'material' | 'advisory'
  category?: string;      // see FINDING_CATEGORIES
  origin?: string;        // 'self_review' | 'vvb'
  status?: string;        // 'open' | 'accepted' | 'rejected' | 'resolved'

  // Set when status moves to resolved or rejected. Kept as free text because
  // the useful signal is what the team actually did, which is not enumerable
  // in advance — and because an unenumerable field is honest about that rather
  // than forcing a wrong category.
  resolutionNote?: string;

  // Denormalised so the series can be grouped without joining every project.
  // A finding's value is comparative, and the comparison is almost always
  // "this methodology, this section, across projects".
  methodologyCode?: string;

  raisedByUserId?: string;
  createdAt?: Date;
  resolvedAt?: Date;
}

/**
 * Severity, defined by what it costs rather than how it feels.
 *
 * The distinction that matters is blocking vs material: a blocking finding
 * means the case cannot be submitted as it stands, a material one means it can
 * be submitted and will probably come back. Collapsing them loses the only
 * decision a developer makes with this field.
 */
export const FINDING_SEVERITIES = {
  BLOCKING: 'blocking',   // submission would fail validation on this alone
  MATERIAL: 'material',   // likely to be raised by a VVB; costs a round trip
  ADVISORY: 'advisory',   // would strengthen the case; not a likely finding
} as const;

/**
 * Categories chosen to be answerable from the case itself, so the adversarial
 * pass can assign one without guessing. A category nobody can apply
 * consistently produces a series nobody can group.
 */
export const FINDING_CATEGORIES = {
  UNSUPPORTED_CLAIM: 'unsupported_claim',       // asserted with no citation
  EVIDENCE_GAP: 'evidence_gap',                 // cited, but the evidence does not exist yet
  METHODOLOGY_DEVIATION: 'methodology_deviation', // conflicts with the methodology's own rules
  INTERNAL_INCONSISTENCY: 'internal_inconsistency', // contradicts another section or the intake
  REGISTRY_REQUIREMENT: 'registry_requirement', // registry asks for something the section omits
  CALCULATION: 'calculation',                   // arithmetic or unit error
} as const;

export const FINDING_ORIGINS = {
  SELF_REVIEW: 'self_review',
  VVB: 'vvb',
} as const;

export const FINDING_STATUSES = {
  OPEN: 'open',
  ACCEPTED: 'accepted',   // agreed, will be fixed
  REJECTED: 'rejected',   // disagreed, with a reason
  RESOLVED: 'resolved',
} as const;
