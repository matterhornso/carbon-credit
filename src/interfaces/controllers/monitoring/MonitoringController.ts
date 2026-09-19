import { Response } from '../../response/Response'
import { Controller, Get, Route, Post, Body, Request, Query, Security } from "tsoa"
import { ProjectRepository } from '../../database/ProjectRepository'
import { ProjectMongoConnection } from '../../../infrastructure/database/helper/database/Project'
import { MethodologyRepository } from '../../database/MethodologyRepository'
import { MethodologyMongoConnection } from '../../../infrastructure/database/helper/database/Methodology'
import { MonitoringRepository } from '../../database/MonitoringRepository'
import { MonitoringMongoConnection } from '../../../infrastructure/database/helper/database/Monitoring'
import { AuditEventRepository } from '../../database/AuditEventRepository'
import { AuditEventMongoConnection } from '../../../infrastructure/database/helper/database/AuditEvent'
import { MonitoringService } from '../../../application/usecases/monitoring/MonitoringService'
import { IOpenPeriodsRequest, IRecordParameterRequest, ISubmitPeriodRequest } from '../RequestInterfaces'
import { Util } from '../../utils/Util'
import { TenantResolver } from '../../services/TenantResolver.service'

@Route('monitoring')
export class MonitoringController extends Controller {
  private tenantResolver = new TenantResolver();

  // Built per request: monitoring periods are tenant data, and a period is the
  // record a verifier reads. Nothing here is shared configuration.
  private async scoped(request: any) {
    const scope = await this.tenantResolver.scopeFor(request?.user?._user_uuid || request?.headers?.['_user_uuid']);
    return new MonitoringService(
      new ProjectRepository(new ProjectMongoConnection(), scope),
      new MethodologyRepository(new MethodologyMongoConnection()),
      new MonitoringRepository(new MonitoringMongoConnection(), scope),
      new AuditEventRepository(new AuditEventMongoConnection(), scope)
    );
  }

  private async getActor(request: any): Promise<{ userId: string; role: string }> {
    const user: any = await new Util().getUserInfo(request.user);
    const department: any = await new Util().getDepartmentInfo(request.user);
    return { userId: user._id, role: (department?.roles || []).join(',') || 'UNKNOWN' };
  }

  // Client errors here are the caller's, not the server's: a project that is
  // not registered, a period that is closed, an unknown parameter. Returning
  // 500 for them would make monitoring read user error as an outage.
  private fail(error: any) {
    const message = String(error?.message || error);
    const isClientError = /not found|can only be opened|no longer be edited|is not a monitoring parameter|not ready to report|has no crediting period|requires a/.test(message);
    this.setStatus(isClientError ? 400 : 500);
    return new Response().sendResponseFailure(message, false);
  }

  /**
   * Open the crediting period's monitoring schedule. Idempotent — opens only
   * periods that do not exist yet, so a crediting extension is a re-run.
   */
  @Security("jwt")
  @Post("openPeriods")
  async openPeriods(@Body() data: IOpenPeriodsRequest, @Request() request: any) {
    try {
      const service = await this.scoped(request);
      const actor = await this.getActor(request);
      const opened = await service.openPeriods(data.projectId, actor, { periodLengthMonths: data.periodLengthMonths });
      return new Response().sendResponseSuccess({ opened: opened.length, periods: opened }, true);
    } catch (error: any) {
      return this.fail(error);
    }
  }

  @Security("jwt")
  @Get("getPeriods")
  async getPeriods(@Request() request: any, @Query() projectId?: string) {
    try {
      if (!projectId) {
        this.setStatus(400);
        return new Response().sendResponseFailure("projectId is required", false);
      }
      const service = await this.scoped(request);
      return new Response().sendResponseSuccess(await service.getPeriods(projectId), true);
    } catch (error: any) {
      return this.fail(error);
    }
  }

  /**
   * What this period still has to collect. The monitoring equivalent of the
   * evidence-gap report at intake, and rule-based for the same reason.
   */
  @Security("jwt")
  @Get("getReadiness")
  async getReadiness(@Request() request: any, @Query() periodId?: string) {
    try {
      if (!periodId) {
        this.setStatus(400);
        return new Response().sendResponseFailure("periodId is required", false);
      }
      const service = await this.scoped(request);
      return new Response().sendResponseSuccess(await service.getReadiness(periodId), true);
    } catch (error: any) {
      return this.fail(error);
    }
  }

  @Security("jwt")
  @Post("recordParameter")
  async recordParameter(@Body() data: IRecordParameterRequest, @Request() request: any) {
    try {
      const service = await this.scoped(request);
      const actor = await this.getActor(request);
      const updated = await service.recordParameter(data.periodId, data.parameter, {
        value: data.value,
        evidenceDocumentIds: data.evidenceDocumentIds,
        notApplicableReason: data.notApplicableReason,
      }, actor);
      return new Response().sendResponseSuccess(updated, true);
    } catch (error: any) {
      return this.fail(error);
    }
  }

  @Security("jwt")
  @Post("submitPeriod")
  async submitPeriod(@Body() data: ISubmitPeriodRequest, @Request() request: any) {
    try {
      const service = await this.scoped(request);
      const actor = await this.getActor(request);
      return new Response().sendResponseSuccess(await service.submitPeriod(data.periodId, actor), true);
    } catch (error: any) {
      return this.fail(error);
    }
  }
}
