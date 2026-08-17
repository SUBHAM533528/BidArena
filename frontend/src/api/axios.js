import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://bidarena-backend-su27.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Endpoints where a 401 is an *expected* possible outcome (bad credentials on
// login, no session yet on /auth/me) — for these we must NOT force a redirect,
// or we'd create a redirect loop / hide the real "wrong password" message.
const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/me"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isAuthEndpoint = AUTH_ENDPOINTS.some((e) => url.includes(e));

    if (status === 401 && !isAuthEndpoint) {
      // Session is stale/invalid (expired token, server restarted with a new
      // JWT secret, etc). Clear it and send the user back to log in instead
      // of letting every admin page silently fail with empty data.
      const hadToken = !!localStorage.getItem("token");
      localStorage.removeItem("token");

      if (hadToken && typeof window !== "undefined") {
        const onAdminRoute = window.location.pathname.startsWith("/admin");
        const loginPath = onAdminRoute ? "/admin/login" : "/login";
        if (window.location.pathname !== loginPath) {
          window.location.href = `${loginPath}?expired=1`;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
