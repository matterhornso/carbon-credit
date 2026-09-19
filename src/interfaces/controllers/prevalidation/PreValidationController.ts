import { Response } from '../../response/Response'
import { Controller, Get, Route, Post, Body, Request, Query, Security } from "tsoa"
import { ProjectRepository } from '../../database/ProjectRepository'
import { ProjectMongoConnection } from '../../../infrastructure/database/helper/database/Project'
import { MethodologyRepository } from '../../database/MethodologyRepository'
import { MethodologyMongoConnection } from '../../../infrastructure/database/helper/database/Methodology'
import { CaseDocumentRepository } from '../../database/CaseDocumentRepository'
import { CaseDocumentMongoConnection } from '../../../infrastructure/database/helper/database/CaseDocument'
import { FindingRepository } from '../../database/FindingRepository'
import { FindingMongoConnection } from '../../../infrastructure/database/helper/database/Finding'
import { AuditEventRepository } from '../../database/AuditEventRepository'
import { AuditEventMongoConnection } from '../../../infrastructure/database/helper/database/AuditEvent'
import { PreValidationService } from '../../../application/usecases/prevalidation/PreValidationService'
import { LLMService } from '../../services/LLM.service'
import { IReviewCaseRequest, IResolveFindingRequest } from '../RequestInterfaces'
import { Util } from '../../utils/Util'
import { TenantResolver } from '../../services/TenantResolver.service'
import { preValidationBudget, UserBudgetExceededError } from '../../../application/usecases/ratelimit/UserBudget'

@Route('prevalidation')
export class PreValidationController extends Controller {
  private tenantResolver = new TenantResolver();

  // Built per request, because these carry the caller's tenant. Findings are
  // tenant data like everything else - one operator's findings series is not
  // another's, and the whole value of the aggregate is comparative.
  private async scoped(request: any) {
    const scope = await this.tenantResolver.scopeFor(request?.user?._user_uuid || request?.headers?.['_user_uuid']);
    return new PreValidationService(
      new ProjectRepository(new ProjectMongoConnection(), scope),
      new MethodologyRepository(new MethodologyMongoConnection()),
      new CaseDocumentRepository(new CaseDocumentMongoConnection(), scope),
      new FindingRepository(new FindingMongoConnection(), scope),
      new AuditEventRepository(new AuditEventMongoConnection(), scope),
      new LLMService()
    );
  }

  private async getActor(request: any): Promise<{ userId: string; role: string }> {
    const user: any = await new Util().getUserInfo(request.user);
    const department: any = await new Util().getDepartmentInfo(request.user);
    return { userId: user._id, role: (department?.roles || []).join(',') || 'UNKNOWN' };
  }

  /**
   * Review the whole case adversarially and return the findings.
   *
   * Synchronous for now, unlike generateAll, which runs as a durable job. The
   * difference is that a review is bounded by the sections that already exist
   * and produces nothing a user has to wait to edit - but if review time grows
   * with document size the way generation did, this belongs on the same job
   * queue rather than on a request.
   */
  @Security("jwt")
  @Post("reviewCase")
  async reviewCase(@Body() data: IReviewCaseRequest, @Request() request: any) {
    try {
      const actor = await this.getActor(request);
      preValidationBudget.consume(actor.userId);
      const service = await this.scoped(request);
      const result = await service.reviewCase(data.projectId, actor);

      // 200 even when some sections failed: the findings from the sections that
      // succeeded are real and the caller should get them. failedSections says
      // what is missing, so a partial result is never mistaken for a clean one.
      return new Response().sendResponseSuccess(result, true);
    } catch (Error: any) {
      if (Error instanceof UserBudgetExceededError) {
        this.setStatus(429);
        return new Response().sendResponseFailure(Error.message, false);
      }
      this.setStatus(500);
      return new Response().sendResponseFailure("Something went wrong " + Error, false);
    }
  }

  @Security("jwt")
  @Get("getFindings")
  async getFindings(@Request() request: any, @Query() projectId?: string) {
    try {
      if (!projectId) {
        this.setStatus(400);
        return new Response().sendResponseFailure("projectId is required", false);
      }
      const service = await this.scoped(request);
      return new Response().sendResponseSuccess(await service.getFindings(projectId), true);
    } catch (Error: any) {
      this.setStatus(500);
      return new Response().sendResponseFailure("Something went wrong " + Error, false);
    }
  }

  /**
   * Findings grouped across projects. The number that says whether
   * pre-validation works: findings per case against the operator's own
   * baseline, by methodology and section.
   */
  @Security("jwt")
  @Get("getFindingStats")
  async getFindingStats(@Request() request: any, @Query() methodologyCode?: string) {
    try {
      const service = await this.scoped(request);
      return new Response().sendResponseSuccess(await service.getFindingStats(methodologyCode), true);
    } catch (Error: any) {
      this.setStatus(500);
      return new Response().sendResponseFailure("Something went wrong " + Error, false);
    }
  }

  @Security("jwt")
  @Post("resolveFinding")
  async resolveFinding(@Body() data: IResolveFindingRequest, @Request() request: any) {
    try {
      const service = await this.scoped(request);
      const actor = await this.getActor(request);
      const updated = await service.resolveFinding(data.findingId, data.status, data.resolutionNote, data.projectId, actor);

      if (!updated) {
        this.setStatus(404);
        return new Response().sendResponseFailure("Finding not found", false);
      }
      return new Response().sendResponseSuccess(updated, true);
    } catch (Error: any) {
      // A rejected status or a missing rejection reason is the caller's error,
      // not the server's. Returning 500 for it would make monitoring read user
      // error as an outage - the same defect the audit found in the captcha path.
      const message = String(Error?.message || Error);
      if (/must be one of|requires a resolutionNote/.test(message)) {
        this.setStatus(400);
        return new Response().sendResponseFailure(message, false);
      }
      this.setStatus(500);
      return new Response().sendResponseFailure("Something went wrong " + Error, false);
    }
  }
}
