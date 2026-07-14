import axiosInstance from "@/lib/axios";

import { API_ENDPOINTS } from "@/constants/api";

import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth";

export async function registerApi(
  payload: RegisterRequest
): Promise<RegisterResponse> {
  const response = await axiosInstance.post(
    API_ENDPOINTS.REGISTER,
    payload
  );

  return response.data;
}

export async function loginApi(
  payload: LoginRequest
): Promise<LoginResponse> {
  const response = await axiosInstance.post(
    API_ENDPOINTS.LOGIN,
    payload
  );

  return response.data;
}

export async function userAuthApi(
): Promise<LoginResponse> {
  const response = await axiosInstance.get(
    API_ENDPOINTS.USER_AUTH
  );

  return response.data;
}