import { Response } from '../../response/Response'
import { Controller, Get, Route, Post, Body, Request, Query, Security } from "tsoa"
import { ProjectRepository } from '../../database/ProjectRepository'
import { ProjectMongoConnection } from '../../../infrastructure/database/helper/database/Project'
import { MethodologyRepository } from '../../database/MethodologyRepository'
import { MethodologyMongoConnection } from '../../../infrastructure/database/helper/database/Methodology'
import { CaseDocumentRepository } from '../../database/CaseDocumentRepository'
import { CaseDocumentMongoConnection } from '../../../infrastructure/database/helper/database/CaseDocument'
import { AuditEventRepository } from '../../database/AuditEventRepository'
import { AuditEventMongoConnection } from '../../../infrastructure/database/helper/database/AuditEvent'
import { ProjectUseCase, MethodologyUseCase, CaseDocumentUseCase, AuditEventUseCase } from '../../../application/usecases/index'
import { Project, UpdateProject, CaseDocument, AuditEvent } from '../../../domain'
import { PROJECT_STATUSES } from '../../../domain/project/projectStatus'
import { assertValidTransition, assertIntakeComplete } from '../../../application/usecases/project_lifecycle/ProjectLifecycle'
import { evaluateApplicability } from '../../../application/usecases/project_lifecycle/ApplicabilityEvaluator'
import { ICreateProjectRequest, ISelectMethodologyRequest, ISubmitIntakeRequest, IProjectTransitionRequest } from '../RequestInterfaces'
import { Util } from '../../utils/Util'
import { TenantResolver } from '../../services/TenantResolver.service'

@Route('project')
export class ProjectController extends Controller {

  private tenantResolver = new TenantResolver();

  // Built per request: these carry the caller's tenant, so a
  // controller-lifetime instance would have to be tenant-agnostic.
  private async scoped(request: any) {
    const scope = await this.tenantResolver.scopeFor(request?.user?._user_uuid || request?.headers?.['_user_uuid']);
    return {
      scope,
      projectRepository: new ProjectRepository(new ProjectMongoConnection(), scope),
      methodologyRepository: new MethodologyRepository(new MethodologyMongoConnection()),
      caseDocumentRepository: new CaseDocumentRepository(new CaseDocumentMongoConnection(), scope),
      auditEventRepository: new AuditEventRepository(new AuditEventMongoConnection(), scope),
    };
  }

  private async recordAuditEvent(request: any, projectId: string, eventType: string, before?: any, after?: any) {
    let _user: any = await new Util().getUserInfo(request.user);
    let _department: any = await new Util().getDepartmentInfo(request.user);
    const { auditEventRepository } = await this.scoped(request);
    const auditEvent_useCase = new AuditEventUseCase(auditEventRepository);
    await new AuditEvent().record({
      projectId,
      actorUserId: _user._id,
      actorRole: (_department?.roles || []).join(',') || 'UNKNOWN',
      eventType,
      before,
      after,
    }, auditEvent_useCase);
  }

  @Security("jwt")
  @Post("create")
  async create(@Body() data: ICreateProjectRequest, @Request() request: any) {
    try {
      const { projectRepository, methodologyRepository, caseDocumentRepository } = await this.scoped(request);
      let _user: any = await new Util().getUserInfo(request.user);
      let _department: any = await new Util().getDepartmentInfo(request.user);

      const project_useCase = new ProjectUseCase(projectRepository);
      let project_res: any = await new Project().create({
        name: data.name,
        sector: data.sector,
        proponentOrgId: _department._id,
        createdByUserId: _user._id,
      }, project_useCase);

      await this.recordAuditEvent(request, project_res._id, 'PROJECT_CREATED', undefined, { name: data.name, sector: data.sector, status: project_res.status });

      return new Response().sendResponseSuccess(project_res, true);
    } catch (Error) {
      this.setStatus(500);
      return new Response().sendResponseFailure("Something went wrong " + Error, false);
    }
  }

  // Selecting a methodology creates the project's CaseDocument (one entry
  // per Methodology.sectionGuidance section) and transitions DRAFT_INTAKE ->
  // METHODOLOGY_SELECTED. Re-selecting while already in METHODOLOGY_SELECTED
  // (before intake is submitted) is allowed and does not re-transition —
  // it just swaps the methodology and rebuilds the CaseDocument shape.
  @Security("jwt")
  @Post("selectMethodology")
  async selectMethodology(@Body() data: ISelectMethodologyRequest, @Request() request: any) {
    try {
      const { projectRepository, methodologyRepository, caseDocumentRepository } = await this.scoped(request);
      const project_useCase = new ProjectUseCase(projectRepository);
      const methodology_useCase = new MethodologyUseCase(methodologyRepository);
      const caseDocument_useCase = new CaseDocumentUseCase(caseDocumentRepository);

      const project: any = await project_useCase.getProjectById(data.projectId);
      if (!project) {
        this.setStatus(404);
        return new Response().sendResponseFailure("Project not found", false);
      }

      const methodology: any = await methodology_useCase.getMethodologyById(data.methodologyId);
      if (!methodology) {
        this.setStatus(404);
        return new Response().sendResponseFailure("Methodology not found", false);
      }
      if (methodology.sector !== project.sector) {
        this.setStatus(400);
        return new Response().sendResponseFailure("Methodology sector does not match project sector", false);
      }

      const isFirstSelection = project.status === PROJECT_STATUSES.DRAFT_INTAKE;
      if (isFirstSelection) {
        assertValidTransition(project.status, PROJECT_STATUSES.METHODOLOGY_SELECTED);
      } else if (project.status !== PROJECT_STATUSES.METHODOLOGY_SELECTED) {
        this.setStatus(400);
        return new Response().sendResponseFailure(`Cannot select methodology from status '${project.status}'`, false);
      }

      const methodologyChanged = String(project.methodologyId?._id || project.methodologyId || '') !== data.methodologyId;
      if (!project.caseDocumentId || methodologyChanged) {
        const sectionKeys = (methodology.sectionGuidance || []).map((guidance: any) => guidance.section);
        const caseDocument: any = await new CaseDocument().create({ projectId: data.projectId, sectionKeys }, caseDocument_useCase);
        await projectRepository.setCaseDocumentId(data.projectId, caseDocument._id);
      }

      await projectRepository.updateProject(new UpdateProject({ id: data.projectId, methodologyId: data.methodologyId }));
      const updated = isFirstSelection
        ? await projectRepository.transitionStatus(data.projectId, PROJECT_STATUSES.METHODOLOGY_SELECTED)
        : await project_useCase.getProjectById(data.projectId);

      await this.recordAuditEvent(request, data.projectId, 'METHODOLOGY_SELECTED', { methodologyId: project.methodologyId }, { methodologyId: data.methodologyId });

      return new Response().sendResponseSuccess(updated, true);
    } catch (Error) {
      this.setStatus(500);
      return new Response().sendResponseFailure("Something went wrong " + Error, false);
    }
  }

  @Security("jwt")
  @Post("submitIntake")
  async submitIntake(@Body() data: ISubmitIntakeRequest, @Request() request: any) {
    try {
      const { projectRepository, methodologyRepository, caseDocumentRepository } = await this.scoped(request);
      const project_useCase = new ProjectUseCase(projectRepository);
      const methodology_useCase = new MethodologyUseCase(methodologyRepository);

      const project: any = await project_useCase.getProjectById(data.projectId);
      if (!project) {
        this.setStatus(404);
        return new Response().sendResponseFailure("Project not found", false);
      }
      if (!project.methodologyId) {
        this.setStatus(400);
        return new Response().sendResponseFailure("Select a methodology before submitting intake", false);
      }

      const methodologyId = project.methodologyId._id || project.methodologyId;
      const methodology: any = await methodology_useCase.getMethodologyById(String(methodologyId));
      assertIntakeComplete(methodology?.requiredInputs || [], data.intake);
      assertValidTransition(project.status, PROJECT_STATUSES.INPUTS_SUBMITTED);

      await projectRepository.updateProject(new UpdateProject({ id: data.projectId, intake: data.intake }));
      const updated = await projectRepository.transitionStatus(data.projectId, PROJECT_STATUSES.INPUTS_SUBMITTED);

      await this.recordAuditEvent(request, data.projectId, 'INTAKE_SUBMITTED', undefined, { intake: data.intake });

      return new Response().sendResponseSuccess(updated, true);
    } catch (error: any) {
      this.setStatus(400);
      return new Response().sendResponseFailure(error?.message || "Something went wrong", false);
    }
  }

  @Get("checkApplicability")
  @Security("jwt")
  async checkApplicability(@Request() request: any, @Query() projectId: string) {
    try {
      const { projectRepository, methodologyRepository, caseDocumentRepository } = await this.scoped(request);
      const project_useCase = new ProjectUseCase(projectRepository);
      const methodology_useCase = new MethodologyUseCase(methodologyRepository);

      const project: any = await project_useCase.getProjectById(projectId);
      if (!project || !project.methodologyId) {
        this.setStatus(400);
        return new Response().sendResponseFailure("Project or methodology not found", false);
      }
      const methodologyId = project.methodologyId._id || project.methodologyId;
      const methodology: any = await methodology_useCase.getMethodologyById(String(methodologyId));
      const evaluation = evaluateApplicability(methodology?.applicabilityConditions || [], project.intake || {});
      return new Response().sendResponseSuccess(evaluation, true);
    } catch (Error) {
      this.setStatus(500);
      return new Response().sendResponseFailure("Something went wrong " + Error, false);
    }
  }

  // General-purpose status advance/rewind, guarded by the state machine.
  // ISSUER_FINALIZED additionally requires every CaseDocument section to
  // have left 'not_started'. CASE_GENERATING -> CASE_DRAFT_READY is not
  // reachable here — the generation usecase (Phase 1 sub-milestone 3) drives
  // that transition itself once drafting completes.
  @Security("jwt")
  @Post("transition")
  async transition(@Body() data: IProjectTransitionRequest, @Request() request: any) {
    try {
      const { projectRepository, methodologyRepository, caseDocumentRepository } = await this.scoped(request);
      const project_useCase = new ProjectUseCase(projectRepository);
      const caseDocument_useCase = new CaseDocumentUseCase(caseDocumentRepository);

      const project: any = await project_useCase.getProjectById(data.projectId);
      if (!project) {
        this.setStatus(404);
        return new Response().sendResponseFailure("Project not found", false);
      }

      assertValidTransition(project.status, data.toStatus);

      if (data.toStatus === PROJECT_STATUSES.ISSUER_FINALIZED) {
        const caseDocument: any = project.caseDocumentId
          ? await caseDocument_useCase.getCaseDocumentByProjectId(data.projectId)
          : null;
        const incomplete = !caseDocument || (caseDocument.sections || []).some((section: any) => section.status === 'not_started');
        if (incomplete) {
          this.setStatus(400);
          return new Response().sendResponseFailure("All case sections must be drafted before finalizing", false);
        }
      }

      const updated = await projectRepository.transitionStatus(data.projectId, data.toStatus);

      await this.recordAuditEvent(request, data.projectId, 'STATUS_TRANSITION', { status: project.status }, { status: data.toStatus });

      return new Response().sendResponseSuccess(updated, true);
    } catch (error: any) {
      this.setStatus(400);
      return new Response().sendResponseFailure(error?.message || "Something went wrong", false);
    }
  }

  @Get("getProjectById")
  @Security("jwt")
  async getProjectById(@Request() request: any, @Query() id: string) {
    try {
      const { projectRepository, methodologyRepository, caseDocumentRepository } = await this.scoped(request);
      const project_useCase = new ProjectUseCase(projectRepository);
      let result = await project_useCase.getProjectById(id)
      return new Response().sendResponseSuccess(result, true);
    } catch (Error) {
      this.setStatus(500);
      return new Response().sendResponseFailure('something went wrong' + Error, false);
    }
  }

  // Scoped to the caller's own department — the prior version trusted a
  // caller-supplied user_id query param with no auth check at all.
  @Get("getAllProjects")
  @Security("jwt")
  async getAllProjects(@Request() request: any, @Query() status?: string) {
    try {
      const { projectRepository, methodologyRepository, caseDocumentRepository } = await this.scoped(request);
      let _department: any = await new Util().getDepartmentInfo(request.user);
      const project_useCase = new ProjectUseCase(projectRepository);
      let result = await project_useCase.getAllProjects({ proponentOrgId: _department._id, status })
      return new Response().sendResponseSuccess(result, true);
    } catch (Error) {
      this.setStatus(500);
      return new Response().sendResponseFailure("Something went wrong" + Error, false);
    }
  }
}
