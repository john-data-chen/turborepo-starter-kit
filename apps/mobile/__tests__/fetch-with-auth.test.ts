import { router } from "expo-router";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { fetchWithAuth } from "@/lib/api/fetch-with-auth";
import { authService } from "@/lib/auth/auth-service";

vi.mock("@/lib/auth/auth-service", () => ({
  authService: {
    getToken: vi.fn(),
    logout: vi.fn()
  }
}));

vi.mock("expo-router", () => ({
  router: {
    replace: vi.fn()
  }
}));

describe("fetchWithAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("should attach auth token to request", async () => {
    vi.mocked(authService.getToken).mockResolvedValue("my-token");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "10" },
      json: async () => ({ data: 1 })
    } as any);

    await fetchWithAuth("/test");

    expect(fetch).toHaveBeenCalledWith("/test", {
      headers: expect.objectContaining({
        Authorization: "Bearer my-token",
        "Content-Type": "application/json"
      })
    });
  });

  it("should not attach Authorization when no token", async () => {
    vi.mocked(authService.getToken).mockResolvedValue(null);
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "5" },
      json: async () => ({})
    } as any);

    await fetchWithAuth("/test");

    const calledHeaders = vi.mocked(fetch).mock.calls[0][1]?.headers as Record<string, string>;
    expect(calledHeaders.Authorization).toBeUndefined();
  });

  it("should handle 401 and redirect", async () => {
    vi.mocked(authService.getToken).mockResolvedValue(null);
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: "Unauthorized" })
    } as any);

    await expect(fetchWithAuth("/test")).rejects.toThrow();
    expect(authService.logout).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith("/(auth)/login");
  });

  it("should handle non-401 error with JSON body", async () => {
    vi.mocked(authService.getToken).mockResolvedValue(null);
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "Server Error" })
    } as any);

    await expect(fetchWithAuth("/test")).rejects.toThrow("Server Error");
    expect(authService.logout).not.toHaveBeenCalled();
  });

  it("should handle error with text fallback when JSON parse fails", async () => {
    vi.mocked(authService.getToken).mockResolvedValue(null);
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
      text: async () => "Plain text error"
    } as any);

    await expect(fetchWithAuth("/test")).rejects.toThrow("Plain text error");
  });

  it("should handle error with status fallback when both JSON and text fail", async () => {
    vi.mocked(authService.getToken).mockResolvedValue(null);
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => {
        throw new Error("not json");
      },
      text: async () => {
        throw new Error("not text");
      }
    } as any);

    await expect(fetchWithAuth("/test")).rejects.toThrow("Request failed with status 503");
  });

  it("should handle 204 with handleEmptyResponse", async () => {
    vi.mocked(authService.getToken).mockResolvedValue(null);
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 204,
      headers: { get: () => "0" }
    } as any);

    const res = await fetchWithAuth("/test", {}, true);
    expect(res).toBeNull();
  });

  it("should handle status 200 with content-length 0", async () => {
    vi.mocked(authService.getToken).mockResolvedValue(null);
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "0" }
    } as any);

    const res = await fetchWithAuth("/test", {}, true);
    expect(res).toBeNull();
  });

  it("should return json for normal response", async () => {
    vi.mocked(authService.getToken).mockResolvedValue(null);
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "10" },
      json: async () => ({ data: 1 })
    } as any);

    const res = await fetchWithAuth("/test");
    expect(res).toEqual({ data: 1 });
  });

  it("should merge Headers object into request headers", async () => {
    vi.mocked(authService.getToken).mockResolvedValue(null);
    const headers = new Headers();
    headers.set("X-Custom", "value");

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "5" },
      json: async () => ({})
    } as any);

    await fetchWithAuth("/test", { headers });

    const calledHeaders = vi.mocked(fetch).mock.calls[0][1]?.headers as Record<string, string>;
    expect(calledHeaders["x-custom"]).toBe("value");
  });

  it("should merge array headers into request headers", async () => {
    vi.mocked(authService.getToken).mockResolvedValue(null);

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "5" },
      json: async () => ({})
    } as any);

    await fetchWithAuth("/test", { headers: [["X-Array", "arr-val"]] });

    const calledHeaders = vi.mocked(fetch).mock.calls[0][1]?.headers as Record<string, string>;
    expect(calledHeaders["X-Array"]).toBe("arr-val");
  });

  it("should merge plain object headers", async () => {
    vi.mocked(authService.getToken).mockResolvedValue(null);

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "5" },
      json: async () => ({})
    } as any);

    await fetchWithAuth("/test", { headers: { "X-Obj": "obj-val" } });

    const calledHeaders = vi.mocked(fetch).mock.calls[0][1]?.headers as Record<string, string>;
    expect(calledHeaders["X-Obj"]).toBe("obj-val");
  });

  it("should not parse json when handleEmptyResponse is false", async () => {
    vi.mocked(authService.getToken).mockResolvedValue(null);
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "0" },
      json: async () => ({ result: "ok" })
    } as any);

    // Without handleEmptyResponse flag, it calls json() regardless
    const res = await fetchWithAuth("/test");
    expect(res).toEqual({ result: "ok" });
  });
});
