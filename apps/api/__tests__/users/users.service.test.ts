import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRepository } from "../../src/modules/users/repositories/users.repository";
import { UserService } from "../../src/modules/users/users.service";

describe("UserService", () => {
  let service: UserService;
  let userRepository: {
    findByEmail: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    searchByName: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    userRepository = {
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      searchByName: vi.fn()
    };

    service = new UserService(userRepository as unknown as UserRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findByEmail", () => {
    it("should find a user by email", async () => {
      const user = { email: "test@test.com", name: "Test" };
      userRepository.findByEmail.mockResolvedValue(user);

      const result = await service.findByEmail("test@test.com");

      expect(result).toEqual(user);
      expect(userRepository.findByEmail).toHaveBeenCalledWith("test@test.com");
    });

    it("should return null if no email is provided", async () => {
      const user = await service.findByEmail(null);
      expect(user).toBeNull();
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });

    it("should return null if user is not found", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      const user = await service.findByEmail("test@test.com");
      expect(user).toBeNull();
    });

    it("should propagate repository errors", async () => {
      userRepository.findByEmail.mockRejectedValue(new Error("DB Error"));
      await expect(service.findByEmail("test@test.com")).rejects.toThrow("DB Error");
    });
  });

  describe("findAll", () => {
    it("should find all users", async () => {
      userRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(userRepository.findAll).toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
      userRepository.findAll.mockRejectedValue(new Error("DB Error"));
      await expect(service.findAll()).rejects.toThrow("DB Error");
    });
  });

  describe("searchByName", () => {
    it("should search users by name", async () => {
      userRepository.searchByName.mockResolvedValue([]);

      await service.searchByName("test");

      expect(userRepository.searchByName).toHaveBeenCalledWith("test");
    });

    it("should search with null name", async () => {
      userRepository.searchByName.mockResolvedValue([]);

      await service.searchByName(null);

      expect(userRepository.searchByName).toHaveBeenCalledWith(null);
    });

    it("should propagate repository errors", async () => {
      userRepository.searchByName.mockRejectedValue(new Error("DB Error"));
      await expect(service.searchByName("test")).rejects.toThrow("DB Error");
    });
  });
});
