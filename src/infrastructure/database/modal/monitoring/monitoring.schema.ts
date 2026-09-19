import { Schema } from "mongoose";
import {
  createPeriod, getPeriodsByProjectId, getPeriodById, updateParameter, updatePeriodStatus,
} from "./monitoring.statics";

const MonitoredParameterSchema = new Schema({
  parameter: { type: String, required: true },
  unit: { type: String },
  // Verbatim from the methodology. Deliberately not parsed into a schedule:
  // the real strings are conditional free text and a fabricated due date is
  // worse than none. See domain/monitoring/monitoringInterface.ts.
  frequency: { type: String, required: true },
  method: { type: String, required: true },
  status: { type: String, default: 'not_collected' },
  value: { type: String },
  evidenceDocumentIds: [{ type: String }],
  collectedAt: { type: Date },
  collectedByUserId: { type: String },
  notApplicableReason: { type: String },
}, { _id: false });

const MonitoringPeriodSchema = new Schema({
  tenantId: { type: String, required: true, index: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'project', required: true },
  periodNumber: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, required: true, default: 'open' },
  // Snapshotted at period open, not referenced: a methodology revised
  // mid-crediting-period must not rewrite what an earlier period had to collect.
  parameters: [MonitoredParameterSchema],
  issuedVolume: { type: Number },
  vintage: { type: String },
  notes: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

// One period number per project. Opening the same period twice would split a
// year's data across two records and neither would be reportable.
MonitoringPeriodSchema.index({ tenantId: 1, projectId: 1, periodNumber: 1 }, { unique: true });

MonitoringPeriodSchema.statics.createPeriod = createPeriod;
MonitoringPeriodSchema.statics.getPeriodsByProjectId = getPeriodsByProjectId;
MonitoringPeriodSchema.statics.getPeriodById = getPeriodById;
MonitoringPeriodSchema.statics.updateParameter = updateParameter;
MonitoringPeriodSchema.statics.updatePeriodStatus = updatePeriodStatus;

export default MonitoringPeriodSchema;
