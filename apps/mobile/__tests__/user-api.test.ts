import { describe, it, expect, vi, beforeEach } from "vitest";

import { fetchWithAuth } from "@/lib/api/fetch-with-auth";
import { userApi } from "@/lib/api/user-api";

vi.mock("@/lib/api/fetch-with-auth", () => ({
  fetchWithAuth: vi.fn()
}));

describe("userApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should search users", async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue({
      users: [{ _id: "1", name: "N", email: "E", createdAt: "2023-01-01", updatedAt: "2023-01-01" }]
    });
    const users = await userApi.searchUsers("test");
    expect(users).toHaveLength(1);
    expect(fetchWithAuth).toHaveBeenCalledWith(expect.stringContaining("username=test"));
  });

  it("should get user by id", async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue({
      user: { _id: "1", name: "N", email: "E", createdAt: "2023-01-01", updatedAt: "2023-01-01" }
    });
    const user = await userApi.getUserById("1");
    expect(user?._id).toBe("1");
  });

  it("should return null if user not found", async () => {
    vi.mocked(fetchWithAuth).mockRejectedValue(new Error("Not found"));
    const user = await userApi.getUserById("none");
    expect(user).toBeNull();
  });
});
