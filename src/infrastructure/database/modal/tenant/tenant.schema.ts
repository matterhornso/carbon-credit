import { Schema } from "mongoose";

export const TenantSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  status: { type: String, required: true, default: 'active' },
}, { timestamps: true });

// One row per user who may act for a tenant. A user acting for two tenants has
// two rows; resolution refuses to guess when that happens.
export const TenantMembershipSchema = new Schema({
  userUuid: { type: String, required: true, index: true },
  tenantId: { type: String, required: true, index: true },
  role: { type: String },
}, { timestamps: true });

TenantMembershipSchema.index({ userUuid: 1, tenantId: 1 }, { unique: true });
