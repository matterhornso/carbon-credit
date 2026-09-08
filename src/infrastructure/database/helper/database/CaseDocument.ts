import { CreateCaseDocument } from "../../../../domain";
import { UpdateCaseDocumentSection } from "../../../../domain/case_document/UpdateCaseDocumentSection";
import { ICaseDocumentInterface } from "../../../../domain/case_document/caseDocumentInterface";
import { CaseDocumentConnection } from "../../../../interfaces/database/IDBConnection"
import { CaseDocumentModel } from "../../modal/case_document/case_document.model";

export class CaseDocumentMongoConnection extends CaseDocumentConnection {

  constructor() {
    super();
  }

  async createCaseDocument(tenantId: string, caseDocument: CreateCaseDocument): Promise<ICaseDocumentInterface> {
    return await CaseDocumentModel.createCaseDocument(tenantId, caseDocument);
  }

  async updateSection(tenantId: string, update: UpdateCaseDocumentSection): Promise<ICaseDocumentInterface | null> {
    return await CaseDocumentModel.updateSection(tenantId, update);
  }

  async getCaseDocumentByProjectId(tenantId: string, projectId: string): Promise<ICaseDocumentInterface | null> {
    return await CaseDocumentModel.getCaseDocumentByProjectId(tenantId, projectId);
  }
}
