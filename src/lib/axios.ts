import axios from "axios";
import { env } from "@/config/env";

const axiosInstance = axios.create({
  baseURL: env.API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;