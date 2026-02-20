import type { Session, UserInfo } from "@repo/store";
import * as SecureStore from "expo-secure-store";

import { API_ROUTES } from "@/constants/routes";

const TOKEN_KEY = "auth_token";

export const authService = {
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async login(email: string): Promise<{ access_token: string; user?: UserInfo }> {
    const response = await fetch(API_ROUTES.AUTH.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Login failed");
      throw new Error(errorText || "Login failed");
    }

    const data = await response.json();

    if (data.access_token) {
      await this.setToken(data.access_token);
    }

    return {
      access_token: data.access_token,
      user: data.user
    };
  },

  async getProfile(): Promise<UserInfo> {
    const token = await this.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(API_ROUTES.AUTH.PROFILE, {
      method: "GET",
      headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        await this.logout();
      }
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const user = await response.json();

    if (!user || !user.email) {
      throw new Error("Invalid user data received from server");
    }

    return {
      _id: user._id,
      email: user.email,
      name: user.name || user.email.split("@")[0] || "User"
    };
  },

  async getSession(): Promise<Session | null> {
    try {
      const token = await this.getToken();
      if (!token) {
        return null;
      }

      const user = await this.getProfile();
      return { user, accessToken: token };
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    await this.removeToken();
  }
};
