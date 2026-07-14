
import 'server-only'
import axiosInstance from "@/lib/axios";

import { API_ENDPOINTS } from "@/constants/api";

import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth";
import { cookies } from "next/headers";

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
const cookieStore = await cookies();
    cookieStore.set({
        name: "token",
        value: response.data.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
            process.env.NODE_ENV === "production"
                ? "lax"
                : "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });
  return response.data;
}

export async function userAuthApi(
): Promise<LoginResponse> {
  const response = await axiosInstance.get(
    API_ENDPOINTS.USER_AUTH
  );

  return response.data;
}