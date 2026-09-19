import { IProjectRepository } from "../../repositories/IProjectRepository";
import { IMethodologyRepository } from "../../repositories/IMethodologyRepository";
import { IMonitoringRepository } from "../../repositories/IMonitoringRepository";
import { IAuditEventRepository } from "../../repositories/IAuditEventRepository";
import { CreateMonitoringPeriod, snapshotMonitoringPlan } from "../../../domain/monitoring/CreateMonitoringPeriod";
import {
  IMonitoringPeriodInterface,
  IMonitoringReadiness,
  MONITORING_PERIOD_STATUSES,
  MONITORED_PARAMETER_STATUSES,
} from "../../../domain/monitoring/monitoringInterface";
import { analyseMonitoringReadiness, planPeriods } from "./MonitoringReadiness";
import { AuditEventUseCase } from "../index";
import { AuditEvent } from "../../../domain";
import { PROJECT_STATUSES } from "../../../domain/project/projectStatus";

export interface IMonitoringActor {
  userId: string;
  role: string;
}

/**
 * The recurring half of a carbon project.
 *
 * Everything here is rule-based — no model call anywhere. What a period needs
 * is entirely determined by the methodology's own declarations, so inventing
 * any of it would be worse than useless: a hallucinated monitoring requirement
 * sends someone into a field to measure something nobody asked for.
 */
export class MonitoringService {
  private auditEventUseCase: AuditEventUseCase;

  constructor(
    private projectRepository: IProjectRepository,
    private methodologyRepository: IMethodologyRepository,
    private monitoringRepository: IMonitoringRepository,
    auditEventRepository: IAuditEventRepository
  ) {
    this.auditEventUseCase = new AuditEventUseCase(auditEventRepository);
  }

  /**
   * Open the full schedule of monitoring periods for a registered project.
   *
   * Idempotent: called again, it opens only the periods that do not exist yet.
   * A crediting period extended by a registry is a real event, and re-running
   * this must add the new years rather than fail or duplicate the old ones.
   */
  async openPeriods(
    projectId: string,
    actor: IMonitoringActor,
    options: { periodLengthMonths?: number } = {}
  ): Promise<IMonitoringPeriodInterface[]> {
    const { project, methodology } = await this.loadContext(projectId);

    if (project.status !== PROJECT_STATUSES.REGISTERED && project.status !== PROJECT_STATUSES.MONITORING) {
      throw new Error(`Monitoring periods can only be opened for a registered project — this one is '${project.status}'`);
    }

    const start = project.creditingPeriod?.start || project.intake?.projectStartDate;
    const years = Number(project.intake?.creditingPeriodYears);
    if (!start) throw new Error('Project has no crediting period start date');
    if (!years || years < 1) throw new Error('Project has no crediting period length');

    const planned = planPeriods(new Date(start), years, options.periodLengthMonths || 12);
    const existing = await this.monitoringRepository.getPeriodsByProjectId(projectId);
    const existingNumbers = new Set(existing.map((p) => p.periodNumber));

    // The plan is snapshotted once per period at open, so periods opened later
    // (after a crediting extension) carry the methodology as it stands then —
    // which is correct: they are governed by the rules in force when they run.
    const opened: IMonitoringPeriodInterface[] = [];
    for (const p of planned) {
      if (existingNumbers.has(p.periodNumber)) continue;
      opened.push(await this.monitoringRepository.createPeriod(new CreateMonitoringPeriod({
        projectId,
        periodNumber: p.periodNumber,
        startDate: p.startDate,
        endDate: p.endDate,
        parameters: snapshotMonitoringPlan(methodology.monitoringParameters),
      })));
    }

    if (opened.length) {
      await this.recordAudit(projectId, actor, 'MONITORING_PERIODS_OPENED', undefined, {
        opened: opened.map((p) => p.periodNumber),
        alreadyOpen: existing.length,
      });
    }

    if (project.status === PROJECT_STATUSES.REGISTERED) {
      await this.projectRepository.transitionStatus(projectId, PROJECT_STATUSES.MONITORING);
    }

    return opened;
  }

  async getPeriods(projectId: string): Promise<IMonitoringPeriodInterface[]> {
    return await this.monitoringRepository.getPeriodsByProjectId(projectId);
  }

  async getReadiness(periodId: string): Promise<IMonitoringReadiness> {
    const period = await this.monitoringRepository.getPeriodById(periodId);
    if (!period) throw new Error(`Monitoring period '${periodId}' not found`);
    return analyseMonitoringReadiness(period);
  }

  /**
   * Record a measurement, or mark a parameter as not applicable with a reason.
   */
  async recordParameter(
    periodId: string,
    parameterName: string,
    input: { value?: string; evidenceDocumentIds?: string[]; notApplicableReason?: string },
    actor: IMonitoringActor
  ): Promise<IMonitoringPeriodInterface> {
    const period = await this.monitoringRepository.getPeriodById(periodId);
    if (!period) throw new Error(`Monitoring period '${periodId}' not found`);

    // A submitted or verified period is a statement already made to someone
    // else. Editing it in place would change what they reviewed without any
    // record that it changed.
    if (period.status !== MONITORING_PERIOD_STATUSES.OPEN && period.status !== MONITORING_PERIOD_STATUSES.REPORT_READY) {
      throw new Error(`Period ${period.periodNumber} is '${period.status}' and can no longer be edited`);
    }

    const known = (period.parameters || []).some((p) => p.parameter === parameterName);
    if (!known) {
      // The snapshot is the authority on what this period had to collect.
      // Accepting an unknown parameter would let a typo create a silent
      // orphan that never appears in readiness.
      throw new Error(`'${parameterName}' is not a monitoring parameter of period ${period.periodNumber}`);
    }

    const markingNotApplicable = input.notApplicableReason !== undefined;
    const update = markingNotApplicable
      ? {
          status: MONITORED_PARAMETER_STATUSES.NOT_APPLICABLE,
          notApplicableReason: input.notApplicableReason,
          collectedAt: new Date(),
          collectedByUserId: actor.userId,
        }
      : {
          status: MONITORED_PARAMETER_STATUSES.COLLECTED,
          value: input.value,
          evidenceDocumentIds: input.evidenceDocumentIds,
          collectedAt: new Date(),
          collectedByUserId: actor.userId,
          // Clear a previous exclusion: recording a value means it applied
          // after all, and leaving the old reason behind would contradict it.
          notApplicableReason: undefined as any,
        };

    const updated = await this.monitoringRepository.updateParameter(periodId, parameterName, update);
    if (!updated) throw new Error(`Failed to update '${parameterName}' on period ${period.periodNumber}`);

    // The period's own status follows the data rather than being set by hand,
    // so "ready" always means the readiness check actually passes.
    const readiness = analyseMonitoringReadiness(updated);
    const nextStatus = readiness.readyToReport
      ? MONITORING_PERIOD_STATUSES.REPORT_READY
      : MONITORING_PERIOD_STATUSES.OPEN;
    if (nextStatus !== updated.status) {
      return (await this.monitoringRepository.updatePeriodStatus(periodId, nextStatus)) || updated;
    }

    return updated;
  }

  /**
   * Submit a period for verification. Refuses while anything blocking remains,
   * because the alternative is sending a verifier an incomplete report and
   * paying for the round trip to learn that.
   */
  async submitPeriod(periodId: string, actor: IMonitoringActor): Promise<IMonitoringPeriodInterface> {
    const period = await this.monitoringRepository.getPeriodById(periodId);
    if (!period) throw new Error(`Monitoring period '${periodId}' not found`);

    const readiness = analyseMonitoringReadiness(period);
    if (!readiness.readyToReport) {
      const blocking = readiness.gaps.filter((g) => g.severity === 'blocking').map((g) => g.parameter);
      throw new Error(`Period ${period.periodNumber} is not ready to report — outstanding: ${blocking.join(', ')}`);
    }

    const updated = await this.monitoringRepository.updatePeriodStatus(periodId, MONITORING_PERIOD_STATUSES.SUBMITTED);
    await this.recordAudit(String(period.projectId), actor, 'MONITORING_PERIOD_SUBMITTED', undefined, {
      periodNumber: period.periodNumber,
      collectedWithoutEvidence: readiness.counts.collectedWithoutEvidence,
    });
    return updated!;
  }

  // ---------------------------------------------------------------------------

  private async loadContext(projectId: string) {
    const project: any = await this.projectRepository.getProjectById(projectId);
    if (!project) throw new Error(`Project '${projectId}' not found`);

    const methodologyId = project.methodologyId?._id || project.methodologyId;
    if (!methodologyId) throw new Error(`Project '${projectId}' has no methodology selected`);

    const methodology: any = project.methodologyId?.code
      ? project.methodologyId
      : await this.methodologyRepository.getMethodologyById(String(methodologyId));
    if (!methodology) throw new Error(`Methodology '${methodologyId}' not found`);

    return { project, methodology };
  }

  private async recordAudit(projectId: string, actor: IMonitoringActor, eventType: string, before?: any, after?: any) {
    await new AuditEvent().record({
      projectId, actorUserId: actor.userId, actorRole: actor.role, eventType, before, after,
    }, this.auditEventUseCase);
  }
}
