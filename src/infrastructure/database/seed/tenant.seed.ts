// Creates the default tenant and backfills tenantId onto rows written before
// tenancy existed. Without the backfill those rows are not "insecure" — they
// are invisible, because every query now filters on a field they lack.
//
// Idempotent: safe to run on every deploy and on an already-migrated database.

import mongoose from 'mongoose';
import { MongoConnection } from '../MongoConnection';
import { TenantModel } from '../modal/tenant/tenant.model';

const DEFAULT_SLUG = process.env['TENANT_DEFAULT_SLUG'] || 'tenant-zero';
const DEFAULT_NAME = process.env['TENANT_DEFAULT_NAME'] || 'Tenant Zero';

const BACKFILL_COLLECTIONS = ['projects', 'case_documents', 'source_documents', 'audit_events'];

export async function seedTenant(): Promise<{ tenantId: string; backfilled: Record<string, number> }> {
  let tenant: any = await TenantModel.findOne({ slug: DEFAULT_SLUG });
  if (!tenant) {
    tenant = await TenantModel.create({ name: DEFAULT_NAME, slug: DEFAULT_SLUG, status: 'active' });
    console.log(`Created tenant '${DEFAULT_SLUG}' (${tenant._id}).`);
  } else {
    console.log(`Tenant '${DEFAULT_SLUG}' already present (${tenant._id}).`);
  }

  const tenantId = String(tenant._id);
  const backfilled: Record<string, number> = {};

  for (const name of BACKFILL_COLLECTIONS) {
    const collection = mongoose.connection.collection(name);
    const result = await collection.updateMany(
      { $or: [{ tenantId: { $exists: false } }, { tenantId: null }] },
      { $set: { tenantId } }
    );
    backfilled[name] = result.modifiedCount;
    if (result.modifiedCount > 0) console.log(`  backfilled ${result.modifiedCount} row(s) in ${name}`);
  }

  return { tenantId, backfilled };
}

if (require.main === module) {
  // Use the application's own connection rather than rebuilding a URI here:
  // MONGODB_HOST may or may not already carry a scheme and port depending on
  // the environment, and duplicating that logic is how this script first broke.
  (async () => {
    new MongoConnection();
    await new Promise((resolve) => mongoose.connection.once('open', resolve));
    const { tenantId, backfilled } = await seedTenant();
    const total = Object.values(backfilled).reduce((a, b) => a + b, 0);
    console.log(`\nDefault tenant: ${tenantId}. Rows backfilled: ${total}.`);
    await mongoose.connection.close();
    process.exit(0);
  })().catch((err) => { console.error(err); process.exit(1); });
}
