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