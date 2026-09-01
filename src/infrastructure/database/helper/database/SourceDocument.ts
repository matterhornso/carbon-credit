import { CreateSourceDocument } from "../../../../domain";
import { ISourceDocumentInterface } from "../../../../domain/source_document/sourceDocumentInterface";
import { SourceDocumentConnection } from "../../../../interfaces/database/IDBConnection"
import { SourceDocumentModel } from "../../modal/source_document/source_document.model";

export class SourceDocumentMongoConnection extends SourceDocumentConnection {

  constructor() {
    super();
  }

  async createSourceDocument(doc: CreateSourceDocument): Promise<ISourceDocumentInterface> {
    return await SourceDocumentModel.createSourceDocument(doc);
  }

  async getSourceDocumentsByProjectId(projectId: string): Promise<ISourceDocumentInterface[]> {
    return await SourceDocumentModel.getSourceDocumentsByProjectId(projectId);
  }

  async updateExtractedText(id: string, extractedText: string, status: string): Promise<ISourceDocumentInterface | null> {
    return await SourceDocumentModel.updateExtractedText(id, extractedText, status);
  }
}
