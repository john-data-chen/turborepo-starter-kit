import { Test, TestingModule } from '@nestjs/testing'
// oxlint-disable-next-line no-unused-vars
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppService } from '../src/app.service'

describe('AppService', () => {
  let service: AppService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService]
    }).compile()

    service = module.get<AppService>(AppService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(service.getHello()).toEqual('Hello World!')
    })
  })
})
