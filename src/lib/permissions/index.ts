/**
 * Synchronous/utility helper to check if a user with a role can perform an action.
 * Action format can be "resource:action" (e.g. "product:create", "user:invite", "warehouse:edit").
 * Pure TypeScript function safe for both Client and Server Components.
 */
export function canX(
  userOrRole: { role?: string } | string | null | undefined,
  company: { id: string } | null | undefined,
  action: string,
): boolean {
  if (!userOrRole) return false;
  const role = typeof userOrRole === "string" ? userOrRole : userOrRole.role || "staff";

  let resource = "";
  let act = "";

  if (action.includes(":")) {
    [resource, act] = action.split(":");
  } else {
    resource = action;
    act = "view";
  }

  // Alias maps for ERP action names
  if (resource === "user") resource = "member";
  if (resource === "warehouse") {
    resource = "settings";
    if (act === "edit") act = "update";
  }

  // Owner/Admin check overrides if standard role string matches
  if (role === "owner" || role === "admin") return true;
  if (role === "accountant") {
    if (resource === "member" || (resource === "settings" && act === "update")) return false;
    return true;
  }

  // Staff defaults
  if (role === "staff") {
    if (resource === "member" || resource === "settings") return false;
    if (act === "delete" || act === "void") return false;
    return true;
  }

  return false;
}
