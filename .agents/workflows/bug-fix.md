---
description: 
---


---

# `.agent/workflows/bug-fix.md`

```md
# Bug Fix Workflow

Use this workflow when fixing bugs.

## Step 1: Understand the Bug

Before changing code:

Identify:

- Expected behavior.
- Actual behavior.
- Reproduction steps.
- Affected users.
- Severity.

Do not immediately patch without understanding the cause.

---

# Step 2: Locate the Root Cause

Investigate:

- Logs.
- Error messages.
- Recent changes.
- Related services.
- Database state.

Fix the root cause, not only the symptom.

---

# Step 3: Check Architecture

Ensure the fix follows:

UI
 |
Action/API
 |
Service
 |
DAL
 |
Database


Do not bypass layers for convenience.

---

# Step 4: Implement Fix

Prefer:

- Small focused changes.
- Existing patterns.
- Existing utilities.

Avoid:

- Large refactors during bug fixes.
- Introducing unnecessary dependencies.

---

# Step 5: Add Regression Protection

Add:

- Unit test.
- Integration test.
- Validation test.

The bug should not return.

---

# Step 6: Verify

Check:

✓ Bug reproduced before fix  
✓ Fix solves issue  
✓ Existing behavior preserved  
✓ TypeScript passes  
✓ Tests pass  
✓ No security regression