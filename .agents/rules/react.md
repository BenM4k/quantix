---
trigger: always_on
---

# React Development Rules

## Component Design

- Prefer composition over inheritance.
- Build small, focused components.
- Components must have a single responsibility.
- Separate presentational components from business logic.
- Avoid large components with multiple responsibilities.

## Component Organization

Prefer:

feature/
  components/
  hooks/
  types.ts
  utils.ts

Avoid:

components/
  HugeComponent.tsx

## Client Components

- Default to Server Components.
- Add "use client" only when required.
- Do not make parent components client components unless necessary.
- Keep client components focused on user interaction.

## State Management

Prefer:

1. Server state
2. URL state
3. Local React state

Avoid unnecessary global state.

## Hooks

- Custom hooks should encapsulate reusable behavior.
- Hooks must not contain UI rendering.
- Avoid creating hooks for one-time logic.