import { model } from "mongoose";
import { ICaseDocumentDocument, ICaseDocumentModel } from "./case_document.types";
import CaseDocumentSchema from "./case_document.schema";
export const CaseDocumentModel = model<ICaseDocumentDocument>("case_document", CaseDocumentSchema) as ICaseDocumentModel;
