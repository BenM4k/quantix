---
description: 
---

# Code Review Workflow

Review code using these categories.

## Architecture

Check:

- Correct layer placement.
- No business logic in actions.
- No DB access outside DAL.

---

## Security

Check:

- Authentication.
- Authorization.
- Input validation.
- Tenant isolation.

---

## Database

Check:

- Indexes.
- Transactions.
- Organization filtering.

---

## React

Check:

- Server/client boundaries.
- Component size.
- Composition.

---

## Quality

Check:

- Types.
- Error handling.
- Tests.
- Naming.