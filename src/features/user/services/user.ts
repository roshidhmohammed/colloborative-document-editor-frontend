import { getProfileApi } from "../api/user.api";

import { UserProfile } from "../types/user";

class UserService {
  async getProfile(): Promise<UserProfile> {
    return getProfileApi();
  }
}

export const userService = new UserService();
