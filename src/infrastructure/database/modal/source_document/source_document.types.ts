import { Document, Model } from "mongoose";
import { ISourceDocumentInterface } from "../../../../domain/source_document/sourceDocumentInterface"

export interface ISourceDocumentDocument extends ISourceDocumentInterface, Document { }

export interface ISourceDocumentModel extends Model<ISourceDocumentDocument> {
  createSourceDocument: (this: ISourceDocumentModel, tenantId: string, doc: ISourceDocumentInterface) => Promise<ISourceDocumentInterface>;
  getSourceDocumentsByProjectId: (this: ISourceDocumentModel, tenantId: string, projectId: string) => Promise<ISourceDocumentInterface[]>;
  updateExtractedText: (this: ISourceDocumentModel, tenantId: string, id: string, extractedText: string, status: string) => Promise<ISourceDocumentInterface | null>;
}
