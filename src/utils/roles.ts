import type { User, UserRole } from "../types/types";

export const rolePriority: readonly UserRole[] = ["admin", "barber", "user"] as const;

export function getPrimaryRole(user: Pick<User, "role"> | null | undefined): UserRole | undefined {
  return user?.role;
}

export function hasAnyRole(user: Pick<User, "role"> | null | undefined, roles: UserRole[]) {
  if (!user?.role) return false;
  return roles.includes(user.role);
}

export function getUserRoles(user: Pick<User, "role"> | null | undefined): UserRole[] {
  return user?.role ? [user.role] : [];
}

export function getDefaultRouteForRole(user: Pick<User, "role"> | null | undefined) {
  const role = getPrimaryRole(user);
  if (role === "admin") return "/admin";
  if (role === "barber") return "/barber";
  return "/login";
}

export function getRoleLabel(role: UserRole | undefined) {
  switch (role) {
    case "admin":
      return "Admin";
    case "barber":
      return "Barber";
    case "user":
      return "User";
    default:
      return "User";
  }
}

export function getUserRoleLabel(user: Pick<User, "role"> | null | undefined) {
  const roles = getUserRoles(user);
  if (roles.length === 0) return "User";
  return roles.map((role) => getRoleLabel(role)).join(", ");
}
