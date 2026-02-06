import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

import { fetchWithAuth } from "@/lib/api/fetchWithAuth";

describe("fetchWithAuth", () => {
  const mockUrl = "http://example.com/api";
  const mockToken = "mock-token";

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should include auth token from localStorage", async () => {
    localStorage.setItem("auth_token", mockToken);
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });

    await fetchWithAuth(mockUrl);

    expect(global.fetch).toHaveBeenCalledWith(
      mockUrl,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`
        })
      })
    );
  });

  it("should merge custom headers", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });

    await fetchWithAuth(mockUrl, {
      headers: { "X-Custom": "value" }
    });

    expect(global.fetch).toHaveBeenCalledWith(
      mockUrl,
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Custom": "value"
        })
      })
    );
  });

  it("should handle Headers object", async () => {
    const headers = new Headers();
    headers.append("X-Custom", "value");

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });

    await fetchWithAuth(mockUrl, {
      headers: headers
    });

    expect(global.fetch).toHaveBeenCalledWith(
      mockUrl,
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "x-custom": "value"
        })
      })
    );
  });

  it("should handle array of headers", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });

    await fetchWithAuth(mockUrl, {
      headers: [["X-Custom", "value"]]
    });

    expect(global.fetch).toHaveBeenCalledWith(
      mockUrl,
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Custom": "value"
        })
      })
    );
  });

  it("should return JSON response", async () => {
    const mockData = { id: 1 };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    const result = await fetchWithAuth(mockUrl);
    expect(result).toEqual(mockData);
  });

  it("should handle empty response when flag is set", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 204
    });

    const result = await fetchWithAuth(mockUrl, {}, true);
    expect(result).toBeNull();
  });

  it("should throw error with JSON message", async () => {
    const errorMsg = "Backend error";
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: errorMsg })
    });

    await expect(fetchWithAuth(mockUrl)).rejects.toThrow(errorMsg);
  });

  it("should throw error with text body", async () => {
    const errorMsg = "Text error";
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => {
        throw new Error("Not JSON");
      },
      text: async () => errorMsg
    });

    await expect(fetchWithAuth(mockUrl)).rejects.toThrow(errorMsg);
  });

  it("should throw fallback error if text parsing fails", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("Not JSON");
      },
      text: async () => {
        throw new Error("Not Text");
      }
    });

    await expect(fetchWithAuth(mockUrl)).rejects.toThrow("Request failed with status 500");
  });

  it("should throw error without crashing on 401", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: "Unauthorized" })
    });

    await expect(fetchWithAuth(mockUrl)).rejects.toThrow("Unauthorized");
  });
});
