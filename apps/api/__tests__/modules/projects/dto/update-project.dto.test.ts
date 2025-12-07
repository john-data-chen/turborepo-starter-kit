import { validate } from 'class-validator'
import {
  ProjectStatus,
  UpdateProjectDto
} from '../../../../src/modules/projects/dto/update-project.dto'

describe('UpdateProjectDto', () => {
  it('should be valid with correct data', async () => {
    const dto = new UpdateProjectDto()
    dto.title = 'Test Project'
    dto.description = 'Test description'
    dto.status = ProjectStatus.IN_PROGRESS
    dto.dueDate = new Date().toISOString()
    dto.assigneeId = '60f6e1b3b3f3b3b3b3f3b3b3'
    dto.orderInBoard = 1
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should be valid with only optional fields', async () => {
    const dto = new UpdateProjectDto()
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should be invalid with wrong status', async () => {
    const dto = new UpdateProjectDto()
    dto.status = 'INVALID_STATUS' as any
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('should be invalid with wrong dueDate format', async () => {
    const dto = new UpdateProjectDto()
    dto.dueDate = 'invalid-date'
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('should be invalid with wrong assigneeId format', async () => {
    const dto = new UpdateProjectDto()
    dto.assigneeId = 'invalid-id'
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })
})
