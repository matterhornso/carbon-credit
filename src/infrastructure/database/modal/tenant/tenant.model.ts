import { model, Document, Model } from "mongoose";
import { ITenantInterface, ITenantMembershipInterface } from "../../../../domain/tenant/tenantInterface";
import { TenantSchema, TenantMembershipSchema } from "./tenant.schema";

export interface ITenantDocument extends ITenantInterface, Document { }
export interface ITenantMembershipDocument extends ITenantMembershipInterface, Document { }

export const TenantModel = model<ITenantDocument>("tenant", TenantSchema) as Model<ITenantDocument>;
export const TenantMembershipModel =
  model<ITenantMembershipDocument>("tenant_membership", TenantMembershipSchema) as Model<ITenantMembershipDocument>;
