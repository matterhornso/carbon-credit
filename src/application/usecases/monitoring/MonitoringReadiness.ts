import {
  IMonitoringPeriodInterface,
  IMonitoredParameter,
  IMonitoringReadiness,
  IMonitoringGap,
  MONITORED_PARAMETER_STATUSES,
} from '../../../domain/monitoring/monitoringInterface';

/**
 * What a monitoring period still has to collect before it can be reported.
 *
 * Rule-based, with no model call, for the same reason the intake evidence-gap
 * analyser is: it is computed entirely from the methodology's own declarations,
 * so it works with no LLM configured and it cannot invent a requirement that
 * the methodology does not state. A hallucinated monitoring requirement would
 * send someone into a field to measure something nobody asked for.
 */

function isCollected(p: IMonitoredParameter): boolean {
  return p.status === MONITORED_PARAMETER_STATUSES.COLLECTED;
}

function isNotApplicable(p: IMonitoredParameter): boolean {
  return p.status === MONITORED_PARAMETER_STATUSES.NOT_APPLICABLE;
}

function hasEvidence(p: IMonitoredParameter): boolean {
  return (p.evidenceDocumentIds || []).length > 0;
}

function hasValue(p: IMonitoredParameter): boolean {
  return p.value !== undefined && p.value !== null && String(p.value).trim() !== '';
}

export function analyseMonitoringReadiness(period: IMonitoringPeriodInterface): IMonitoringReadiness {
  const parameters = period.parameters || [];
  const gaps: IMonitoringGap[] = [];

  for (const p of parameters) {
    // A parameter excused without a reason is the finding a verifier writes
    // first. "We decided it did not apply" has to be on the record.
    if (isNotApplicable(p)) {
      if (!p.notApplicableReason || !p.notApplicableReason.trim()) {
        gaps.push({
          parameter: p.parameter,
          severity: 'blocking',
          summary: `'${p.parameter}' is marked not applicable with no reason recorded.`,
          whatToProvide: 'State why this parameter does not apply to this period. An unexplained exclusion is a finding.',
          frequency: p.frequency,
        });
      }
      continue;
    }

    if (!isCollected(p)) {
      gaps.push({
        parameter: p.parameter,
        severity: 'blocking',
        summary: `'${p.parameter}' has not been collected for this period.`,
        whatToProvide: `Record the measured value${p.unit ? ` in ${p.unit}` : ''} using: ${p.method}`,
        frequency: p.frequency,
      });
      continue;
    }

    // Collected but empty — the status was advanced without the data.
    if (!hasValue(p)) {
      gaps.push({
        parameter: p.parameter,
        severity: 'blocking',
        summary: `'${p.parameter}' is marked collected but carries no value.`,
        whatToProvide: `Record the measured value${p.unit ? ` in ${p.unit}` : ''}, or set the parameter back to not collected.`,
        frequency: p.frequency,
      });
      continue;
    }

    // Collected, with a value, but nothing to back it. Advisory rather than
    // blocking because some parameters are legitimately self-evident from the
    // project record — but it is the single most common reason a monitoring
    // report comes back, so it is always surfaced.
    if (!hasEvidence(p)) {
      gaps.push({
        parameter: p.parameter,
        severity: 'advisory',
        summary: `'${p.parameter}' has a reported value with no supporting evidence attached.`,
        whatToProvide: 'Attach the measurement record, log export, or survey that produced this value. A value without a source is a claim.',
        frequency: p.frequency,
      });
    }
  }

  const collected = parameters.filter(isCollected).length;
  const notApplicable = parameters.filter(isNotApplicable).length;
  const collectedWithoutEvidence = parameters.filter((p) => isCollected(p) && hasValue(p) && !hasEvidence(p)).length;
  const outstanding = parameters.length - collected - notApplicable;

  return {
    periodNumber: period.periodNumber || 0,
    // Advisory gaps do not block. A monitoring report that cannot be submitted
    // until every value has a document attached would stall on parameters the
    // methodology itself treats as derivable.
    readyToReport: gaps.every((g) => g.severity !== 'blocking'),
    counts: {
      total: parameters.length,
      collected,
      notApplicable,
      outstanding,
      collectedWithoutEvidence,
    },
    // Blocking first: the list is read top-down by someone deciding what to do
    // next, and an advisory above a blocker wastes the first thing they read.
    gaps: gaps.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'blocking' ? -1 : 1)),
  };
}

/**
 * Split a crediting period into annual monitoring periods.
 *
 * Annual by default because that is the common reporting cadence and because
 * the alternative — deriving a cadence from the methodology's frequency strings
 * — is not possible: they are conditional free text ("at least every 5 years,
 * or before each verification if applied more frequently"). A developer who
 * reports on a different cadence overrides the length rather than being handed
 * a fabricated schedule.
 */
export function planPeriods(
  creditingStart: Date,
  creditingYears: number,
  periodLengthMonths: number = 12
): { periodNumber: number; startDate: Date; endDate: Date }[] {
  if (!creditingStart || isNaN(new Date(creditingStart).getTime())) {
    throw new Error('planPeriods requires a valid crediting period start date');
  }
  if (!creditingYears || creditingYears < 1) {
    throw new Error('planPeriods requires a crediting period of at least one year');
  }
  if (periodLengthMonths < 1) {
    throw new Error('planPeriods requires a period length of at least one month');
  }

  const start = new Date(creditingStart);
  const totalMonths = creditingYears * 12;
  const periods: { periodNumber: number; startDate: Date; endDate: Date }[] = [];

  let periodNumber = 1;
  for (let offset = 0; offset < totalMonths; offset += periodLengthMonths) {
    const periodStart = new Date(start);
    periodStart.setMonth(periodStart.getMonth() + offset);

    const periodEnd = new Date(start);
    // The final period is clipped to the crediting period's end rather than
    // running past it: crediting stops at the boundary whatever the cadence,
    // and a period extending beyond it would claim reductions nobody can issue.
    periodEnd.setMonth(periodEnd.getMonth() + Math.min(offset + periodLengthMonths, totalMonths));

    periods.push({ periodNumber, startDate: periodStart, endDate: periodEnd });
    periodNumber += 1;
  }

  return periods;
}
