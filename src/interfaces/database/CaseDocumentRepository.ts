import { ICaseDocumentRepository } from '../../application/repositories/ICaseDocumentRepository'
import { CreateCaseDocument } from '../../domain'
import { UpdateCaseDocumentSection } from '../../domain/case_document/UpdateCaseDocumentSection'
import { CaseDocumentConnection } from './IDBConnection'
import { ICaseDocumentInterface } from "../../domain/case_document/caseDocumentInterface";

export class CaseDocumentRepository extends ICaseDocumentRepository {
  private connection: CaseDocumentConnection

  constructor(connection: CaseDocumentConnection) {
    super()
    this.connection = connection
  }

  async createCaseDocument(caseDocument: CreateCaseDocument): Promise<ICaseDocumentInterface> {
    return await this.connection.createCaseDocument(caseDocument);
  }

  async updateSection(update: UpdateCaseDocumentSection): Promise<ICaseDocumentInterface | null> {
    return await this.connection.updateSection(update);
  }

  async getCaseDocumentByProjectId(projectId: string): Promise<ICaseDocumentInterface | null> {
    return await this.connection.getCaseDocumentByProjectId(projectId);
  }
}
