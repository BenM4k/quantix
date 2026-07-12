---
trigger: always_on
---

# Next.js Rules

## App Router

- Use the App Router architecture.
- Prefer layouts for shared UI.
- Use loading.tsx for async loading states.
- Use error.tsx for route errors.
- Use not-found.tsx for missing resources.

## Server Components

- Fetch data in Server Components whenever possible.
- Avoid client-side fetching unless interaction requires it.
- Do not expose server-only code to client components.

## Routing

- Keep route handlers thin.
- Business logic belongs in services.
- Avoid unnecessary API routes.

## Metadata

Every public route should define metadata.

## Performance

Prefer:

- Streaming.
- Suspense boundaries.
- Server rendering.
- Partial hydration.

Avoid unnecessary client JavaScript.