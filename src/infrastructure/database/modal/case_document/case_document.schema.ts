import { Schema } from "mongoose";
import { createCaseDocument, updateSection, getCaseDocumentByProjectId } from "./case_document.statics";

const GenerationEventSchema = new Schema({
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  model: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

const CaseSectionSchema = new Schema({
  key: { type: String, required: true },
  status: { type: String, required: true, default: 'not_started' },
  content: { type: Schema.Types.Mixed },
  sourceCitations: [{ type: String }],
  generationHistory: [GenerationEventSchema],
  lastEditedByUserId: { type: String },
  lastEditedAt: { type: Date },
  warnings: [{ type: String }],
}, { _id: false });

const CaseDocumentSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'project',
    required: true,
  },
  sections: [CaseSectionSchema],
}, { timestamps: true });

CaseDocumentSchema.index({ projectId: 1 }, { unique: true });

CaseDocumentSchema.statics.createCaseDocument = createCaseDocument;
CaseDocumentSchema.statics.updateSection = updateSection;
CaseDocumentSchema.statics.getCaseDocumentByProjectId = getCaseDocumentByProjectId;

export default CaseDocumentSchema;
