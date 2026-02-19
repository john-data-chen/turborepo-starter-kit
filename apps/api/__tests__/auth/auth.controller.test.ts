import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { AuthController } from "../../src/modules/auth/auth.controller";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: { login: Mock };

  beforeEach(() => {
    authService = {
      login: vi.fn()
    };

    const configService = {
      get: vi.fn((key: string) => {
        if (key === "NODE_ENV") {
          return "test";
        }
        if (key === "VERCEL") {
          return undefined;
        }
        return undefined;
      })
    };

    controller = new AuthController(authService as any, configService as any);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("login", () => {
    it("should return user and access_token", async () => {
      const user = {
        _id: "1",
        email: "test@test.com",
        name: "Test User",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = { user, access_token: "token" };
      const res = {
        cookie: vi.fn(),
        clearCookie: vi.fn(),
        getHeaders: vi.fn().mockReturnValue({})
      };

      authService.login.mockResolvedValue(result as any);

      expect(await controller.login(user as any, res as any)).toEqual(result);
      expect(res.cookie).toHaveBeenCalledTimes(2);
    });
  });

  describe("getProfile", () => {
    it("should return user from request", () => {
      const user = { _id: "1", email: "test@test.com", name: "Test User" };

      expect(controller.getProfile(user as any)).toEqual(user);
    });
  });

  describe("logout", () => {
    it("should clear cookies and return a message", async () => {
      const res = {
        clearCookie: vi.fn()
      };

      expect(await controller.logout(res as any)).toEqual({ message: "Successfully logged out" });
      expect(res.clearCookie).toHaveBeenCalledTimes(2);
    });
  });
});
