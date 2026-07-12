---
description: 
---

# Database Change Workflow

Use for schema changes.

## Step 1

Analyze:

- New tables.
- Relations.
- Indexes.
- Constraints.
- Tenant requirements.

---

## Step 2

Update:

services/drizzle/schemas/

---

## Step 3

Generate migration:

drizzle-kit generate

---

## Step 4

Review migration:

Check:

- Foreign keys.
- Indexes.
- Enum changes.
- Data migration needs.

---

## Step 5

Apply:

drizzle-kit migrate

---

## Step 6

Update:

- DAL functions.
- Types.
- Services.
- Tests.