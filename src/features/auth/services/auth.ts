import { loginAction } from "../actions/login";
import { clearAuthToken } from "../actions/authCookies";
import {
  loginApi,
  registerApi,
  userAuthApi,
} from "../api/auth";

import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth";
import type { AuthRequestConfig } from "@/lib/auth-token";
import { withAuthHeaders } from "@/lib/auth-token";

class AuthService {
  async register(
    payload: RegisterRequest
  ): Promise<RegisterResponse> {
    return registerApi(payload);
  }

  /**
   * 1. Server Action sets `token` on this app via cookies() (proxy can read it).
   * 2. Client API login stores the API-domain cookie (axios/socket credentials).
   */
  async login(
    payload: LoginRequest
  ): Promise<LoginResponse> {
    const result = await loginAction(payload);

    try {
      await loginApi(payload);
    } catch {
      // Next.js session cookie is already set; API cookie is best-effort.
    }

    return result;
  }

  async logout(): Promise<void> {
    await clearAuthToken();
  }

  async userAuth(
    auth: AuthRequestConfig = withAuthHeaders(),
  ): Promise<LoginResponse> {
    return userAuthApi(auth);
  }
}

export const authService = new AuthService();
