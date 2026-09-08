import { ICaseDocumentRepository } from '../../application/repositories/ICaseDocumentRepository'
import { CreateCaseDocument } from '../../domain'
import { UpdateCaseDocumentSection } from '../../domain/case_document/UpdateCaseDocumentSection'
import { TenantScope } from '../../domain/tenant/TenantScope'
import { CaseDocumentConnection } from './IDBConnection'
import { ICaseDocumentInterface } from "../../domain/case_document/caseDocumentInterface";

export class CaseDocumentRepository extends ICaseDocumentRepository {
  private connection: CaseDocumentConnection
  private scope: TenantScope

  constructor(connection: CaseDocumentConnection, scope: TenantScope) {
    super()
    this.connection = connection
    this.scope = scope
  }

  async createCaseDocument(caseDocument: CreateCaseDocument): Promise<ICaseDocumentInterface> {
    return await this.connection.createCaseDocument(this.scope.tenantId, caseDocument);
  }

  async updateSection(update: UpdateCaseDocumentSection): Promise<ICaseDocumentInterface | null> {
    return await this.connection.updateSection(this.scope.tenantId, update);
  }

  async getCaseDocumentByProjectId(projectId: string): Promise<ICaseDocumentInterface | null> {
    return await this.connection.getCaseDocumentByProjectId(this.scope.tenantId, projectId);
  }
}
