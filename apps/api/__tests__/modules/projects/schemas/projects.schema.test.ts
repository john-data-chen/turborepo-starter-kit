import { describe, expect, it, vi } from 'vitest'
import { ProjectStatus } from '../../../../src/modules/projects/dto/update-project.dto'
import { Project, ProjectSchema } from '../../../../src/modules/projects/schemas/projects.schema'

describe('ProjectSchema', () => {
  it('should be defined', () => {
    expect(ProjectSchema).toBeDefined()
  })

  it('should have timestamps option enabled', () => {
    expect(ProjectSchema.options.timestamps).toBe(true)
  })

  it('should have required fields defined', () => {
    const paths = ProjectSchema.paths
    expect(paths.title).toBeDefined()
    expect(paths.title.options.required).toBe(true)
    expect(paths.owner).toBeDefined()
    expect(paths.owner.options.required).toBe(true)
    expect(paths.board).toBeDefined()
    expect(paths.board.options.required).toBe(true)
  })

  it('should have optional fields defined', () => {
    const paths = ProjectSchema.paths
    expect(paths.description).toBeDefined()
    expect(paths.description.options.required).not.toBe(true)
    expect(paths.dueDate).toBeDefined()
    expect(paths.dueDate.options.required).not.toBe(true)
    expect(paths.assignee).toBeDefined()
    expect(paths.assignee.options.required).not.toBe(true)
  })

  it('should have status field with enum and default value', () => {
    const statusPath = ProjectSchema.paths.status
    expect(statusPath).toBeDefined()
    expect(statusPath.options.enum).toContain(ProjectStatus.TODO)
    expect(statusPath.options.default).toBe(ProjectStatus.TODO)
  })

  it('should have orderInBoard with default value', () => {
    const orderPath = ProjectSchema.paths.orderInBoard
    expect(orderPath).toBeDefined()
    expect(orderPath.options.default).toBe(0)
  })

  it('should have members field with default value', () => {
    const membersPath = ProjectSchema.paths.members
    expect(membersPath).toBeDefined()
    expect(membersPath.options.default).toBeDefined()
  })

  it('should have reference fields', () => {
    const paths = ProjectSchema.paths
    expect(paths.owner.options.ref).toBe('User')
    expect(paths.board.options.ref).toBe('Board')
    expect(paths.assignee.options.ref).toBe('User')
  })

  it('should have createdAt and updatedAt fields', () => {
    const paths = ProjectSchema.paths
    expect(paths.createdAt).toBeDefined()
    expect(paths.updatedAt).toBeDefined()
  })

  it('should have pre-save hook to update updatedAt', () => {
    // Get the pre-save hooks
    const hooks = (ProjectSchema as any).s.hooks._pres.get('save')
    expect(hooks).toBeDefined()
    expect(hooks.length).toBeGreaterThan(0)
  })

  it('should update updatedAt on save', async () => {
    const oldDate = new Date('2020-01-01')
    const mockDocument = {
      updatedAt: oldDate,
      save: vi.fn(),
      ownerDocument: vi.fn().mockReturnThis(),
      $__: {},
      schema: ProjectSchema,
      $isValid: vi.fn().mockReturnValue(true)
    }
    const next = vi.fn()

    // Get the pre-save hook (the first hook is our custom hook)
    const hooks = (ProjectSchema as any).s.hooks._pres.get('save')
    expect(hooks).toBeDefined()
    expect(hooks.length).toBeGreaterThan(0)

    // Find and call our custom hook (not the timestamps hook)
    const customHook = hooks.find((hook: any) => hook.fn.toString().includes('this.updatedAt'))
    expect(customHook).toBeDefined()
    customHook.fn.call(mockDocument, next)

    // Verify updatedAt was updated
    expect(mockDocument.updatedAt.getTime()).toBeGreaterThan(oldDate.getTime())
    expect(next).toHaveBeenCalled()
  })

  it('should create Project class instance', () => {
    const project = new Project()
    expect(project).toBeDefined()
    expect(project).toBeInstanceOf(Project)
  })
})
