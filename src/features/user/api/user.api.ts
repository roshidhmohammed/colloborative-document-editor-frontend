import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants/api";
import {
  type AuthRequestConfig,
  withAuthHeaders,
} from "@/lib/auth-token";

export async function getProfileApi(
  auth: AuthRequestConfig = withAuthHeaders(),
) {
  try {
    const response = await axiosInstance.get(
      API_ENDPOINTS.USER_PROFILE,
      auth,
    );
    return response.data.data;
  } catch (error) {
    return error;
  }
}
