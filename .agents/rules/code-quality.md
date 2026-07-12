---
trigger: always_on
---

# Code Quality Rules

## TypeScript

- Strict TypeScript only.
- Avoid any.
- Avoid unnecessary type assertions.
- Prefer explicit return types for public functions.

## Errors

Never throw application errors.

Use typed results.

## Functions

Functions should:

- Do one thing.
- Have clear names.
- Avoid hidden side effects.

## Imports

Prefer:

absolute imports.

Avoid:

deep relative imports.

## Refactoring

Before adding code:

- Search existing utilities.
- Reuse existing patterns.
- Avoid duplication.