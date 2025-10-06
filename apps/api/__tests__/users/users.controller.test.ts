import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserController } from '../../src/modules/users/users.controller'

describe('UserController', () => {
  let controller: UserController
  let service: { findAll: vi.Mock; searchByName: vi.Mock }

  beforeEach(() => {
    service = {
      findAll: vi.fn(),
      searchByName: vi.fn()
    }

    // Manually instantiate UserController with the mock UserService
    controller = new UserController(service as any)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = []
      service.findAll.mockResolvedValue(result as any)
      expect(await controller.findAll()).toEqual({ users: result })
    })
  })

  describe('search', () => {
    it('should return an array of users', async () => {
      const result = []
      service.searchByName.mockResolvedValue(result as any)
      expect(await controller.search('test')).toEqual({ users: result })
    })
  })
})
