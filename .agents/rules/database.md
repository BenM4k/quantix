---
trigger: always_on
---

# Database Rules

Using Drizzle ORM.

## Architecture

Database access:

component ❌
action ❌
service ❌

Only:

DAL ✅

## Schema Rules

All tenant tables MUST:

- Have organization_id.
- Have foreign keys.
- Have indexes for tenant queries.

## Queries

Always:

- Select only required columns.
- Use transactions for multi-step operations.
- Validate ownership before mutations.

## Migrations

Never manually modify generated migrations.

Use:

drizzle-kit generate
drizzle-kit migrate

## Naming

Use:

snake_case database names.

Use:

camelCase TypeScript names.