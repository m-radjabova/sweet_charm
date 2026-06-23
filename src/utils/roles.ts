import type { User, UserRole } from "../types/types";

export function hasAnyRole(user: User | null, roles: UserRole[]) {
  return Boolean(user?.role && roles.includes(user.role));
}

export function getDefaultRouteForRole(user: User | null) {
  if (user?.role === "admin") return "/dashboard";
  return "/account/profile";
}
