---
trigger: always_on
---

# Server Actions Rules

## Architecture Pattern

All server mutations MUST follow this pattern:

action → service → DAL

The responsibility boundaries are strict.

Example:

app/actions/user.action.ts
        |
        v
services/user.service.ts
        |
        v
dal/user.dal.ts

---

# Action Layer Rules

Server actions are the entry point from the UI.

Actions are responsible for:

- Checking authentication/session.
- Checking basic authorization.
- Validating input.
- Sanitizing input.
- Calling services.
- Returning typed Result responses.

Actions MUST NOT:

- Query the database directly.
- Contain business logic.
- Call external services directly.
- Handle complex workflows.
- Modify database records directly.

Example:

GOOD:

```ts
export async function createUserAction(
  input: CreateUserInput
): Promise<Result<User>> {
  const session = await getSession();

  if (!session) {
    return err({
      code: "UNAUTHORIZED",
      message: "Authentication required"
    });
  }

  const validated = schema.safeParse(input);

  if (!validated.success) {
    return err({
      code: "INVALID_INPUT",
      message: "Invalid input"
    });
  }

  return createUserService({
    userId: session.user.id,
    input: validated.data
  });
}