import { Schema } from "mongoose";

const JobSchema = new Schema({
  tenantId: { type: String, required: true, index: true },
  type: { type: String, required: true, index: true },
  payload: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, required: true, default: 'queued', index: true },
  attempts: { type: Number, required: true, default: 0 },
  maxAttempts: { type: Number, required: true, default: 3 },
  lastError: { type: String, default: null },
  claimedAt: { type: Date, default: null },
  startedAt: { type: Date },
  finishedAt: { type: Date },
  result: { type: Schema.Types.Mixed },
}, { timestamps: true });

// The claim query: oldest queued job of any tenant.
JobSchema.index({ status: 1, createdAt: 1 });

export default JobSchema;
