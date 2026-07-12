<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices. never read a .env file

# Project Agent Instructions

Before making any changes:

1. Read all rules inside `.agent/rules`.
2. Follow the architecture patterns defined there.
3. Do not introduce patterns that conflict with these rules.
4. If a requested change conflicts with a rule, explain the conflict before coding.

## Priority Rules

The following rules are mandatory:

- Server actions must follow:
  action → service → DAL

- Database access only through DAL.

- All responses must use typed Result objects.

- React components should follow composition patterns.

- Tenant data must always use organization isolation.

- Security rules must never be bypassed for convenience.
- Never ask to change .claude/config.toml
- Never read the .env file.



<!-- END:nextjs-agent-rules -->
