import { AppController } from '../src/app.controller'
import { AppService } from '../src/app.service'

describe('AppController', () => {
  let appController: AppController
  let appService: { getHello: vi.Mock }

  beforeEach(() => {
    appService = {
      getHello: vi.fn()
    }

    // Manually instantiate AppController with the mock AppService
    appController = new AppController(appService as any)
  })

  describe('root', () => {
    it('should return "Hello World!"', () => {
      appService.getHello.mockReturnValue('Hello World!')
      expect(appController.getHello()).toBe('Hello World!')
    })
  })
})
