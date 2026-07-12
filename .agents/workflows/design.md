---
description: 
---

# Antigravity Workflow: Glassmorphism / Neumorphism Design System

Before making ANY UI changes, treat the existing design system as the source of truth.

## Design Philosophy

This project uses a premium hybrid of:

- Glassmorphism
- Soft Neumorphism
- Frosted translucent surfaces
- Warm orange/amber glow accents
- Large rounded corners
- Soft shadows
- Layered depth
- Background blur

Every new component must feel like it belongs in the existing system.

---

## Never Override

Never replace or ignore these design tokens:

- --glass-bg
- --glass-border
- --glass-shadow
- --glow-orange
- --glow-amber

Always consume existing CSS variables instead of introducing new colors.

---

## Surface Hierarchy

### Page

Uses

background

plus

ambient-bg

plus

vignette

---

### Primary Surface

Use

glass

Examples

- cards
- sidebars
- dropdowns
- context menus
- popovers

---

### Elevated Surface

Use

glass-strong

Examples

- dialogs
- modals
- sheets
- drawers
- command palette

---

### Secondary Surface

Use

glass-subtle

Examples

- badges
- tooltips
- chips
- hover panels

---

## Required Blur

All floating UI MUST blur whatever is behind it.

Examples

DropdownMenuContent

PopoverContent

ContextMenuContent

MenubarContent

SheetContent

Drawer

DialogContent

AlertDialogContent

Command

HoverCardContent

TooltipContent

NavigationMenuContent

must have

```
backdrop-filter: blur(...)
-webkit-backdrop-filter: blur(...)
```

Never use opaque backgrounds.

---

## Background Rules

Instead of

```
bg-background
```

prefer

```
glass
```

or

```
glass-strong
```

or

```
bg-[var(--glass-bg)]
backdrop-blur-xl
border-[var(--glass-border)]
shadow-[var(--glass-shadow)]
```

---

## Required Classes

Dropdowns

```
className="
glass
backdrop-blur-xl
border-white/10
"
```

Dialogs

```
className="
glass-strong
backdrop-blur-3xl
"
```

Sheets

```
className="
glass-strong
backdrop-blur-3xl
"
```

Popovers

```
className="
glass
backdrop-blur-xl
"
```

Tooltips

```
className="
glass-subtle
backdrop-blur-lg
"
```

---

## Motion

Animations should feel soft.

Prefer

- fade
- blur
- slight scale
- spring easing

Avoid

- hard slides
- aggressive zooms
- large rotations

---

## Shadows

Prefer

```
var(--glass-shadow)
```

Optionally combine with

```
glow-sm
glow-orange
glow-amber
```

Never use harsh black shadows.

---

## Border Style

Always use

```
border-[var(--glass-border)]
```

Never use solid dark borders.

---

## Radius

Use the design tokens.

```
rounded-xl
rounded-2xl
rounded-3xl
```

Avoid sharp corners.

---

## Component Checklist

Before finishing a component verify:

✓ Uses design tokens

✓ Uses glass utility

✓ Has backdrop blur

✓ Uses translucent background

✓ Uses glass border

✓ Uses glass shadow

✓ Matches warm glow palette

✓ Matches neumorphic depth

✓ Works in dark mode

✓ Does not introduce new colors

If any answer is No, revise before completing.

---

## Shadcn Components

Whenever modifying shadcn/ui components, automatically convert these:

DropdownMenuContent

→ glass

PopoverContent

→ glass

DialogContent

→ glass-strong

SheetContent

→ glass-strong

AlertDialogContent

→ glass-strong

CommandDialog

→ glass-strong

ContextMenuContent

→ glass

HoverCardContent

→ glass

TooltipContent

→ glass-subtle

NavigationMenuContent

→ glass

SelectContent

→ glass

Combobox popovers

→ glass

---

## Goal

Every floating layer should feel like a frosted piece of premium glass floating above the ambient background while preserving translucency, depth, blur, and the existing orange/amber glow system.