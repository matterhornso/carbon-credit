import { CreateProject, UpdateProject, CreateMethodology, CreateCaseDocument, CreateSourceDocument, CreateAuditEvent } from "../../domain";
import { IProjectInterface, IProjectPage } from "../../domain/project/projectInterface";
import { IMethodologyInterface } from "../../domain/methodology/methodologyInterface";
import { ICaseDocumentInterface } from "../../domain/case_document/caseDocumentInterface";
import { UpdateCaseDocumentSection } from "../../domain/case_document/UpdateCaseDocumentSection";
import { ISourceDocumentInterface } from "../../domain/source_document/sourceDocumentInterface";
import { IAuditEventInterface } from "../../domain/audit_event/auditEventInterface";
import { IFindingInterface } from "../../domain/finding/findingInterface";
import { CreateFinding } from "../../domain/finding/CreateFinding";

// tenantId is a required first argument on every operation touching tenant
// data. It is not optional and has no default: a caller that has not resolved a
// tenant cannot reach the database at all.
export abstract class ProjectConnection {
  abstract createProject(tenantId: string, query: CreateProject): Promise<IProjectInterface>
  abstract updateProject(tenantId: string, query: UpdateProject): Promise<IProjectInterface | null>
  abstract transitionStatus(tenantId: string, id: string, status: string): Promise<IProjectInterface | null>
  abstract setCaseDocumentId(tenantId: string, id: string, caseDocumentId: string): Promise<IProjectInterface | null>
  abstract addAttachment(tenantId: string, id: string, sourceDocumentId: string): Promise<IProjectInterface | null>
  abstract getAllProjects(tenantId: string, filter?:any): Promise<IProjectPage>
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


export abstract class FindingConnection {
  abstract createFinding(tenantId: string, finding: CreateFinding): Promise<IFindingInterface>
  abstract replaceOpenSelfReviewFindings(tenantId: string, projectId: string, sectionKey: string, findings: CreateFinding[]): Promise<IFindingInterface[]>
  abstract getFindingsByProjectId(tenantId: string, projectId: string): Promise<IFindingInterface[]>
  abstract getFindingStatsByMethodology(tenantId: string, methodologyCode?: string): Promise<any[]>
  abstract updateFindingStatus(tenantId: string, id: string, status: string, resolutionNote?: string): Promise<IFindingInterface | null>
}
