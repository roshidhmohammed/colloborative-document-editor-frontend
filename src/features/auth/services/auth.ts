
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

class AuthService {
  async register(
    payload: RegisterRequest
  ): Promise<RegisterResponse> {
    return registerApi(payload);
  }

  async login(
    payload: LoginRequest
  ): Promise<LoginResponse> {
    return loginApi(payload);
  }

  async userAuth():Promise<LoginResponse> {
    return userAuthApi();
}
}

export const authService = new AuthService();