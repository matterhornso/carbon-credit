// Pins the monitoring period: the recurring half of a carbon project, and the
// constraint that actually caps portfolio size once drafting stops being it.
//
// Nothing here calls a model. Readiness is computed from the methodology's own
// declarations, exactly like the intake evidence-gap analyser, so it works with
// no LLM configured and cannot invent a requirement — a hallucinated monitoring
// parameter would send someone into a field to measure something nobody asked
// for.

import { expect } from 'chai';
import { CreateMonitoringPeriod, snapshotMonitoringPlan } from '../monitoring/CreateMonitoringPeriod';
import { analyseMonitoringReadiness, planPeriods } from '../../application/usecases/monitoring/MonitoringReadiness';
import { MONITORED_PARAMETER_STATUSES, MONITORING_PERIOD_STATUSES } from '../monitoring/monitoringInterface';
import { assertValidTransition } from '../../application/usecases/project_lifecycle/ProjectLifecycle';
import { PROJECT_STATUSES } from '../project/projectStatus';
import { VM0047_CENSUS_BASED } from '../../infrastructure/database/seed/methodology.seed';

const param = (over: any = {}) => ({
  parameter: 'Mortality rate (M_t)',
  unit: '%',
  frequency: 'Every 5 years or more frequently',
  method: 'Field survey of sampled planting units',
  status: MONITORED_PARAMETER_STATUSES.NOT_COLLECTED,
  evidenceDocumentIds: [],
  ...over,
});

const period = (parameters: any[], over: any = {}) => ({
  projectId: 'p1',
  periodNumber: 1,
  startDate: new Date('2027-01-01'),
  endDate: new Date('2028-01-01'),
  status: MONITORING_PERIOD_STATUSES.OPEN,
  parameters,
  ...over,
});

describe('Test monitoring period creation', () => {

  it('refuses a period that ends before it starts', () => {
    // Would silently produce negative durations downstream, and a verifier
    // would find it before we did.
    expect(() => new CreateMonitoringPeriod({
      projectId: 'p1', periodNumber: 1,
      startDate: new Date('2028-01-01'), endDate: new Date('2027-01-01'),
    })).to.throw(/endDate must be after startDate/);
  });

  it('refuses a period number below one', () => {
    expect(() => new CreateMonitoringPeriod({
      projectId: 'p1', periodNumber: 0,
      startDate: new Date('2027-01-01'), endDate: new Date('2028-01-01'),
    })).to.throw(/periodNumber must be 1 or greater/);
  });

  it('snapshots the methodology plan rather than referencing it', () => {
    // A methodology revised mid-crediting-period must not retroactively change
    // what an already-reported period was required to collect. A verifier reads
    // the period against the rules that applied when it ran.
    const snapshot = snapshotMonitoringPlan(VM0047_CENSUS_BASED.monitoringParameters);

    expect(snapshot).to.have.length((VM0047_CENSUS_BASED.monitoringParameters || []).length);
    expect(snapshot.every((p) => p.status === MONITORED_PARAMETER_STATUSES.NOT_COLLECTED)).to.equal(true);

    // Mutating the snapshot must not reach the seed.
    snapshot[0].parameter = 'MUTATED';
    expect(VM0047_CENSUS_BASED.monitoringParameters![0].parameter).to.not.equal('MUTATED');
  });

  it('carries the methodology frequency string through verbatim', () => {
    // Deliberately not parsed into a schedule: the real strings are
    // conditional free text, and a fabricated due date is worse than none
    // because a developer plans against it.
    const snapshot = snapshotMonitoringPlan(VM0047_CENSUS_BASED.monitoringParameters);
    const original = VM0047_CENSUS_BASED.monitoringParameters![0].frequency;

    expect(snapshot[0].frequency).to.equal(original);
  });
});

describe('Test monitoring readiness', () => {

  it('blocks on every parameter that has not been collected', () => {
    const readiness = analyseMonitoringReadiness(period([param(), param({ parameter: 'Area burned' })]));

    expect(readiness.readyToReport).to.equal(false);
    expect(readiness.counts.outstanding).to.equal(2);
    expect(readiness.gaps).to.have.length(2);
    expect(readiness.gaps.every((g) => g.severity === 'blocking')).to.equal(true);
  });

  it('blocks a parameter marked collected that carries no value', () => {
    // The status was advanced without the data — which reads as done on a
    // dashboard and is empty in the report.
    const readiness = analyseMonitoringReadiness(period([
      param({ status: MONITORED_PARAMETER_STATUSES.COLLECTED, evidenceDocumentIds: ['doc-1'] }),
    ]));

    expect(readiness.readyToReport).to.equal(false);
    expect(readiness.gaps[0].summary).to.include('carries no value');
  });

  it('blocks a parameter excused with no reason', () => {
    // "We decided it did not apply" is the finding a verifier writes first.
    const readiness = analyseMonitoringReadiness(period([
      param({ status: MONITORED_PARAMETER_STATUSES.NOT_APPLICABLE }),
    ]));

    expect(readiness.readyToReport).to.equal(false);
    expect(readiness.gaps[0].summary).to.include('not applicable with no reason');
  });

  it('accepts a parameter excused with a reason', () => {
    const readiness = analyseMonitoringReadiness(period([
      param({ status: MONITORED_PARAMETER_STATUSES.NOT_APPLICABLE, notApplicableReason: 'No fertilizer was applied in this period.' }),
    ]));

    expect(readiness.readyToReport).to.equal(true);
    expect(readiness.counts.notApplicable).to.equal(1);
    expect(readiness.gaps).to.deep.equal([]);
  });

  it('warns without blocking when a value has no evidence', () => {
    // The most common reason a monitoring report comes back — but blocking on
    // it would stall on parameters the methodology itself treats as derivable.
    const readiness = analyseMonitoringReadiness(period([
      param({ status: MONITORED_PARAMETER_STATUSES.COLLECTED, value: '4.2' }),
    ]));

    expect(readiness.readyToReport).to.equal(true);
    expect(readiness.gaps).to.have.length(1);
    expect(readiness.gaps[0].severity).to.equal('advisory');
    expect(readiness.counts.collectedWithoutEvidence).to.equal(1);
  });

  it('is ready when every parameter is collected with a value and evidence', () => {
    const readiness = analyseMonitoringReadiness(period([
      param({ status: MONITORED_PARAMETER_STATUSES.COLLECTED, value: '4.2', evidenceDocumentIds: ['doc-1'] }),
    ]));

    expect(readiness.readyToReport).to.equal(true);
    expect(readiness.gaps).to.deep.equal([]);
    expect(readiness.counts.collected).to.equal(1);
  });

  it('orders blocking gaps above advisory ones', () => {
    const readiness = analyseMonitoringReadiness(period([
      param({ parameter: 'no evidence', status: MONITORED_PARAMETER_STATUSES.COLLECTED, value: '1' }),
      param({ parameter: 'not collected' }),
    ]));

    expect(readiness.gaps[0].severity).to.equal('blocking');
    expect(readiness.gaps[1].severity).to.equal('advisory');
  });

  it('carries the frequency onto every gap, so the reader knows the cadence', () => {
    const readiness = analyseMonitoringReadiness(period([param()]));
    expect(readiness.gaps[0].frequency).to.equal('Every 5 years or more frequently');
  });

  it('reports a period with no parameters as ready rather than failing', () => {
    // A methodology declaring no monitoring parameters is unusual but valid,
    // and must not deadlock the period.
    const readiness = analyseMonitoringReadiness(period([]));
    expect(readiness.readyToReport).to.equal(true);
    expect(readiness.counts.total).to.equal(0);
  });
});

describe('Test crediting period planning', () => {

  it('splits a crediting period into annual periods', () => {
    const periods = planPeriods(new Date('2027-01-01'), 3);

    expect(periods).to.have.length(3);
    expect(periods[0].periodNumber).to.equal(1);
    expect(periods[0].startDate.toISOString().slice(0, 10)).to.equal('2027-01-01');
    expect(periods[2].endDate.toISOString().slice(0, 10)).to.equal('2030-01-01');
  });

  it('numbers periods contiguously from one', () => {
    const periods = planPeriods(new Date('2027-01-01'), 5);
    expect(periods.map((p) => p.periodNumber)).to.deep.equal([1, 2, 3, 4, 5]);
  });

  it('supports a non-annual cadence without inventing one', () => {
    // A developer reporting biennially overrides the length; the platform does
    // not guess a cadence from the methodology's free-text frequencies.
    const periods = planPeriods(new Date('2027-01-01'), 4, 24);
    expect(periods).to.have.length(2);
  });

  it('clips the final period to the crediting period end', () => {
    // Crediting stops at the boundary whatever the cadence. A period running
    // past it would claim reductions nobody can issue.
    const periods = planPeriods(new Date('2027-01-01'), 5, 24);

    expect(periods).to.have.length(3);
    expect(periods[2].endDate.toISOString().slice(0, 10)).to.equal('2032-01-01');
  });

  it('refuses an invalid start date or crediting length', () => {
    expect(() => planPeriods(new Date('not a date'), 3)).to.throw(/valid crediting period start/);
    expect(() => planPeriods(new Date('2027-01-01'), 0)).to.throw(/at least one year/);
    expect(() => planPeriods(new Date('2027-01-01'), 3, 0)).to.throw(/at least one month/);
  });
});

describe('Test the lifecycle past verification', () => {

  it('lets a verified project be registered', () => {
    // VERIFIED used to be terminal, which put the end of the lifecycle exactly
    // where a developer's recurring work begins.
    expect(() => assertValidTransition(PROJECT_STATUSES.VERIFIED, PROJECT_STATUSES.REGISTERED)).to.not.throw();
  });

  it('runs registered -> monitoring -> crediting period closed', () => {
    expect(() => assertValidTransition(PROJECT_STATUSES.REGISTERED, PROJECT_STATUSES.MONITORING)).to.not.throw();
    expect(() => assertValidTransition(PROJECT_STATUSES.MONITORING, PROJECT_STATUSES.CREDITING_PERIOD_CLOSED)).to.not.throw();
  });

  it('treats a closed crediting period as genuinely terminal', () => {
    expect(() => assertValidTransition(PROJECT_STATUSES.CREDITING_PERIOD_CLOSED, PROJECT_STATUSES.MONITORING)).to.throw(/Cannot transition/);
  });

  it('does not let a project skip registration', () => {
    expect(() => assertValidTransition(PROJECT_STATUSES.VERIFIED, PROJECT_STATUSES.MONITORING)).to.throw(/Cannot transition/);
  });

  it('keeps every prior transition working', () => {
    // Guards the extension against having quietly rewritten the origination
    // path it was appended to.
    expect(() => assertValidTransition(PROJECT_STATUSES.DRAFT_INTAKE, PROJECT_STATUSES.METHODOLOGY_SELECTED)).to.not.throw();
    expect(() => assertValidTransition(PROJECT_STATUSES.ISSUER_FINALIZED, PROJECT_STATUSES.EXPORTED_FOR_VERIFICATION)).to.not.throw();
  });
});
