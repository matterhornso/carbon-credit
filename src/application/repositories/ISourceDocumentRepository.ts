import { CreateSourceDocument } from "../../domain";
import { ISourceDocumentInterface } from "../../domain/source_document/sourceDocumentInterface";

export abstract class ISourceDocumentRepository {
  abstract createSourceDocument(doc: CreateSourceDocument): Promise<ISourceDocumentInterface>
  abstract getSourceDocumentsByProjectId(projectId: string): Promise<ISourceDocumentInterface[]>
  abstract updateExtractedText(id: string, extractedText: string, status: string): Promise<ISourceDocumentInterface | null>
}
