import { ICaseDocumentModel } from "./case_document.types";
import { Model } from "mongoose";
import { ICaseDocumentInterface } from "../../../../domain/case_document/caseDocumentInterface";
import { UpdateCaseDocumentSection } from "../../../../domain/case_document/UpdateCaseDocumentSection";

export async function createCaseDocument(
  this: Model<ICaseDocumentModel>,
  tenantId: string,
  caseDocument: ICaseDocumentInterface
): Promise<any> {
  try {
    const record = await this.create({ ...caseDocument, tenantId });
    return record;
  } catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db");
  }
}

export async function updateSection(
  this: Model<ICaseDocumentModel>,
  tenantId: string,
  update: UpdateCaseDocumentSection
): Promise<any> {
  const setFields: any = {};
  if (update.status) setFields["sections.$.status"] = update.status;
  if (update.content !== undefined) setFields["sections.$.content"] = update.content;
  if (update.sourceCitations) setFields["sections.$.sourceCitations"] = update.sourceCitations;
  if (update.warnings !== undefined) setFields["sections.$.warnings"] = update.warnings;
  if (update.lastEditedByUserId) setFields["sections.$.lastEditedByUserId"] = update.lastEditedByUserId;
  // Explicitly compared against undefined: passing null is how a successful
  // regeneration clears a previously recorded failure.
  if (update.lastError !== undefined) setFields["sections.$.lastError"] = update.lastError;
  setFields["sections.$.lastEditedAt"] = new Date();

  const updateQuery: any = { $set: setFields };
  if (update.generationHistoryEntry) {
    updateQuery.$push = { "sections.$.generationHistory": update.generationHistoryEntry };
  }

  const record = await this.findOneAndUpdate(
    { _id: update.caseDocumentId, tenantId, "sections.key": update.sectionKey },
    updateQuery,
    { new: true }
  );
  return record || null;
}

export async function getCaseDocumentByProjectId(
  this: Model<ICaseDocumentModel>,
  tenantId: string,
  projectId: string
): Promise<any> {
  const record = await this.findOne({ projectId, tenantId });
  return record || null;
}
