import axios from "axios";
import { env } from "@/config/env";
import { authHeaders, getClientAuthToken } from "@/lib/auth-token";

/**
 * Browser calls go through same-origin `/api-proxy` so the server can
 * attach the Cookie header (browsers refuse to set it). Server code hits
 * the API directly.
 */
const clientBaseURL =
  typeof window === "undefined" ? env.API_URL : "/api-proxy";

const axiosInstance = axios.create({
  baseURL: clientBaseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getClientAuthToken();
  const headers = authHeaders(token);

  for (const [key, value] of Object.entries(headers)) {
    config.headers.set(key, value);
  }

  return config;
});

export default axiosInstance;
