// The isolation boundary, as a value rather than a convention.
//
// Repositories are constructed with one of these and cannot be constructed
// without one, so tenant filtering is not something a controller can forget:
// omitting it is a compile error, and an empty value is a runtime throw at
// construction rather than a query that quietly returns everyone's data.
//
// This matters more here than in an ordinary product. The platform is intended
// to hold the pipelines of firms that compete with each other, while its
// operator runs a portfolio of its own alongside them. Care is not a control.

export class TenantScope {
  public readonly tenantId: string;

  constructor(tenantId: string) {
    if (!tenantId || typeof tenantId !== 'string' || tenantId.trim().length === 0) {
      throw new Error('TenantScope requires a tenantId — refusing to build an unscoped query');
    }
    this.tenantId = tenantId.trim();
  }

  /** Merge the tenant into a mongo filter, overriding any tenantId a caller supplied. */
  filter(base: Record<string, any> = {}): Record<string, any> {
    return { ...base, tenantId: this.tenantId };
  }

  /** Stamp the tenant onto a document being created. */
  stamp<T extends Record<string, any>>(document: T): T & { tenantId: string } {
    return { ...document, tenantId: this.tenantId };
  }

  equals(other: TenantScope | undefined): boolean {
    return !!other && other.tenantId === this.tenantId;
  }
}
