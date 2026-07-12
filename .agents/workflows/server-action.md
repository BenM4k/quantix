---
description: 
---

# Server Action Workflow

Use when creating or modifying a server action.

## Architecture

Follow:

action → service → DAL

---

## Action

Create:

src/actions/<feature>.action.ts

Must:

- Validate session.
- Validate input.
- Sanitize input.
- Call service.
- Return Result.

Must not:

- Query database.
- Contain business logic.

---

## Service

Create:

src/services/<feature>.service.ts

Contains:

- Business rules.
- Authorization logic.
- Transactions.
- External calls.

Must:

- Catch errors.
- Return Result.

---

## DAL

Create:

src/dal/<feature>.dal.ts

Contains:

- Drizzle queries.
- Database mutations.

Must:

- Receive organizationId.
- Never check permissions.

---

## Final Check

Verify:

✓ No thrown errors  
✓ Typed response  
✓ Tenant isolation  
✓ Validation exists