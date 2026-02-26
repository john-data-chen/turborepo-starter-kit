import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useUsers } from "@/hooks/use-users";
import { userApi } from "@/lib/api/user-api";

import { Wrapper } from "./test-utils";

vi.mock("@/lib/api/user-api", () => ({
  userApi: {
    searchUsers: vi.fn()
  }
}));

describe("useUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should search users with query", async () => {
    const mockUsers = [{ _id: "u1", name: "Test", email: "t@e.com" }];
    vi.mocked(userApi.searchUsers).mockResolvedValue(mockUsers as any);

    const { result } = renderHook(() => useUsers("test"), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUsers);
    expect(userApi.searchUsers).toHaveBeenCalledWith("test");
  });

  it("should fetch with empty query by default", async () => {
    vi.mocked(userApi.searchUsers).mockResolvedValue([] as any);

    const { result } = renderHook(() => useUsers(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(userApi.searchUsers).toHaveBeenCalledWith("");
  });
});
