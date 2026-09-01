import { CreateCaseDocument } from "../../domain";
import { UpdateCaseDocumentSection } from "../../domain/case_document/UpdateCaseDocumentSection";
import { ICaseDocumentInterface } from "../../domain/case_document/caseDocumentInterface";

export abstract class ICaseDocumentRepository {
  abstract createCaseDocument(caseDocument: CreateCaseDocument): Promise<ICaseDocumentInterface>
  abstract updateSection(update: UpdateCaseDocumentSection): Promise<ICaseDocumentInterface | null>
  abstract getCaseDocumentByProjectId(projectId: string): Promise<ICaseDocumentInterface | null>
}
