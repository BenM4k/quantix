---
trigger: always_on
---

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
