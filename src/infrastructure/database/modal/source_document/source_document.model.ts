import { model } from "mongoose";
import { ISourceDocumentDocument, ISourceDocumentModel } from "./source_document.types";
import SourceDocumentSchema from "./source_document.schema";
export const SourceDocumentModel = model<ISourceDocumentDocument>("source_document", SourceDocumentSchema) as ISourceDocumentModel;
