"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { ROUTES, URL_PARAMS } from "@/constants/routes";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AuthService } from "@/lib/auth/authService";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Session, UserInfo } from "@/types/dbInterface";

// Helper function to create session from user data
function createSession(user: UserInfo): Session {
  return {
    user: {
      _id: user._id,
      email: user.email,
      name: user.name || user.email.split("@")[0]
    },
    accessToken: "http-only-cookie"
  };
}

// Helper function to update stores with user data

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: UserInfo | null;
  session: Session | null;
}

export const AUTH_KEYS = {
  all: ["auth"] as const,
  session: () => [...AUTH_KEYS.all, "session"] as const
};

export function useAuth() {
  const setUserInfo = useWorkspaceStore((state) => state.setUserInfo);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const authPathname = usePathname();

  // Session state
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // Function to manually check session
  const checkSession = useCallback(async (): Promise<Session | null> => {
    try {
      setIsCheckingAuth(true);
      const user = await AuthService.getProfile();
      const currentSession = createSession(user);
      setSession(currentSession);
      return currentSession;
    } catch (error) {
      console.error("Session check failed:", error);
      setSession(null);
      return null;
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  // Check for existing session on mount if we have auth indicators
  useEffect(() => {
    const initAuth = async () => {
      // Skip session check on auth pages where user is expected to not be authenticated
      const isOnAuthPage = authPathname.includes("/login");
      if (isOnAuthPage) {
        setIsCheckingAuth(false);
        return;
      }

      // Check for authentication cookie (could be jwt= or isAuthenticated=)
      const hasAuthCookie = document.cookie.split(";").some((item) => {
        const trimmed = item.trim();
        return trimmed.startsWith("jwt=") || trimmed.startsWith("isAuthenticated=");
      });

      // Also check for token in localStorage (fallback for httpOnly cookies)
      const hasStoredToken = localStorage.getItem("auth_token");

      if (hasAuthCookie || hasStoredToken) {
        try {
          await checkSession();
        } catch (error) {
          console.error("Failed to check session on mount:", error);
          // Don't throw here - just log the error and continue
          // The session will remain null, indicating user is not authenticated
        }
      } else {
        // No authentication indicators, set loading to false immediately
        setIsCheckingAuth(false);
      }
    };

    initAuth();
  }, [checkSession, authPathname]);

  // Login mutation
  const loginMutation = useMutation<{ session: Session }, Error, string>({
    mutationFn: async (email: string) => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("[useAuth mutationFn] Starting login for:", email);

        // Call the login endpoint which now returns user data and token
        const loginResult = await AuthService.login(email);
        console.log("[useAuth mutationFn] AuthService.login returned:", {
          hasResult: !!loginResult,
          type: typeof loginResult,
          keys: loginResult ? Object.keys(loginResult) : [],
          hasUser: !!loginResult?.user,
          userId: loginResult?.user?._id
        });

        // If login returned user data directly, use it
        if (loginResult?.user) {
          const user = loginResult.user;
          console.log("[useAuth mutationFn] Creating session from login user data:", {
            _id: user._id,
            email: user.email
          });
          const session = createSession(user);
          return { session };
        }

        // Fallback: fetch the user profile using the session
        console.log("[useAuth mutationFn] No user in loginResult, fetching profile...");
        const user = await AuthService.getProfile();
        console.log("[useAuth mutationFn] Profile fetched:", {
          _id: user._id,
          email: user.email
        });
        const session = createSession(user);
        return { session };
      } catch (err) {
        console.error("[useAuth mutationFn] Login error:", err);
        const errorMessage = err instanceof Error ? err.message : "Login failed";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      console.log("[useAuth onSuccess] Mutation succeeded:", {
        hasData: !!data,
        hasSession: !!data?.session,
        hasUser: !!data?.session?.user,
        userId: data?.session?.user?._id
      });
      if (data?.session?.user) {
        const { user } = data.session;
        // Update the local session state
        setSession(data.session);
        // Update the workspace store
        setUserInfo(user.name || user.email, user._id);
        // Update the auth store
        useAuthStore.getState().setUser(user);
        console.log("[useAuth onSuccess] Stores updated for user:", user._id);
      }
    },
    onError: (error) => {
      console.error("[useAuth onError] Login mutation error:", error);
      console.error("[useAuth onError] Error message:", error.message);
      console.error("[useAuth onError] Error stack:", error.stack);
      setError(error.message);
    }
  });

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Clear the JWT cookie
      await AuthService.logout();

      // Clear the local session state
      setSession(null);

      // Clear the stores
      useAuthStore.getState().clear();
      useWorkspaceStore.getState().setUserInfo("", "");

      // Redirect to login page
      router.replace(ROUTES.AUTH.LOGIN_PAGE);
    } catch (error) {
      console.error("Error during logout:", error);
      // Still redirect even if there was an error
      router.replace(ROUTES.AUTH.LOGIN_PAGE);
    }
  }, [router]);

  // Update user info in store when session changes
  useEffect(() => {
    if (session?.user) {
      const { user } = session;
      // Ensure we have both email and _id before updating
      if (user.email && user._id) {
        setUserInfo(user.name || user.email, user._id);
      }
    }
  }, [session, setUserInfo]);

  return {
    // Auth state
    isAuthenticated: !!session,
    isLoading: isCheckingAuth || isLoading,
    error,
    user: session?.user,
    session,

    // Auth methods
    login: loginMutation.mutateAsync,
    loginWithEmail: loginMutation.mutateAsync, // Alias for backward compatibility
    logout,

    // Raw mutations for more control
    loginMutation
  };
}

export function useAuthForm() {
  const { login, isLoading, error } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleSubmit = async (email: string) => {
    try {
      setIsNavigating(true);
      console.log("[useAuthForm] === LOGIN FLOW START ===");
      console.log("[useAuthForm] Email:", email);
      console.log("[useAuthForm] Current URL:", window.location.href);
      console.log("[useAuthForm] Cookies before login:", document.cookie);

      const result = await login(email);
      console.log("[useAuthForm] Login returned successfully:", {
        hasResult: !!result,
        resultType: typeof result,
        hasSession: !!result?.session,
        hasUser: !!result?.session?.user,
        userId: result?.session?.user?._id
      });

      if (!result?.session?.user) {
        console.error("[useAuthForm] No user data in result:", JSON.stringify(result));
        throw new Error("No user data received after login");
      }

      // Read callbackUrl from URL search params, fallback to /boards
      const searchParams = new URLSearchParams(window.location.search);
      const callbackUrl = searchParams.get("callbackUrl");
      // Strip locale prefix if present (next-intl's router.push auto-prepends it)
      const cleanCallback = callbackUrl?.replace(/^\/[a-z]{2}\//, "/");
      const redirectUrl = cleanCallback || `/boards?${URL_PARAMS.LOGIN_SUCCESS}`;

      console.log("[useAuthForm] Redirect calculation:", {
        rawCallbackUrl: callbackUrl,
        cleanCallback,
        finalRedirectUrl: redirectUrl
      });
      console.log("[useAuthForm] Cookies after login:", document.cookie);
      console.log(
        "[useAuthForm] localStorage auth_token exists:",
        !!localStorage.getItem("auth_token")
      );

      // Navigate after a short delay to ensure cookie is persisted
      console.log("[useAuthForm] Scheduling router.push in 500ms...");
      setTimeout(() => {
        console.log("[useAuthForm] Executing router.push to:", redirectUrl);
        console.log("[useAuthForm] Cookies at push time:", document.cookie);
        router.push(redirectUrl);
        console.log("[useAuthForm] router.push called successfully");
      }, 500);
    } catch (err) {
      console.error("[useAuthForm] === LOGIN FLOW ERROR ===");
      console.error("[useAuthForm] Error type:", err?.constructor?.name);
      console.error(
        "[useAuthForm] Error message:",
        err instanceof Error ? err.message : String(err)
      );
      console.error("[useAuthForm] Full error:", err);
    } finally {
      setIsNavigating(false);
      console.log("[useAuthForm] === LOGIN FLOW END (finally) ===");
    }
  };

  return {
    handleSubmit,
    isLoading,
    error,
    isNavigating
  };
}
