/**
 * A carbon registry — Verra, Gold Standard, ACR, CAR, Puro, Isometric — as a
 * thing the platform models rather than a string it stores.
 *
 * Why this exists
 * ---------------
 * Before this, a methodology carried `standard: "VCS"` (a bare label with no
 * behaviour) and its own complete `sectionGuidance` array listing every section
 * of the document. Both seeded methodologies declared the same ten sections,
 * because both are Verra methodologies and those ten sections are the *VCS PDD
 * template* — not anything VM0047 or VMR0017 has an opinion about.
 *
 * That conflation has three consequences, and all three block "originate any
 * project type on any registry":
 *
 *   1. Fifty Verra methodologies means fifty hand-maintained copies of one
 *      section list. A change to the VCS template is a fifty-file edit, and
 *      nothing detects the copy that was missed.
 *   2. A Gold Standard methodology authored by copying an existing seed would
 *      silently inherit Verra's section list and produce a VCS-shaped document
 *      for a GS submission. Nothing in the code would notice.
 *   3. A methodology approved under two registries cannot be expressed at all,
 *      because its sections can only have one shape.
 *
 * The split
 * ---------
 * The registry owns the DOCUMENT: which sections exist, their order, their
 * titles, whether they are required, and what the registry expects in each.
 * The methodology owns the SCIENCE: what to say about this specific activity
 * type in each section it has something to say about.
 *
 * A methodology therefore no longer declares a section list. It declares
 * overlays against its registry's template, plus any section the methodology
 * itself adds. Resolution happens in RegistryTemplate.resolveSections.
 */

export interface IRegistryInterface {
  code?: string;
  name?: string;
  status?: string;
  documentTemplate?: IRegistryDocumentTemplate;
  rules?: IRegistryRules;
  sourceReference?: IRegistrySourceReference;
}

export interface IRegistryDocumentTemplate {
  // The name this registry gives the artefact. Verra calls it a PDD; Gold
  // Standard calls it a PDD too but structures it differently; Puro calls it a
  // Project Description. Surfacing the right word is the cheapest possible
  // signal to a customer that the platform actually knows their registry.
  documentName: string;
  sections: IRegistrySection[];
}

export interface IRegistrySection {
  key: string;
  title: string;
  order: number;
  required: boolean;
  // Default shape for this section. A methodology overlay may override it —
  // some registries leave a section's form to the methodology.
  contentType: string; // 'structured' | 'narrative'
  // What the REGISTRY wants here, independent of activity type. The
  // methodology's promptFragment is appended to this, not instead of it.
  registryGuidance: string;
}

/**
 * Registry-level rules that are not about the document's shape but about
 * whether a project is admissible at all. Modelled as data because they are
 * the questions a developer answers before committing capital, and because
 * they differ per registry for the same underlying project.
 */
export interface IRegistryRules {
  maxCreditingPeriodYears?: number;
  creditingPeriodRenewable?: boolean;
  // Verra permits registration up to 5 years after the start date (with
  // conditions); other registries differ. A project that misses this window is
  // not a project, so it belongs in screening rather than in a footnote.
  maxProjectStartBacklogYears?: number;
  bufferPoolApplies?: boolean;
  additionalityApproach?: string;
  validationRequired?: boolean;
  notes?: string;
}

export interface IRegistrySourceReference {
  name: string;
  url: string;
  publisher: string;
  version?: string;
}

/**
 * A methodology's overlay onto one of its registry's sections, or a section the
 * methodology adds. `section` matching a registry section key overlays it;
 * `section` matching nothing appends a methodology-specific section.
 */
export interface IMethodologySectionOverlay {
  section: string;
  promptFragment: string;
  contentType?: string;
  // Only meaningful for a section the methodology adds. Registry sections keep
  // the registry's order, because that is the order the reviewer reads in.
  order?: number;
}

/**
 * The output of merging a registry template with a methodology's overlays: the
 * section list actually used to seed a case document and drive generation.
 */
export interface IResolvedSection {
  key: string;
  title: string;
  order: number;
  required: boolean;
  contentType: string;
  promptFragment: string;
  // Provenance, kept because a reviewer asking "why does this document have
  // this section" deserves an answer, and because it makes the merge testable.
  origin: 'registry' | 'methodology' | 'registry+methodology';
}
