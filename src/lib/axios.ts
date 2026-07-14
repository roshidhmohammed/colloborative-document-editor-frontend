import axios from "axios";
import { env } from "@/config/env";
import { authHeaders, getClientAuthToken } from "@/lib/auth-token";

const axiosInstance = axios.create({
  baseURL: env.API_URL,
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
