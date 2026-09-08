import { ISourceDocumentRepository } from '../../application/repositories/ISourceDocumentRepository'
import { CreateSourceDocument } from '../../domain'
import { TenantScope } from '../../domain/tenant/TenantScope'
import { SourceDocumentConnection } from './IDBConnection'
import { ISourceDocumentInterface } from "../../domain/source_document/sourceDocumentInterface";

export class SourceDocumentRepository extends ISourceDocumentRepository {
  private connection: SourceDocumentConnection
  private scope: TenantScope

  constructor(connection: SourceDocumentConnection, scope: TenantScope) {
    super()
    this.connection = connection
    this.scope = scope
  }

  async createSourceDocument(doc: CreateSourceDocument): Promise<ISourceDocumentInterface> {
    return await this.connection.createSourceDocument(this.scope.tenantId, doc);
  }

  async getSourceDocumentsByProjectId(projectId: string): Promise<ISourceDocumentInterface[]> {
    return await this.connection.getSourceDocumentsByProjectId(this.scope.tenantId, projectId);
  }

  async updateExtractedText(id: string, extractedText: string, status: string): Promise<ISourceDocumentInterface | null> {
    return await this.connection.updateExtractedText(this.scope.tenantId, id, extractedText, status);
  }
}
