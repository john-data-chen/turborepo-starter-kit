import { getModelToken } from "@nestjs/mongoose"
import { Test, TestingModule } from "@nestjs/testing"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { User } from "../../src/modules/users/schemas/users.schema"
import { UserService } from "../../src/modules/users/users.service"

describe("UserService", () => {
  let service: UserService
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: vi.fn(),
            find: vi.fn()
          }
        }
      ]
    }).compile()

    service = module.get<UserService>(UserService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("findByEmail", () => {
    it("should find a user by email", async () => {
      const userModel = module.get(getModelToken(User.name))
      userModel.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue({}) })

      await service.findByEmail("test@test.com")

      expect(userModel.findOne).toHaveBeenCalledWith({ email: "test@test.com" })
    })

    it("should return null if no email is provided", async () => {
      const user = await service.findByEmail(null)
      expect(user).toBeNull()
    })

    it("should return null if user is not found", async () => {
      const userModel = module.get(getModelToken(User.name))
      userModel.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue(null) })
      const user = await service.findByEmail("test@test.com")
      expect(user).toBeNull()
    })

    it("should throw an error if database throws an error", async () => {
      const userModel = module.get(getModelToken(User.name))
      userModel.findOne.mockReturnValue({ exec: vi.fn().mockRejectedValue(new Error("DB Error")) })
      await expect(service.findByEmail("test@test.com")).rejects.toThrow(
        "An error occurred while processing your request"
      )
    })
  })

  describe("findAll", () => {
    it("should find all users", async () => {
      const userModel = module.get(getModelToken(User.name))
      userModel.find.mockReturnValue({ exec: vi.fn().mockResolvedValue([]) })

      await service.findAll()

      expect(userModel.find).toHaveBeenCalled()
    })

    it("should throw an error if database throws an error", async () => {
      const userModel = module.get(getModelToken(User.name))
      userModel.find.mockReturnValue({ exec: vi.fn().mockRejectedValue(new Error("DB Error")) })
      await expect(service.findAll()).rejects.toThrow("DB Error")
    })
  })

  describe("searchByName", () => {
    it("should search users by name", async () => {
      const userModel = module.get(getModelToken(User.name))
      userModel.find.mockReturnValue({ exec: vi.fn().mockResolvedValue([]) })

      await service.searchByName("test")

      expect(userModel.find).toHaveBeenCalledWith({ name: { $regex: "test", $options: "i" } })
    })

    it("should search with empty query if no name is provided", async () => {
      const userModel = module.get(getModelToken(User.name))
      userModel.find.mockReturnValue({ exec: vi.fn().mockResolvedValue([]) })

      await service.searchByName(null)

      expect(userModel.find).toHaveBeenCalledWith({})
    })

    it("should throw an error if database throws an error", async () => {
      const userModel = module.get(getModelToken(User.name))
      userModel.find.mockReturnValue({ exec: vi.fn().mockRejectedValue(new Error("DB Error")) })
      await expect(service.searchByName("test")).rejects.toThrow("DB Error")
    })
  })
})
