import axios from "axios";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, clearStoredAuth, getStoredRefreshToken } from "../api/authStorage";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_ORIGIN,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = String(originalRequest?.url ?? "");
    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/customer") ||
      requestUrl.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) {
        clearStoredAuth();
        window.location.href = window.location.pathname.startsWith("/account") ? "/user/access" : "/login";
        return Promise.reject(error);
      }

      try {
        const { data: tokens } = await axios.post(
          `${import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_ORIGIN}/auth/refresh`,
          {
            refresh_token: refreshToken,
          },
        );

        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
        if (tokens.refresh_token) {
          localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
        }

        originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearStoredAuth();
        window.location.href = window.location.pathname.startsWith("/account") ? "/user/access" : "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
