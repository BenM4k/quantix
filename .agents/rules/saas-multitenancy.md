---
trigger: always_on
---

# SaaS Multi-Tenancy Rules

## Tenant Isolation Principle

This application is multi-tenant.

Every piece of tenant data MUST be isolated by organization_id.

Never assume a user can access data only because they are authenticated.

Authentication identifies the user.
Authorization determines access.

---

# Organization Context

Every tenant-scoped operation MUST know:

- user_id
- organization_id
- user role
- permissions

Never accept organization_id blindly from client input.

The organization context must come from:

- authenticated session
- verified membership
- server-side authorization checks

---

# Database Rules

Every tenant-scoped table MUST:

- Include organization_id.
- Have a foreign key referencing organization.
- Have an index on organization_id.
- Apply organization filtering in every query.

Example:

GOOD:

```ts
db
  .select()
  .from(invoice)
  .where(
    and(
      eq(invoice.id, invoiceId),
      eq(invoice.organizationId, organizationId)
    )
  );