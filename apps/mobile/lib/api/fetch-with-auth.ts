import { router } from "expo-router";

import { authService } from "@/lib/auth/auth-service";

export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {},
  handleEmptyResponse = false
): Promise<T> {
  const token = await authService.getToken();
  const headers = getHeaders(options.headers, token);

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    if (response.status === 401) {
      await authService.logout();
      router.replace("/(auth)/login");
    }
    await handleErrorResponse(response);
  }

  return handleSuccessResponse<T>(response, handleEmptyResponse);
}

function getHeaders(
  optionHeaders: RequestInit["headers"],
  token: string | null
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (optionHeaders) {
    if (optionHeaders instanceof Headers) {
      optionHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(optionHeaders)) {
      optionHeaders.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.entries(optionHeaders).forEach(([key, value]) => {
        if (typeof value === "string") {
          headers[key] = value;
        }
      });
    }
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function handleErrorResponse(response: Response): Promise<never> {
  let errorMessage: string;
  try {
    const errorData = await response.json();
    errorMessage = errorData.message || JSON.stringify(errorData);
  } catch {
    try {
      errorMessage = await response.text();
    } catch {
      errorMessage = `Request failed with status ${response.status}`;
    }
  }
  throw new Error(errorMessage);
}

async function handleSuccessResponse<T>(
  response: Response,
  handleEmptyResponse: boolean
): Promise<T> {
  if (handleEmptyResponse) {
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return null as unknown as T;
    }
  }
  return response.json();
}
