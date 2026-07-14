import { getProfileApi } from "../api/user.api";

import { UserProfile } from "../types/user";
import type { AuthRequestConfig } from "@/lib/auth-token";
import { withAuthHeaders } from "@/lib/auth-token";

class UserService {
  async getProfile(
    auth: AuthRequestConfig = withAuthHeaders(),
  ): Promise<UserProfile> {
    return getProfileApi(auth);
  }
}

export const userService = new UserService();
