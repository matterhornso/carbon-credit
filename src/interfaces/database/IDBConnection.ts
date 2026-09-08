import { CreateProject, CreateProjectSectionA, CreateProjectSectionB, CreateProjectSectionC, CreateProjectSectionD, CreateProjectSectionE, CreateReport, UpdateProject, UpdateReport, CreateMethodology, CreateCaseDocument, CreateSourceDocument, CreateAuditEvent } from "../../domain";
import { IProjectInterface } from "../../domain/project/projectInterface";
import { IProjectSectionA } from "../../domain/project_section_a/projectSectionAInterface";
import { IProjectSectionB } from "../../domain/project_section_b/projectSectionBInterface";
import { IProjectSectionC } from "../../domain/project_section_c/projectSectionCInterface";
import { IProjectSectionD } from "../../domain/project_section_d/projectSectionDInterface";
import { IProjectSectionE } from "../../domain/project_section_e/projectSectionEInterface";
import { IReportInterface } from "../../domain/report/reportInterface";
import { IMethodologyInterface } from "../../domain/methodology/methodologyInterface";
import { ICaseDocumentInterface } from "../../domain/case_document/caseDocumentInterface";
import { UpdateCaseDocumentSection } from "../../domain/case_document/UpdateCaseDocumentSection";
import { ISourceDocumentInterface } from "../../domain/source_document/sourceDocumentInterface";
import { IAuditEventInterface } from "../../domain/audit_event/auditEventInterface";

// tenantId is a required first argument on every operation touching tenant
// data. It is not optional and has no default: a caller that has not resolved a
// tenant cannot reach the database at all.
export abstract class ProjectConnection {
  abstract createProject(tenantId: string, query: CreateProject): Promise<IProjectInterface>
  abstract updateProject(tenantId: string, query: UpdateProject): Promise<IProjectInterface | null>
  abstract transitionStatus(tenantId: string, id: string, status: string): Promise<IProjectInterface | null>
  abstract setCaseDocumentId(tenantId: string, id: string, caseDocumentId: string): Promise<IProjectInterface | null>
  abstract addAttachment(tenantId: string, id: string, sourceDocumentId: string): Promise<IProjectInterface | null>
  abstract getAllProjects(tenantId: string, filter?:any): Promise<IProjectInterface[]>
  abstract getProjectById(tenantId: string, id:string): Promise<IProjectInterface | null>
}

export abstract class MethodologyConnection {
  abstract createMethodology(query: CreateMethodology): Promise<IMethodologyInterface>
  abstract getAllMethodologies(filter?: any): Promise<IMethodologyInterface[]>
  abstract getMethodologyById(id: string): Promise<IMethodologyInterface | null>
  abstract getMethodologyByCode(code: string): Promise<IMethodologyInterface | null>
}

export abstract class CaseDocumentConnection {
  abstract createCaseDocument(tenantId: string, query: CreateCaseDocument): Promise<ICaseDocumentInterface>
  abstract updateSection(tenantId: string, query: UpdateCaseDocumentSection): Promise<ICaseDocumentInterface | null>
  abstract getCaseDocumentByProjectId(tenantId: string, projectId: string): Promise<ICaseDocumentInterface | null>
}

export abstract class SourceDocumentConnection {
  abstract createSourceDocument(tenantId: string, query: CreateSourceDocument): Promise<ISourceDocumentInterface>
  abstract getSourceDocumentsByProjectId(tenantId: string, projectId: string): Promise<ISourceDocumentInterface[]>
  abstract updateExtractedText(tenantId: string, id: string, extractedText: string, status: string): Promise<ISourceDocumentInterface | null>
}

export abstract class AuditEventConnection {
  abstract createAuditEvent(tenantId: string, query: CreateAuditEvent): Promise<IAuditEventInterface>
  abstract getEventsByProjectId(tenantId: string, projectId: string): Promise<IAuditEventInterface[]>
}

export abstract class ReportConnection {
  abstract createReport(query: CreateReport): Promise<IReportInterface>
  abstract updateReport(query: UpdateReport): Promise<IReportInterface>
  abstract getAllReports(filter?:any): Promise<IReportInterface>
  abstract getReportById(id:string): Promise<IReportInterface>
}

export abstract class ProjectSectionAConnection {
  abstract createSectionA(query: CreateProjectSectionA): Promise<IProjectSectionA>;
  abstract createStep1(query: CreateProjectSectionA): Promise<IProjectSectionA>
  abstract createStep2(query: CreateProjectSectionA): Promise<IProjectSectionA>
  abstract createStep3(query: CreateProjectSectionA): Promise<IProjectSectionA>
  abstract createStep4(query: CreateProjectSectionA): Promise<IProjectSectionA>
  abstract createStep5(query: CreateProjectSectionA): Promise<IProjectSectionA>
}
export abstract class ProjectSectionBConnection {
  abstract createSectionB(query: CreateProjectSectionB): Promise<IProjectSectionB>;
  abstract createStep1(query: CreateProjectSectionB): Promise<IProjectSectionB>
  abstract createStep2(query: CreateProjectSectionB): Promise<IProjectSectionB>
}

export abstract class ProjectSectionCConnection {
  abstract createSectionC(query: CreateProjectSectionC): Promise<IProjectSectionC>;
  abstract createStep1(query: CreateProjectSectionC): Promise<IProjectSectionC>
}

export abstract class ProjectSectionDConnection {
  abstract createSectionD(query: CreateProjectSectionD): Promise<IProjectSectionD>;
  abstract createStep1(query: CreateProjectSectionD): Promise<IProjectSectionD>
  abstract createStep2(query: CreateProjectSectionD): Promise<IProjectSectionD>
  abstract createStep3(query: CreateProjectSectionD): Promise<IProjectSectionD>
}

export abstract class ProjectSectionEConnection {
  abstract createSectionE(query: CreateProjectSectionE): Promise<IProjectSectionE>;
  abstract createStep1(query: CreateProjectSectionE): Promise<IProjectSectionE>
  abstract createStep2(query: CreateProjectSectionE): Promise<IProjectSectionE>
  abstract createStep3(query: CreateProjectSectionE): Promise<IProjectSectionE>
  abstract createStep4(query: CreateProjectSectionE): Promise<IProjectSectionE>
  abstract createStep5(query: CreateProjectSectionE): Promise<IProjectSectionE>
  abstract createStep6(query: CreateProjectSectionE): Promise<IProjectSectionE>
  abstract createStep7(query: CreateProjectSectionE): Promise<IProjectSectionE>
}