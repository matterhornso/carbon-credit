// An operator of the platform. The first one is us: the developer arm runs on
// the same system its customers do, which is what stops the product drifting
// from what a developer actually needs.

export interface ITenantInterface {
  name?: string;
  /** Stable key used in configuration and seeds, e.g. 'tenant-zero'. */
  slug?: string;
  status?: string; // 'active' | 'suspended'
  createdAt?: Date;
}

// Maps an authenticated user onto the tenant they act for. Kept in this
// service rather than in user-service: tenancy is a property of this platform,
// and threading it through a shared identity service would make every tenancy
// change a cross-repository deployment.
export interface ITenantMembershipInterface {
  userUuid?: string;
  tenantId?: string;
  role?: string;
}
