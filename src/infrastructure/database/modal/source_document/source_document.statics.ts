import { ISourceDocumentModel } from "./source_document.types";
import { Model } from "mongoose";
import { ISourceDocumentInterface } from "../../../../domain/source_document/sourceDocumentInterface";

export async function createSourceDocument(
  this: Model<ISourceDocumentModel>,
  tenantId: string,
  doc: ISourceDocumentInterface
): Promise<any> {
  try {
    const record = await this.create({ ...doc, tenantId });
    return record;
  } catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db");
  }
}

export async function getSourceDocumentsByProjectId(
  this: Model<ISourceDocumentModel>,
  tenantId: string,
  projectId: string
): Promise<any> {
  const records = await this.find({ projectId, tenantId }).sort({ createdAt: -1 });
  return records || [];
}

export async function updateExtractedText(
  this: Model<ISourceDocumentModel>,
  tenantId: string,
  id: string,
  extractedText: string,
  status: string
): Promise<any> {
  const record = await this.findOneAndUpdate(
    { _id: id, tenantId },
    { $set: { extractedText, status } },
    { new: true }
  );
  return record || null;
}
