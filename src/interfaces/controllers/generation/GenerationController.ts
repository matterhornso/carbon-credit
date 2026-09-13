import { Response } from '../../response/Response'
import { Controller, Get, Route, Post, Body, Request, Query, Security } from "tsoa"
import { ProjectRepository } from '../../database/ProjectRepository'
import { ProjectMongoConnection } from '../../../infrastructure/database/helper/database/Project'
import { MethodologyRepository } from '../../database/MethodologyRepository'
import { MethodologyMongoConnection } from '../../../infrastructure/database/helper/database/Methodology'
import { CaseDocumentRepository } from '../../database/CaseDocumentRepository'
import { CaseDocumentMongoConnection } from '../../../infrastructure/database/helper/database/CaseDocument'
import { SourceDocumentRepository } from '../../database/SourceDocumentRepository'
import { SourceDocumentMongoConnection } from '../../../infrastructure/database/helper/database/SourceDocument'
import { AuditEventRepository } from '../../database/AuditEventRepository'
import { AuditEventMongoConnection } from '../../../infrastructure/database/helper/database/AuditEvent'
import { GenerationService } from '../../../application/usecases/generation/GenerationService'
import { LLMService } from '../../services/LLM.service'
import { UpdateCaseDocumentSection } from '../../../domain/case_document/UpdateCaseDocumentSection'
import { IGenerateSectionRequest, IGenerateAllSectionsRequest, IRefineSectionRequest, IGenerateCoverNoteRequest } from '../RequestInterfaces'
import { Util } from '../../utils/Util'
import { TenantResolver } from '../../services/TenantResolver.service'
import { JobQueue } from '../../../application/usecases/job/JobQueue'
import { CreateJob } from '../../../domain/job/CreateJob'
import { JOB_TYPES } from '../../../domain/job/jobInterface'

@Route('generation')
export class GenerationController extends Controller {
  private tenantResolver = new TenantResolver();

  // Repositories are built per request rather than once at construction,
  // because they carry the caller's tenant. A controller-lifetime repository
  // would have to be tenant-agnostic, which is exactly the property this
  // change removes.
  private async scoped(request: any): Promise<{
    generationService: GenerationService;
    caseDocumentRepository: CaseDocumentRepository;
  }> {
    const scope = await this.tenantResolver.scopeFor(request?.user?._user_uuid || request?.headers?.['_user_uuid']);
    const caseDocumentRepository = new CaseDocumentRepository(new CaseDocumentMongoConnection(), scope);
    const generationService = new GenerationService(
      new ProjectRepository(new ProjectMongoConnection(), scope),
      new MethodologyRepository(new MethodologyMongoConnection()),
      caseDocumentRepository,
      new SourceDocumentRepository(new SourceDocumentMongoConnection(), scope),
      new AuditEventRepository(new AuditEventMongoConnection(), scope),
      new LLMService()
    );
    return { generationService, caseDocumentRepository };
  }

  private async getActor(request: any): Promise<{ userId: string; role: string }> {
    const user: any = await new Util().getUserInfo(request.user);
    const department: any = await new Util().getDepartmentInfo(request.user);
    return { userId: user._id, role: (department?.roles || []).join(',') || 'UNKNOWN' };
  }

  // Generates one section (structured or narrative, chosen automatically
  // from the methodology's sectionGuidance). Safe to call again on an
  // already-drafted section — it overwrites with a fresh generation, but
  // never a 'finalized' one implicitly (the frontend should confirm with
  // the user before regenerating a finalized section).
  @Security("jwt")
  @Post("generateSection")
  async generateSection(@Body() data: IGenerateSectionRequest, @Request() request: any) {
    try {
      const actor = await this.getActor(request);
      const { generationService } = await this.scoped(request);
      const result = await generationService.generateSection(data.projectId, data.sectionKey, actor);
      return new Response().sendResponseSuccess(result, true);
    } catch (error: any) {
      this.setStatus(400);
      return new Response().sendResponseFailure(error?.message || "Something went wrong", false);
    }
  }

  // Generates every not-yet-finalized section, additionality and
  // baseline_scenario first, and advances the project to CASE_DRAFT_READY
  // once done. This is a long-running call (multiple sequential LLM
  // requests) — the frontend should show progress, not treat this as
  // instant.
  //
  // A section that fails does not abort the run: it is recorded on the
  // section and the project stays in CASE_GENERATING, so the caller can
  // retry with onlyMissing to fill the gaps without paying for the
  // sections that already succeeded.
  @Security("jwt")
  @Post("generateAll")
  async generateAll(@Body() data: IGenerateAllSectionsRequest, @Request() request: any) {
    try {
      const actor = await this.getActor(request);
      const scope = await this.tenantResolver.scopeFor(
        request?.user?._user_uuid || request?.headers?.['_user_uuid']
      );
      // Enqueued rather than run inline: the previous behaviour held an HTTP
      // request open for ten sequential model calls, so the run died with the
      // connection and could only be started by a person waiting on it.
      const job = await new JobQueue().enqueue(new CreateJob({
        tenantId: scope.tenantId,
        type: JOB_TYPES.GENERATE_ALL_SECTIONS,
        payload: { projectId: data.projectId, actor, onlyMissing: data.onlyMissing === true },
      }));
      return new Response().sendResponseSuccess(
        { jobId: String(job._id), status: job.status, projectId: data.projectId }, true
      );
    } catch (error: any) {
      this.setStatus(400);
      return new Response().sendResponseFailure(error?.message || "Something went wrong", false);
    }
  }

  // Chat-refine turn for a narrative section. Structured sections reject
  // this — regenerate them via generateSection instead.
  @Security("jwt")
  @Post("refineSection")
  async refineSection(@Body() data: IRefineSectionRequest, @Request() request: any) {
    try {
      const actor = await this.getActor(request);
      const { generationService } = await this.scoped(request);
      const result = await generationService.refineSection(data.projectId, data.sectionKey, data.message, actor);
      return new Response().sendResponseSuccess(result, true);
    } catch (error: any) {
      this.setStatus(400);
      return new Response().sendResponseFailure(error?.message || "Something went wrong", false);
    }
  }

  // Direct human edit — no LLM call. Used for the manual "accept/edit" path
  // (as opposed to chat-refine). status should be 'user_edited' while a
  // human is actively revising, 'finalized' once they're done with the
  // section.
  @Security("jwt")
  @Post("updateSection")
  async updateSection(@Body() data: { projectId: string; sectionKey: string; content: any; status?: string }, @Request() request: any) {
    try {
      const actor = await this.getActor(request);
      const { caseDocumentRepository } = await this.scoped(request);
      const caseDocument: any = await caseDocumentRepository.getCaseDocumentByProjectId(data.projectId);
      if (!caseDocument) {
        this.setStatus(404);
        return new Response().sendResponseFailure("Case document not found", false);
      }
      const updated = await caseDocumentRepository.updateSection(new UpdateCaseDocumentSection({
        caseDocumentId: String(caseDocument._id),
        sectionKey: data.sectionKey,
        status: data.status || 'user_edited',
        content: data.content,
        lastEditedByUserId: actor.userId,
      }));
      if (!updated) {
        this.setStatus(404);
        return new Response().sendResponseFailure("Section not found", false);
      }
      return new Response().sendResponseSuccess(updated, true);
    } catch (error: any) {
      this.setStatus(400);
      return new Response().sendResponseFailure(error?.message || "Something went wrong", false);
    }
  }

  // Progress for an enqueued run. Scoped to the caller's tenant, so one
  // operator cannot watch another's work.
  @Security("jwt")
  @Get("getJob")
  async getJob(@Request() request: any, @Query() jobId: string) {
    try {
      const scope = await this.tenantResolver.scopeFor(
        request?.user?._user_uuid || request?.headers?.['_user_uuid']
      );
      const job = await new JobQueue().getById(scope.tenantId, jobId);
      if (!job) {
        this.setStatus(404);
        return new Response().sendResponseFailure("Job not found", false);
      }
      return new Response().sendResponseSuccess({
        jobId, status: job.status, attempts: job.attempts,
        lastError: job.lastError, result: job.result,
      }, true);
    } catch (error: any) {
      this.setStatus(400);
      return new Response().sendResponseFailure(error?.message || "Something went wrong", false);
    }
  }

  // Regenerated on demand, not stored — always reflects current section
  // statuses at the moment of export.
  @Security("jwt")
  @Post("generateCoverNote")
  async generateCoverNote(@Body() data: IGenerateCoverNoteRequest, @Request() request: any) {
    try {
      const actor = await this.getActor(request);
      const { generationService } = await this.scoped(request);
      const result = await generationService.generateCoverNote(data.projectId, actor);
      return new Response().sendResponseSuccess(result, true);
    } catch (error: any) {
      this.setStatus(400);
      return new Response().sendResponseFailure(error?.message || "Something went wrong", false);
    }
  }

  @Get("getCaseDocument")
  @Security("jwt")
  async getCaseDocument(@Request() request: any, @Query() projectId: string) {
    try {
      const { caseDocumentRepository } = await this.scoped(request);
      const result = await caseDocumentRepository.getCaseDocumentByProjectId(projectId);
      if (!result) {
        this.setStatus(404);
        return new Response().sendResponseFailure("Case document not found", false);
      }
      return new Response().sendResponseSuccess(result, true);
    } catch (Error) {
      this.setStatus(500);
      return new Response().sendResponseFailure("Something went wrong " + Error, false);
    }
  }
}
