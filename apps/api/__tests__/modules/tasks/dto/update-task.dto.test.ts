import { validate } from 'class-validator'
import { describe, expect, it } from 'vitest'
import { UpdateTaskDto } from '../../../../src/modules/tasks/dto/update-task.dto'
import { TaskStatus } from '../../../../src/modules/tasks/schemas/tasks.schema'

describe('UpdateTaskDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new UpdateTaskDto()
    dto.title = 'Test Task'
    dto.description = 'Test Description'
    dto.status = TaskStatus.IN_PROGRESS
    dto.assigneeId = '507f1f77bcf86cd799439013'
    dto.lastModifier = '507f1f77bcf86cd799439014'
    dto.orderInProject = 1

    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should pass validation with minimal data', async () => {
    const dto = new UpdateTaskDto()
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should pass validation with null description', async () => {
    const dto = new UpdateTaskDto()
    dto.description = null
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should pass validation with null dueDate', async () => {
    const dto = new UpdateTaskDto()
    dto.dueDate = null
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should pass validation with null assigneeId', async () => {
    const dto = new UpdateTaskDto()
    dto.assigneeId = null
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should fail validation with invalid status', async () => {
    const dto = new UpdateTaskDto()
    ;(dto as any).status = 'INVALID_STATUS'
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].property).toBe('status')
  })

  it('should fail validation with invalid assigneeId', async () => {
    const dto = new UpdateTaskDto()
    dto.assigneeId = 'invalid-id'
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].property).toBe('assigneeId')
  })

  it('should fail validation with invalid lastModifier', async () => {
    const dto = new UpdateTaskDto()
    dto.lastModifier = 'invalid-id'
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].property).toBe('lastModifier')
  })

  it('should fail validation with non-number orderInProject', async () => {
    const dto = new UpdateTaskDto()
    ;(dto as any).orderInProject = 'not-a-number'
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].property).toBe('orderInProject')
  })

  it('should fail validation with non-string title', async () => {
    const dto = new UpdateTaskDto()
    ;(dto as any).title = 123
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].property).toBe('title')
  })
})
