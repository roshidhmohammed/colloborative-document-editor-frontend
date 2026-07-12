import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants/api";


export async function getProfileApi(){
  try {
    const response = await axiosInstance.get(
    API_ENDPOINTS.USER_PROFILE,
  );
  return response.data.data;
  } catch (error) {
    return error
  }
}

