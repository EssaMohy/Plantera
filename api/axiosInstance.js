import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setSession,
  clearSession,
} from "../utils/tokenStorage";
import { queryClient } from "../providers/AuthProvider";

const BASE_URL = "https://api.plantera.dev/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// A bare axios call for the refresh request itself — deliberately NOT
// routed through axiosInstance, so refreshing the token can never
// re-trigger this same response interceptor and recurse.
const refreshClient = axios.create({ baseURL: BASE_URL });

// Requests that should never trigger a refresh-and-retry, even on a 401:
// hitting these means the credentials themselves were wrong, not that a
// previously-valid session expired.
const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh"];
const isAuthEndpoint = (url = "") =>
  AUTH_ENDPOINTS.some((path) => url.includes(path));

// Add request interceptor to attach the JWT token to all requests
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Forces the app back to the login screen: `Main.jsx` renders the
// Auth/Drawer navigator based on `useAuth()`'s `isAuthenticated`, which
// reads this exact query, so resetting it here is enough to redirect —
// even though this file is outside the React tree.
const forceLogout = () => {
  queryClient.setQueryData(["auth"], { userToken: null, userInfo: null });
};

// Queues requests that arrive while a refresh is already in flight, so
// three simultaneous 401s only trigger one /auth/refresh call, not three.
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshComplete = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const onRefreshFailed = () => {
  refreshSubscribers = [];
};

// Add response interceptor: on a 401 from an expired access token,
// silently refresh it and retry the original request once, instead of
// surfacing the error to every screen.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another request already kicked off a refresh — wait for it
      // instead of starting a second one.
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const { data } = await refreshClient.post("/auth/refresh", {
        refreshToken,
      });
      const { accessToken, refreshToken: newRefreshToken } = data.data;
      const tokenString = await setSession(accessToken, newRefreshToken);

      onRefreshComplete(tokenString);

      originalRequest.headers.Authorization = `Bearer ${tokenString}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      onRefreshFailed();
      await clearSession();
      forceLogout();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
