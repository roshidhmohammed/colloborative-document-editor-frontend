import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants/api";
import { withAuthHeaders } from "@/lib/auth-token";

export async function getProfileApi() {
  try {
    const response = await axiosInstance.get(
      API_ENDPOINTS.USER_PROFILE,
      withAuthHeaders(),
    );
    return response.data.data;
  } catch (error) {
    return error;
  }
}
