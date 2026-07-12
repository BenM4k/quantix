---
trigger: always_on
---

# Security Rules

## Input Validation

Never trust external input.
never read  a .env file
Validate:

- Forms.
- Query params.
- Headers.
- Webhooks.
- API payloads.

Use Zod schemas.

## Authentication

Authentication ≠ Authorization.

Always check:

- User session.
- Organization membership.
- Permissions.

## Secrets

Never:

- Log secrets.
- Return secrets to clients.
- Store plaintext credentials.

## Sensitive Operations

Require:

- Explicit authorization.
- Audit logging.
- Validation.

## Logging

Never log:

- Passwords.
- Tokens.
- Private keys.
- Session data.