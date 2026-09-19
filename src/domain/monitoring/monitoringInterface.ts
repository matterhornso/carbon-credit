import { Types } from 'mongoose';

/**
 * A monitoring period: one reporting cycle in a project's crediting period.
 *
 * Why this is the phase that caps portfolio size
 * ----------------------------------------------
 * Origination happens once per project. Monitoring recurs every year for the
 * whole crediting period — twenty or forty years for land use. A pipeline ten
 * times larger becomes a monitoring load ten times larger *and still growing*,
 * permanently, because last year's projects do not stop needing attention when
 * this year's arrive. Everything the platform does today stops at export, which
 * is the point where that load begins.
 *
 * What this deliberately does NOT do
 * ----------------------------------
 * It does not derive a schedule from the methodology's stated frequencies. Real
 * frequency strings look like this, taken from the seeded methodologies:
 *
 *   "At least every 5 years, or before each verification if applied more frequently"
 *   "Continuous measurement, aggregated at least monthly"
 *   "Per crediting period, or on publication of a revised default"
 *
 * Those are conditional, disjunctive, and in one case depend on an external
 * publication event. Parsing them into dates would be false precision of
 * exactly the kind this platform exists to avoid — a fabricated due date is
 * worse than none, because a developer plans against it.
 *
 * So the frequency is carried verbatim to the person who has to act on it, and
 * what the platform tracks instead is the thing it can actually know: for this
 * period, which required parameters have data and which do not.
 */

export interface IMonitoringPeriodInterface {
  tenantId?: string;
  projectId?: Types.ObjectId | string;

  // 1-based, in crediting-period order. The number a verifier refers to.
  periodNumber?: number;
  startDate?: Date;
  endDate?: Date;

  status?: string;

  // One entry per monitoring parameter the methodology declares, resolved when
  // the period is opened. Snapshotted rather than read live from the
  // methodology, because a methodology revised mid-crediting-period must not
  // silently change what an already-reported period was required to collect.
  parameters?: IMonitoredParameter[];

  // Set when the period reaches issuance. Nothing on this record computes it;
  // it records the registry's outcome.
  issuedVolume?: number;      // tCO2e
  vintage?: string;

  notes?: string;
  createdAt?: Date;
}

export interface IMonitoredParameter {
  // Copied from IMonitoringParameter at period open.
  parameter: string;
  unit?: string;
  frequency: string;   // verbatim from the methodology — see the note above
  method: string;

  status?: string;     // 'not_collected' | 'collected' | 'not_applicable'
  value?: string;      // as reported, kept as text because units and forms vary
  // Evidence for this parameter, as SourceDocument ids. A collected parameter
  // with no evidence is a claim, which is the failure mode monitoring reports
  // are most often rejected for.
  evidenceDocumentIds?: string[];
  collectedAt?: Date;
  collectedByUserId?: string;
  // Why a parameter does not apply to this period. Required when the status is
  // not_applicable: "we decided it did not apply" is a finding unless the
  // reason is on the record.
  notApplicableReason?: string;
}

export const MONITORING_PERIOD_STATUSES = {
  OPEN: 'open',                   // collecting data
  REPORT_READY: 'report_ready',   // every required parameter accounted for
  SUBMITTED: 'submitted',         // sent for verification
  VERIFIED: 'verified',
  ISSUED: 'issued',
} as const;

export const MONITORED_PARAMETER_STATUSES = {
  NOT_COLLECTED: 'not_collected',
  COLLECTED: 'collected',
  NOT_APPLICABLE: 'not_applicable',
} as const;

/**
 * What a period still needs before it can be reported. The monitoring
 * equivalent of the evidence-gap report at intake, and rule-based for the same
 * reason: it is computed from the methodology's own declarations, so it works
 * with no model configured and cannot hallucinate a requirement.
 */
export interface IMonitoringReadiness {
  periodNumber: number;
  readyToReport: boolean;
  counts: {
    total: number;
    collected: number;
    notApplicable: number;
    outstanding: number;
    collectedWithoutEvidence: number;
  };
  gaps: IMonitoringGap[];
}

export interface IMonitoringGap {
  parameter: string;
  severity: 'blocking' | 'advisory';
  summary: string;
  whatToProvide: string;
  frequency: string;
}
