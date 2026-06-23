export const ACCESS_TOKEN_KEY = "sweet_charm_access_token";
export const REFRESH_TOKEN_KEY = "sweet_charm_refresh_token";

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearStoredAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
