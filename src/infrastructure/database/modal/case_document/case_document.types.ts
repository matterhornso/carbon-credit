import { Document, Model } from "mongoose";
import { ICaseDocumentInterface } from "../../../../domain/case_document/caseDocumentInterface"
import { UpdateCaseDocumentSection } from "../../../../domain/case_document/UpdateCaseDocumentSection";

export interface ICaseDocumentDocument extends ICaseDocumentInterface, Document { }

export interface ICaseDocumentModel extends Model<ICaseDocumentDocument> {
  createCaseDocument: (this: ICaseDocumentModel, caseDocument: ICaseDocumentInterface) => Promise<ICaseDocumentInterface>;
  updateSection: (this: ICaseDocumentModel, update: UpdateCaseDocumentSection) => Promise<ICaseDocumentInterface | null>;
  getCaseDocumentByProjectId: (this: ICaseDocumentModel, projectId: string) => Promise<ICaseDocumentInterface | null>;
}
