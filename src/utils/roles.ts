import type { User, UserRole } from "../types/types";
import i18n from "../i18n";

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
  if (role === "user") return "/account";
  return "/user/access";
}

export function getRoleLabel(role: UserRole | undefined) {
  switch (role) {
    case "admin":
      return i18n.t("roles.admin");
    case "barber":
      return i18n.t("roles.barber");
    case "user":
      return i18n.t("roles.user");
    default:
      return i18n.t("roles.user");
  }
}

export function getUserRoleLabel(user: Pick<User, "role"> | null | undefined) {
  const roles = getUserRoles(user);
  if (roles.length === 0) return i18n.t("roles.user");
  return roles.map((role) => getRoleLabel(role)).join(", ");
}
