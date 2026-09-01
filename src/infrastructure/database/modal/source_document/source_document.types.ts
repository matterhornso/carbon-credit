import { Document, Model } from "mongoose";
import { ISourceDocumentInterface } from "../../../../domain/source_document/sourceDocumentInterface"

export interface ISourceDocumentDocument extends ISourceDocumentInterface, Document { }

export interface ISourceDocumentModel extends Model<ISourceDocumentDocument> {
  createSourceDocument: (this: ISourceDocumentModel, doc: ISourceDocumentInterface) => Promise<ISourceDocumentInterface>;
  getSourceDocumentsByProjectId: (this: ISourceDocumentModel, projectId: string) => Promise<ISourceDocumentInterface[]>;
  updateExtractedText: (this: ISourceDocumentModel, id: string, extractedText: string, status: string) => Promise<ISourceDocumentInterface | null>;
}
