import { CreateCaseDocument } from "../../../../domain";
import { UpdateCaseDocumentSection } from "../../../../domain/case_document/UpdateCaseDocumentSection";
import { ICaseDocumentInterface } from "../../../../domain/case_document/caseDocumentInterface";
import { CaseDocumentConnection } from "../../../../interfaces/database/IDBConnection"
import { CaseDocumentModel } from "../../modal/case_document/case_document.model";

export class CaseDocumentMongoConnection extends CaseDocumentConnection {

  constructor() {
    super();
  }

  async createCaseDocument(caseDocument: CreateCaseDocument): Promise<ICaseDocumentInterface> {
    return await CaseDocumentModel.createCaseDocument(caseDocument);
  }

  async updateSection(update: UpdateCaseDocumentSection): Promise<ICaseDocumentInterface | null> {
    return await CaseDocumentModel.updateSection(update);
  }

  async getCaseDocumentByProjectId(projectId: string): Promise<ICaseDocumentInterface | null> {
    return await CaseDocumentModel.getCaseDocumentByProjectId(projectId);
  }
}
