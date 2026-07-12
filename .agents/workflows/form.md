---
description: 
---

# Form Development Workflow

Stack:

- React Hook Form
- Zod
- shadcn/ui

---

# Step 1: Define Schema First

Every form starts with a Zod schema.

Example:

schema.ts

```ts
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2)
});