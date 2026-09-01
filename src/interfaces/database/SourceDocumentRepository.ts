import { ISourceDocumentRepository } from '../../application/repositories/ISourceDocumentRepository'
import { CreateSourceDocument } from '../../domain'
import { SourceDocumentConnection } from './IDBConnection'
import { ISourceDocumentInterface } from "../../domain/source_document/sourceDocumentInterface";

export class SourceDocumentRepository extends ISourceDocumentRepository {
  private connection: SourceDocumentConnection

  constructor(connection: SourceDocumentConnection) {
    super()
    this.connection = connection
  }

  async createSourceDocument(doc: CreateSourceDocument): Promise<ISourceDocumentInterface> {
    return await this.connection.createSourceDocument(doc);
  }

  async getSourceDocumentsByProjectId(projectId: string): Promise<ISourceDocumentInterface[]> {
    return await this.connection.getSourceDocumentsByProjectId(projectId);
  }

  async updateExtractedText(id: string, extractedText: string, status: string): Promise<ISourceDocumentInterface | null> {
    return await this.connection.updateExtractedText(id, extractedText, status);
  }
}
