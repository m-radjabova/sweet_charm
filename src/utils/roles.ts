import type { User, UserRole } from "../types/types";

export const rolePriority: readonly UserRole[] = [
  "super_admin",
  "admin",
  "teacher",
  "student",
  "user",
] as const;

export function getPrimaryRole(user: Pick<User, "role" | "roles"> | null | undefined): UserRole | undefined {
  const normalizedRoles = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];
  return rolePriority.find((role) => normalizedRoles.includes(role)) ?? user?.role;
}

export function isSuperAdmin(user: Pick<User, "role" | "roles"> | null | undefined) {
  const normalizedRoles = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];
  return normalizedRoles.includes("super_admin");
}

export function hasAnyRole(
  user: Pick<User, "role" | "roles"> | null | undefined,
  roles: UserRole[],
) {
  const normalizedRoles = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];
  return roles.some((role) => normalizedRoles.includes(role));
}

export function getUserRoles(user: Pick<User, "role" | "roles"> | null | undefined): UserRole[] {
  const normalizedRoles = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];
  return rolePriority.filter((role) => normalizedRoles.includes(role));
}

export function getDefaultRouteForRole(user: Pick<User, "role" | "roles"> | null | undefined) {
  const role = getPrimaryRole(user);

  if (role === "super_admin") return "/super-admin";
  if (role === "teacher") return "/admin/groups";
  if (role === "student") return "/student";
  return "/admin";
}

export function getRoleLabel(role: UserRole | undefined) {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "teacher":
      return "Teacher";
    case "student":
      return "Student";
    default:
      return "User";
  }
}

export function getUserRoleLabel(user: Pick<User, "role" | "roles"> | null | undefined) {
  const roles = getUserRoles(user);
  if (roles.length === 0) return "User";
  return roles.map((role) => getRoleLabel(role)).join(", ");
}
