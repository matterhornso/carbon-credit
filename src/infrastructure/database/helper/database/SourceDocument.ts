import { CreateSourceDocument } from "../../../../domain";
import { ISourceDocumentInterface } from "../../../../domain/source_document/sourceDocumentInterface";
import { SourceDocumentConnection } from "../../../../interfaces/database/IDBConnection"
import { SourceDocumentModel } from "../../modal/source_document/source_document.model";

export class SourceDocumentMongoConnection extends SourceDocumentConnection {

  constructor() {
    super();
  }

  async createSourceDocument(tenantId: string, doc: CreateSourceDocument): Promise<ISourceDocumentInterface> {
    return await SourceDocumentModel.createSourceDocument(tenantId, doc);
  }

  async getSourceDocumentsByProjectId(tenantId: string, projectId: string): Promise<ISourceDocumentInterface[]> {
    return await SourceDocumentModel.getSourceDocumentsByProjectId(tenantId, projectId);
  }

  async updateExtractedText(tenantId: string, id: string, extractedText: string, status: string): Promise<ISourceDocumentInterface | null> {
    return await SourceDocumentModel.updateExtractedText(tenantId, id, extractedText, status);
  }
}
