import { CreateSourceDocument } from "../../../domain";
import { ISourceDocumentRepository } from "../../repositories/ISourceDocumentRepository";

export default class SourceDocument {
  private sourceDocumentRepository: ISourceDocumentRepository;
  constructor(sourceDocumentRepository: ISourceDocumentRepository) {
    this.sourceDocumentRepository = sourceDocumentRepository;
  }

  createSourceDocument(doc: CreateSourceDocument) {
    return this.sourceDocumentRepository.createSourceDocument(doc);
  }

  getSourceDocumentsByProjectId(projectId: string) {
    return this.sourceDocumentRepository.getSourceDocumentsByProjectId(projectId);
  }

  updateExtractedText(id: string, extractedText: string, status: string) {
    return this.sourceDocumentRepository.updateExtractedText(id, extractedText, status);
  }
}
