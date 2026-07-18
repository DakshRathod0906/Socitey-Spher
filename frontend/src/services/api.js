import axios from "axios";
import { mapError } from "../lib/errorMapper";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ---------- Token helpers ----------

const getAccessToken = () => localStorage.getItem("ss_token");
const getRefreshToken = () => localStorage.getItem("ss_refresh_token");

const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem("ss_token", accessToken);
  if (refreshToken) localStorage.setItem("ss_refresh_token", refreshToken);
};

const clearSession = () => {
  localStorage.removeItem("ss_token");
  localStorage.removeItem("ss_refresh_token");
  localStorage.removeItem("ss_user");
};

// ---------- Refresh Token Queue ----------
// Prevents multiple concurrent refresh attempts

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// ---------- Request Interceptor ----------
// Automatically attach JWT to every outgoing request.

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- Response Interceptor ----------
// Handles automatic token refresh on 401 and normalizes errors.

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the response is 401 AND this is not a refresh request AND we haven't retried yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        // Queue this request until the token is refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearSession();
        window.location.href = "/login";
        return Promise.reject(mapError(error));
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          token: refreshToken,
        });
        const newAccessToken = data.tokens.accessToken;
        const newRefreshToken = data.tokens.refreshToken;
        setTokens(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSession();
        window.location.href = "/login";
        return Promise.reject(mapError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize the error for all other cases
    return Promise.reject(mapError(error));
  }
);

export default api;
