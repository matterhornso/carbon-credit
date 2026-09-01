import { ISourceDocumentModel } from "./source_document.types";
import { Model } from "mongoose";
import { ISourceDocumentInterface } from "../../../../domain/source_document/sourceDocumentInterface";

export async function createSourceDocument(
  this: Model<ISourceDocumentModel>,
  doc: ISourceDocumentInterface
): Promise<any> {
  try {
    const record = await this.create(doc);
    return record;
  } catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db");
  }
}

export async function getSourceDocumentsByProjectId(
  this: Model<ISourceDocumentModel>,
  projectId: string
): Promise<any> {
  const records = await this.find({ projectId }).sort({ createdAt: -1 });
  return records || [];
}

export async function updateExtractedText(
  this: Model<ISourceDocumentModel>,
  id: string,
  extractedText: string,
  status: string
): Promise<any> {
  const record = await this.findOneAndUpdate(
    { _id: id },
    { $set: { extractedText, status } },
    { new: true }
  );
  return record || null;
}
