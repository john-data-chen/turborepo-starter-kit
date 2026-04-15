import { UnauthorizedException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { JwtStrategy } from "../../../../src/modules/auth/strategies/jwt.strategy";
import { UserService } from "../../../../src/modules/users/users.service";

describe("JwtStrategy", () => {
  let jwtStrategy: JwtStrategy;
  let mockUserService: {
    findByEmail: Mock;
  };

  const mockUser = {
    _id: "60f6e1b3b3f3b3b3b3f3b3b3",
    email: "test@test.com"
  };

  beforeEach(() => {
    mockUserService = { findByEmail: vi.fn() };
    const mockConfigService = {
      get: vi.fn((key: string) => (key === "JWT_SECRET" ? "test-secret-key" : undefined))
    };

    jwtStrategy = new JwtStrategy(
      mockUserService as unknown as UserService,
      mockConfigService as unknown as import("@nestjs/config").ConfigService
    );
  });

  describe("validate", () => {
    it("should return the user if found", async () => {
      const payload = { sub: mockUser._id, email: mockUser.email };
      mockUserService.findByEmail.mockResolvedValue(mockUser as any);

      const result = await jwtStrategy.validate(payload);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(payload.email);
      expect(result).toEqual({ _id: mockUser._id, email: mockUser.email });
    });

    it("should throw UnauthorizedException if user not found", async () => {
      const payload = { sub: mockUser._id, email: mockUser.email };
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException on error", async () => {
      const payload = { sub: mockUser._id, email: mockUser.email };
      mockUserService.findByEmail.mockRejectedValue(new Error("DB Error"));

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it("should handle unknown error types", async () => {
      const payload = { sub: mockUser._id, email: mockUser.email };
      mockUserService.findByEmail.mockRejectedValue("Unknown error string");

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
