import axios from "axios";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  clearStoredAuth,
  getStoredRefreshToken,
} from "../api/authStorage";

type RetryableRequestConfig = {
  _retry?: boolean;
  headers?: Record<string, string>;
  url?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_ORIGIN;
const AUTH_EXCLUDED_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
];

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    // Let the browser set multipart/form-data with the correct boundary.
    if (config.headers) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const requestUrl = String(originalRequest?.url ?? "");
    const isAuthRequest = AUTH_EXCLUDED_PATHS.some((path) => requestUrl.includes(path));

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
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data: tokens } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
        if (tokens.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);

        originalRequest.headers = {
          ...(originalRequest.headers ?? {}),
          Authorization: `Bearer ${tokens.access_token}`,
        };
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearStoredAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
