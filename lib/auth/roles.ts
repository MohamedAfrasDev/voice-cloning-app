const ADMIN_ROLES = ["owner", "admin"];

// Better Auth stores several roles as a comma-separated string.
export function parseRoles(role: string) {
  return role.split(",").map((r) => r.trim());
}

export function isOrgAdmin(roles: string[]) {
  return roles.some((r) => ADMIN_ROLES.includes(r));
}
