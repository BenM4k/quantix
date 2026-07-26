---
description:
---

# UI Component Workflow

Use this workflow when creating or modifying UI.

Stack:

- React
- Next.js
- shadcn/ui
- Tailwind CSS

---

# Step 1: Component Planning

Before creating a component:

Determine:

- Is it reusable?
- Is it a server component?
- Does it need client state?
- Does it belong to a feature?

Prefer:

features/
components/
hooks/
types.ts

---

# Step 2: Use shadcn First

Before creating custom components:

Check existing shadcn components.

Prefer:

- Button
- Input
- Card
- Dialog
- Sheet
- Dropdown
- Command
- Table
- Form
- Toast
- Alert

Extend existing components instead of duplicating.

---

# Step 3: Component Architecture

Prefer:

Container Component
|
v
Presentational Components

Example:

UserPage

├── UserHeader
├── UserStats
└── UserTable

Avoid:

One large component containing everything.

---

# Step 4: Styling

Use:

- Tailwind classes.
- Existing design tokens.
- shadcn patterns.

Avoid:

- Inline styles.
- Random CSS files.
- Hardcoded colors.

---

# Step 5: Accessibility

Every component must consider:

- Keyboard navigation.
- Screen readers.
- Proper labels.
- Focus states.
- Semantic HTML.

---

# Step 6: States

Every async UI should handle:

- Loading.
- Success.
- Empty.
- Error.

---

# Step 7: Client Components

Only use:

"use client"

when required.

Examples:

Allowed:

- Forms.
- Interactive dialogs.
- Client state.
- Browser APIs.

Avoid:

Making entire pages client components.

# UI Framework Standards

This project uses:

- Tailwind CSS v4 ONLY
- Latest shadcn/ui components
- React 19
- Next.js App Router
- TypeScript

## Tailwind

Always generate Tailwind CSS v4 code.

Rules:

- Never use Tailwind v3 syntax.
- Use @import "tailwindcss".
- Use CSS-first configuration.
- Use @theme, @utility, and @variant when appropriate.
- Never introduce deprecated utilities or configuration.
- Never create or modify tailwind.config.js unless I explicitly ask.

## shadcn/ui

Always use the latest shadcn CLI and registry.

Before adding or modifying a component:

- Assume the latest registry version.
- Follow the latest component API.
- Prefer the newest composition patterns.
- Do not recreate components that already exist in the registry.
- If a component has changed in recent versions, use the current implementation instead of older blog examples.

When installing components, use:

pnpm dlx shadcn@latest add <component>

(or the project's package manager equivalent.)

If updating an existing component, preserve custom business logic while migrating it to the newest shadcn implementation.

## General

Avoid outdated tutorials.

When multiple implementations exist:

- Prefer the official Tailwind documentation.
- Prefer the official shadcn registry.
- Prefer modern React patterns.
- Avoid deprecated APIs unless explicitly requested.

If unsure whether an API has changed recently, verify against the latest official documentation before generating code.
