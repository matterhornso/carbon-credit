// Resolves the tenant an authenticated caller acts for.
//
// Deliberately refuses two things rather than guessing: a user with no
// membership, and a user with more than one. Both are states where picking a
// tenant on the caller's behalf would mean showing someone another operator's
// pipeline, which is the exact failure tenancy exists to prevent.
//
// TENANT_DEFAULT_SLUG exists for single-tenant and local deployments, where
// every authenticated user legitimately belongs to the one tenant. It must not
// be set anywhere more than one operator uses the system.

import { TenantScope } from '../../domain/tenant/TenantScope';
import { TenantModel, TenantMembershipModel } from '../../infrastructure/database/modal/tenant/tenant.model';

export class TenantResolutionError extends Error {}

export class TenantResolver {
  async scopeFor(userUuid: string): Promise<TenantScope> {
    if (!userUuid) throw new TenantResolutionError('Cannot resolve a tenant without an authenticated user');

    const memberships = await TenantMembershipModel.find({ userUuid }).lean();

    if (memberships.length === 1) return new TenantScope(String(memberships[0].tenantId));

    if (memberships.length > 1) {
      throw new TenantResolutionError(
        `User belongs to ${memberships.length} tenants; the request must say which one it is acting for`
      );
    }

    const defaultSlug = process.env['TENANT_DEFAULT_SLUG'];
    if (!defaultSlug) {
      throw new TenantResolutionError('User is not a member of any tenant');
    }

    const tenant = await TenantModel.findOne({ slug: defaultSlug }).lean();
    if (!tenant) {
      throw new TenantResolutionError(`TENANT_DEFAULT_SLUG is set to '${defaultSlug}' but no such tenant exists`);
    }
    return new TenantScope(String(tenant._id));
  }
}
