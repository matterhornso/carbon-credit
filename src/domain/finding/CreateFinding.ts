import {
  IFindingInterface,
  FINDING_SEVERITIES,
  FINDING_CATEGORIES,
  FINDING_ORIGINS,
  FINDING_STATUSES,
} from './findingInterface';

const SEVERITIES = Object.values(FINDING_SEVERITIES) as string[];
const CATEGORIES = Object.values(FINDING_CATEGORIES) as string[];
const ORIGINS = Object.values(FINDING_ORIGINS) as string[];

export class CreateFinding implements IFindingInterface {
  projectId!: string;
  sectionKey!: string;
  claim!: string;
  issue!: string;
  remediation?: string;
  severity!: string;
  category!: string;
  origin!: string;
  status!: string;
  methodologyCode?: string;
  raisedByUserId?: string;

  constructor(finding: IFindingInterface) {
    if (!finding.projectId) throw new Error('projectId missing!');
    if (!finding.sectionKey) throw new Error('sectionKey missing!');
    if (!finding.issue) throw new Error('issue missing!');

    // A finding with no claim cannot be acted on: the whole point is that a
    // reviewer can find the sentence at issue. "The additionality section is
    // weak" is a complaint, not a finding.
    if (!finding.claim) throw new Error('claim missing!');

    // Severity and category are validated rather than defaulted. Defaulting
    // them would let an unparseable model response quietly become a uniform
    // pile of 'advisory' / 'unsupported_claim' rows, and the series would be
    // measuring the default rather than the case.
    if (!finding.severity || !SEVERITIES.includes(finding.severity)) {
      throw new Error(`severity must be one of ${SEVERITIES.join(', ')} — got '${finding.severity}'`);
    }
    if (!finding.category || !CATEGORIES.includes(finding.category)) {
      throw new Error(`category must be one of ${CATEGORIES.join(', ')} — got '${finding.category}'`);
    }
    if (!finding.origin || !ORIGINS.includes(finding.origin)) {
      throw new Error(`origin must be one of ${ORIGINS.join(', ')} — got '${finding.origin}'`);
    }

    this.projectId = finding.projectId as string;
    this.sectionKey = finding.sectionKey;
    this.claim = finding.claim;
    this.issue = finding.issue;
    this.remediation = finding.remediation;
    this.severity = finding.severity;
    this.category = finding.category;
    this.origin = finding.origin;
    this.status = finding.status || FINDING_STATUSES.OPEN;
    this.methodologyCode = finding.methodologyCode;
    this.raisedByUserId = finding.raisedByUserId;
  }
}
