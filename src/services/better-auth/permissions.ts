// lib/permissions/statement.ts
import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
  invoice: ["create", "update", "delete", "void", "view"],
  journal: ["create", "post", "view"],
  product: ["create", "update", "delete", "view"],
  stock: ["adjust", "view"],
  customer: ["create", "update", "delete", "view"],
  settings: ["update", "view"],
  company: ["delete", "transfer-ownership"], // owner-only, split out on purpose
  member: ["invite", "remove", "update-role"],
  report: ["view"],
} as const;

export const ac = createAccessControl(statement);

const fullOperational = {
  invoice: ["create", "update", "delete", "void", "view"],
  journal: ["create", "post", "view"],
  product: ["create", "update", "delete", "view"],
  stock: ["adjust", "view"],
  customer: ["create", "update", "delete", "view"],
  settings: ["update", "view"],
  member: ["invite", "remove", "update-role"],
  report: ["view"],
} as const;

export const owner = ac.newRole({
  ...fullOperational,
  company: ["delete", "transfer-ownership"], // the one thing admin can't touch
});

export const admin = ac.newRole({
  ...fullOperational,
  // no `company` grants — can't delete the company or change ownership
});

export const accountant = ac.newRole({
  invoice: ["create", "update", "void", "view"],
  journal: ["create", "post", "view"],
  product: ["view"],
  stock: ["view"],
  customer: ["create", "update", "view"],
  settings: ["view"],
  report: ["view"],
});

export const staff = ac.newRole({
  invoice: ["create", "view"],
  journal: ["view"],
  product: ["view"],
  stock: ["adjust", "view"],
  customer: ["create", "view"],
  report: ["view"],
});

/**
 * Platform-level super-admin role.
 * Assigned to SaaS operators via the Better Auth admin plugin.
 * Has full access to every resource including company ownership actions.
 */
export const platformAdmin = ac.newRole({
  ...fullOperational,
  company: ["delete", "transfer-ownership"],
});
