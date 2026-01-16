import { beforeEach, describe, expect, it, vi, type Mock } from "vitest"

import { AppController } from "../src/app.controller"

describe("AppController", () => {
  let appController: AppController
  let appService: { getHello: Mock }

  beforeEach(() => {
    appService = {
      getHello: vi.fn()
    }

    // Manually instantiate AppController with the mock AppService
    appController = new AppController(appService as any)
  })

  describe("root", () => {
    it('should return "Hello World!"', () => {
      appService.getHello.mockReturnValue("Hello World!")
      expect(appController.getHello()).toBe("Hello World!")
    })
  })
})
