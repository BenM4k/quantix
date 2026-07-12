---
description: 
---

# New Feature Workflow

Use this workflow when implementing a new feature.

## Step 1: Understand Requirements

Before coding:

- Identify user requirements.
- Identify affected modules.
- Identify database changes.
- Identify security concerns.
- Identify authorization requirements.

Ask questions if requirements are unclear.

---

## Step 2: Architecture Planning

Define:

- Database changes.
- Types.
- DAL functions.
- Services.
- Server actions.
- UI components.
- Tests.

Follow:

UI
 |
Server Action
 |
Service
 |
DAL
 |
Database

---

## Step 3: Database

If database changes are required:

1. Update Drizzle schema.
2. Generate migration.
3. Verify relations.
4. Add indexes.
5. Consider RLS.

---

## Step 4: Backend

Implement:

1. DAL
2. Service
3. Server Action

Never start from UI.

---

## Step 5: Frontend

Implement:

- Server components first.
- Client components only when needed.
- Loading states.
- Error states.
- Empty states.

---

## Step 6: Verification

Before finishing:

Check:

- TypeScript passes.
- Lint passes.
- Authorization exists.
- Tenant isolation exists.
- Errors are typed.
- Tests added.