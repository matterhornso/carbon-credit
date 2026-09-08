import { Schema } from "mongoose";
import { createSourceDocument, getSourceDocumentsByProjectId, updateExtractedText } from "./source_document.statics";

const SourceDocumentSchema = new Schema({
  // Isolation boundary. Indexed because every query filters on it.
  tenantId: { type: String, required: true, index: true },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'project',
    required: true,
  },
  filename: {
    type: String,
    required: true
  },
  storageRef: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  sizeBytes: {
    type: Number,
    default: 0
  },
  uploadedByUserId: {
    type: String,
    required: true
  },
  extractedText: {
    type: String
  },
  linkedSections: [{ type: String }],
  status: {
    type: String,
    required: true,
    default: 'uploaded'
  },
}, { timestamps: true });

SourceDocumentSchema.index({ projectId: 1 });

SourceDocumentSchema.statics.createSourceDocument = createSourceDocument;
SourceDocumentSchema.statics.getSourceDocumentsByProjectId = getSourceDocumentsByProjectId;
SourceDocumentSchema.statics.updateExtractedText = updateExtractedText;

export default SourceDocumentSchema;
