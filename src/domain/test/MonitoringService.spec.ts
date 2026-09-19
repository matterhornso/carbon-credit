// Pins MonitoringService orchestration: opening a schedule idempotently,
// letting a period's status follow its data rather than being set by hand, and
// refusing to submit an incomplete report.
//
// No model anywhere. Everything here is determined by the methodology's own
// declarations, which is what makes it safe to compute rather than generate.

import { expect } from 'chai';
import { MonitoringService } from '../../application/usecases/monitoring/MonitoringService';
import { MONITORING_PERIOD_STATUSES, MONITORED_PARAMETER_STATUSES } from '../monitoring/monitoringInterface';
import { PROJECT_STATUSES } from '../project/projectStatus';
import { VM0047_CENSUS_BASED } from '../../infrastructure/database/seed/methodology.seed';

const ACTOR = { userId: 'user-1', role: 'ISSUER' };
const PROJECT_ID = 'project-1';

class FakeMonitoringRepository {
  public periods: any[] = [];
  private nextId = 1;

  async createPeriod(p: any) {
    const row = { ...p, _id: `period-${this.nextId++}`, parameters: p.parameters.map((x: any) => ({ ...x })) };
    this.periods.push(row);
    return row;
  }
  async getPeriodsByProjectId(projectId: string) {
    return this.periods.filter((p) => String(p.projectId) === projectId).sort((a, b) => a.periodNumber - b.periodNumber);
  }
  async getPeriodById(id: string) { return this.periods.find((p) => p._id === id) || null; }
  async updateParameter(id: string, name: string, update: any) {
    const period = this.periods.find((p) => p._id === id);
    if (!period) return null;
    const target = period.parameters.find((x: any) => x.parameter === name);
    if (!target) return null;
    for (const [k, v] of Object.entries(update)) {
      if (v === undefined) delete target[k]; else target[k] = v;
    }
    return period;
  }
  async updatePeriodStatus(id: string, status: string, extra?: any) {
    const period = this.periods.find((p) => p._id === id);
    if (!period) return null;
    Object.assign(period, { status }, extra || {});
    return period;
  }
}

class FakeProjectRepository {
  public transitions: string[] = [];
  constructor(public project: any) {}
  async getProjectById() { return this.project; }
  async transitionStatus(_id: string, status: string) {
    this.transitions.push(status);
    this.project.status = status;
    return this.project;
  }
  async createProject(): Promise<any> { throw new Error('not used'); }
  async updateProject(): Promise<any> { throw new Error('not used'); }
  async setCaseDocumentId(): Promise<any> { throw new Error('not used'); }
  async addAttachment(): Promise<any> { throw new Error('not used'); }
  async getAllProjects(): Promise<any> { throw new Error('not used'); }
}

class FakeMethodologyRepository {
  async getMethodologyById() { return VM0047_CENSUS_BASED; }
  async createMethodology(): Promise<any> { throw new Error('not used'); }
  async getAllMethodologies(): Promise<any> { throw new Error('not used'); }
  async getMethodologyByCode(): Promise<any> { throw new Error('not used'); }
}

class FakeAuditEventRepository {
  public events: any[] = [];
  async createAuditEvent(e: any) { this.events.push(e); return e; }
  async getEventsByProjectId() { return this.events; }
}

function buildHarness(over: any = {}) {
  const project: any = {
    _id: PROJECT_ID,
    status: PROJECT_STATUSES.REGISTERED,
    methodologyId: VM0047_CENSUS_BASED,
    intake: { projectStartDate: '2027-01-01', creditingPeriodYears: 3 },
    ...over,
  };
  const monitoringRepository = new FakeMonitoringRepository();
  const projectRepository = new FakeProjectRepository(project);
  const auditEventRepository = new FakeAuditEventRepository();
  const service = new MonitoringService(
    projectRepository as any,
    new FakeMethodologyRepository() as any,
    monitoringRepository as any,
    auditEventRepository as any
  );
  return { service, monitoringRepository, projectRepository, auditEventRepository, project };
}

const PARAM_COUNT = (VM0047_CENSUS_BASED.monitoringParameters || []).length;
const FIRST_PARAM = (VM0047_CENSUS_BASED.monitoringParameters || [])[0].parameter;

describe('Test MonitoringService', () => {

  describe('opening the schedule', () => {

    it('opens one period per crediting year and moves the project to monitoring', async () => {
      const { service, monitoringRepository, projectRepository } = buildHarness();
      const opened = await service.openPeriods(PROJECT_ID, ACTOR);

      expect(opened).to.have.length(3);
      expect(monitoringRepository.periods.map((p) => p.periodNumber)).to.deep.equal([1, 2, 3]);
      expect(projectRepository.transitions).to.deep.equal([PROJECT_STATUSES.MONITORING]);
    });

    it('snapshots the methodology plan onto every period', async () => {
      const { service, monitoringRepository } = buildHarness();
      await service.openPeriods(PROJECT_ID, ACTOR);

      expect(monitoringRepository.periods.every((p) => p.parameters.length === PARAM_COUNT)).to.equal(true);
      expect(monitoringRepository.periods[0].parameters[0].status).to.equal(MONITORED_PARAMETER_STATUSES.NOT_COLLECTED);
    });

    it('is idempotent, and adds only the periods an extension introduces', async () => {
      // A crediting period extended by a registry is a real event. Re-running
      // must add the new years rather than fail or duplicate the old ones.
      const { service, monitoringRepository, project } = buildHarness();
      await service.openPeriods(PROJECT_ID, ACTOR);

      project.intake.creditingPeriodYears = 5;
      const second = await service.openPeriods(PROJECT_ID, ACTOR);

      expect(second.map((p) => p.periodNumber)).to.deep.equal([4, 5]);
      expect(monitoringRepository.periods).to.have.length(5);
    });

    it('refuses to open periods for a project that is not registered', async () => {
      const { service } = buildHarness({ status: PROJECT_STATUSES.EXPORTED_FOR_VERIFICATION });
      let message = '';
      try { await service.openPeriods(PROJECT_ID, ACTOR); } catch (e: any) { message = e.message; }
      expect(message).to.match(/only be opened for a registered project/);
    });

    it('refuses a project with no crediting period length', async () => {
      const { service } = buildHarness({ intake: { projectStartDate: '2027-01-01' } });
      let message = '';
      try { await service.openPeriods(PROJECT_ID, ACTOR); } catch (e: any) { message = e.message; }
      expect(message).to.match(/no crediting period length/);
    });
  });

  describe('recording data', () => {

    it('lets the period status follow the data rather than being set by hand', async () => {
      // "Ready" must always mean the readiness check actually passes, or a
      // dashboard can say ready while the report is empty.
      const { service, monitoringRepository } = buildHarness();
      await service.openPeriods(PROJECT_ID, ACTOR);
      const period = monitoringRepository.periods[0];

      // Record every parameter but one.
      for (const p of period.parameters.slice(0, -1)) {
        await service.recordParameter(period._id, p.parameter, { value: '1', evidenceDocumentIds: ['doc'] }, ACTOR);
      }
      expect(monitoringRepository.periods[0].status).to.equal(MONITORING_PERIOD_STATUSES.OPEN);

      const last = period.parameters[period.parameters.length - 1];
      const updated = await service.recordParameter(period._id, last.parameter, { value: '1', evidenceDocumentIds: ['doc'] }, ACTOR);
      expect(updated.status).to.equal(MONITORING_PERIOD_STATUSES.REPORT_READY);
    });

    it('clears a previous exclusion when a value is later recorded', async () => {
      // Recording a value means the parameter applied after all; leaving the
      // old reason behind would contradict the data next to it.
      const { service, monitoringRepository } = buildHarness();
      await service.openPeriods(PROJECT_ID, ACTOR);
      const period = monitoringRepository.periods[0];

      await service.recordParameter(period._id, FIRST_PARAM, { notApplicableReason: 'not applicable this year' }, ACTOR);
      expect(period.parameters[0].notApplicableReason).to.equal('not applicable this year');

      await service.recordParameter(period._id, FIRST_PARAM, { value: '4.2' }, ACTOR);
      expect(period.parameters[0].status).to.equal(MONITORED_PARAMETER_STATUSES.COLLECTED);
      expect(period.parameters[0].notApplicableReason).to.equal(undefined);
    });

    it('refuses a parameter the period never had to collect', async () => {
      // The snapshot is the authority. Accepting a typo would create a silent
      // orphan that never appears in readiness.
      const { service, monitoringRepository } = buildHarness();
      await service.openPeriods(PROJECT_ID, ACTOR);

      let message = '';
      try { await service.recordParameter(monitoringRepository.periods[0]._id, 'Invented parameter', { value: '1' }, ACTOR); }
      catch (e: any) { message = e.message; }
      expect(message).to.match(/is not a monitoring parameter/);
    });

    it('refuses to edit a period that has already been submitted', async () => {
      // A submitted period is a statement already made to someone else.
      const { service, monitoringRepository } = buildHarness();
      await service.openPeriods(PROJECT_ID, ACTOR);
      const period = monitoringRepository.periods[0];
      await monitoringRepository.updatePeriodStatus(period._id, MONITORING_PERIOD_STATUSES.SUBMITTED);

      let message = '';
      try { await service.recordParameter(period._id, FIRST_PARAM, { value: '1' }, ACTOR); }
      catch (e: any) { message = e.message; }
      expect(message).to.match(/can no longer be edited/);
    });
  });

  describe('submitting', () => {

    it('refuses an incomplete period and names what is outstanding', async () => {
      // The alternative is sending a verifier an incomplete report and paying
      // for the round trip to learn that.
      const { service, monitoringRepository } = buildHarness();
      await service.openPeriods(PROJECT_ID, ACTOR);

      let message = '';
      try { await service.submitPeriod(monitoringRepository.periods[0]._id, ACTOR); }
      catch (e: any) { message = e.message; }

      expect(message).to.match(/not ready to report/);
      expect(message).to.include(FIRST_PARAM);
    });

    it('submits a complete period and records how many values lacked evidence', async () => {
      const { service, monitoringRepository, auditEventRepository } = buildHarness();
      await service.openPeriods(PROJECT_ID, ACTOR);
      const period = monitoringRepository.periods[0];

      // Values with no evidence: advisory, so submission is allowed — but the
      // count travels into the audit trail, because it is the most common
      // reason a report comes back.
      for (const p of period.parameters) {
        await service.recordParameter(period._id, p.parameter, { value: '1' }, ACTOR);
      }
      const submitted = await service.submitPeriod(period._id, ACTOR);

      expect(submitted.status).to.equal(MONITORING_PERIOD_STATUSES.SUBMITTED);
      const event = auditEventRepository.events.find((e) => e.eventType === 'MONITORING_PERIOD_SUBMITTED');
      expect(event.after.collectedWithoutEvidence).to.equal(PARAM_COUNT);
    });
  });
});
