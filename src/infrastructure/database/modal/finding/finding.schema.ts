import { Schema } from "mongoose";
import {
  createFinding,
  replaceOpenSelfReviewFindings,
  getFindingsByProjectId,
  getFindingStatsByMethodology,
  updateFindingStatus,
} from "./finding.statics";

const FindingSchema = new Schema({
  // Isolation boundary. Indexed because every query filters on it.
  tenantId: { type: String, required: true, index: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'project', required: true },
  sectionKey: { type: String, required: true },
  claim: { type: String, required: true },
  issue: { type: String, required: true },
  remediation: { type: String },
  severity: { type: String, required: true },
  category: { type: String, required: true },
  origin: { type: String, required: true },
  status: { type: String, required: true, default: 'open' },
  resolutionNote: { type: String },
  // Denormalised from the project's methodology so the cross-project series can
  // be grouped without a join. Findings are only useful comparatively.
  methodologyCode: { type: String, index: true },
  raisedByUserId: { type: String },
  resolvedAt: { type: Date },
}, { timestamps: { createdAt: true, updatedAt: false } });

FindingSchema.index({ projectId: 1, createdAt: -1 });
// The replace-on-re-review path filters on exactly this shape.
FindingSchema.index({ tenantId: 1, projectId: 1, sectionKey: 1, origin: 1, status: 1 });

FindingSchema.statics.createFinding = createFinding;
FindingSchema.statics.replaceOpenSelfReviewFindings = replaceOpenSelfReviewFindings;
FindingSchema.statics.getFindingsByProjectId = getFindingsByProjectId;
FindingSchema.statics.getFindingStatsByMethodology = getFindingStatsByMethodology;
FindingSchema.statics.updateFindingStatus = updateFindingStatus;

export default FindingSchema;
