import Cookies from "js-cookie";

import { ROUTES } from "@/constants/routes";
import { Session, UserInfo } from "@/types/dbInterface";

const API_BASE = ROUTES.API;

export class AuthService {
  static async login(email: string): Promise<{ access_token: string; user?: UserInfo }> {
    try {
      const response = await fetch(ROUTES.AUTH.LOGIN_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        credentials: "include", // This is crucial for receiving cookies
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Login failed");
        throw new Error(errorText || "Login failed");
      }

      const data = await response.json();

      // Store the token for Authorization header
      if (data.access_token) {
        localStorage.setItem("auth_token", data.access_token);
      }

      // Set isAuthenticated cookie on the web domain so the middleware can detect auth state.
      // The API also sets this cookie, but on its own domain — which is invisible to the
      // web middleware when API and web are on different Vercel subdomains.
      Cookies.set("isAuthenticated", "true", {
        path: "/",
        secure: window.location.protocol === "https:",
        sameSite: "lax",
        expires: 7 // 7 days, matching the API cookie maxAge
      });

      return {
        access_token: data.access_token || "http-only-cookie",
        user: data.user // Include user data from backend response
      };
    } catch (error) {
      throw error;
    }
  }

  static async getProfile(): Promise<UserInfo> {
    // Try to get token from localStorage for Authorization header
    const token = localStorage.getItem("auth_token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };

    // Add Authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: "GET",
      credentials: "include", // Still try cookies as fallback
      headers,
      // Add cache control to prevent caching issues
      cache: "no-store",
      mode: "cors"
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Failed to fetch profile");

      if (response.status === 401) {
        this.logout();
      }

      throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
    }

    const user = await response.json();

    // Ensure we have required fields
    if (!user || !user.email) {
      throw new Error("Invalid user data received from server");
    }

    // Map the backend user to our frontend User type
    return {
      _id: user._id,
      email: user.email,
      name: user.name || user.email.split("@")[0] || "User"
    };
  }

  static async getSession(): Promise<Session | null> {
    try {
      // First try to get the profile using the HTTP-only cookie
      const user = await this.getProfile();

      if (!user) {
        return null;
      }

      return {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name || user.email.split("@")[0]
        },
        accessToken: "http-only-cookie" // The actual token is in the HTTP-only cookie
      };
    } catch (error) {
      console.error("Session validation error:", error);
      // Don't throw here, just return null to indicate no valid session
      return null;
    }
  }

  static logout(): void {
    if (typeof window !== "undefined") {
      Cookies.remove("jwt", { path: "/" });
      Cookies.remove("isAuthenticated", { path: "/" });
      localStorage.removeItem("auth_token");
    }
  }
}
