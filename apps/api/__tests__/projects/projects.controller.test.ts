import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard'
import { ProjectsController } from '../../src/modules/projects/projects.controller'
import { ProjectsService } from '../../src/modules/projects/projects.service'

describe('ProjectsController', () => {
  let controller: ProjectsController
  let service: ProjectsService
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: {
            create: vi.fn(),
            findByBoardId: vi.fn(),
            update: vi.fn(),
            remove: vi.fn()
          }
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(createMock<JwtAuthGuard>())
      .compile()

    controller = module.get<ProjectsController>(ProjectsController)
    service = module.get<ProjectsService>(ProjectsService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create a project', async () => {
      const createProjectDto = { name: 'Test Project', owner: '' }
      const user = { _id: '1', email: 'test@test.com' }
      const result = { ...createProjectDto, _id: '1', owner: '1' }

      vi.spyOn(service, 'create').mockResolvedValue(result as any)

      expect(await controller.create(createProjectDto, user)).toEqual(result)
      expect(service.create).toHaveBeenCalledWith({ ...createProjectDto, owner: '1' })
    })
  })

  describe('getProjectsByBoard', () => {
    it('should find all projects for a board', async () => {
      const user = { _id: '1' }
      const result = []

      vi.spyOn(service, 'findByBoardId').mockResolvedValue(result as any)

      expect(await controller.getProjectsByBoard('1', user as any)).toEqual(result)
      expect(service.findByBoardId).toHaveBeenCalledWith('1')
    })
  })

  describe('update', () => {
    it('should update a project', async () => {
      const updateProjectDto = { name: 'Test Project Updated' }
      const user = { _id: '1' }
      const result = { _id: '1', name: 'Test Project Updated', owner: '1' }

      vi.spyOn(service, 'update').mockResolvedValue(result as any)

      expect(await controller.update('1', updateProjectDto, user as any)).toEqual(result)
      expect(service.update).toHaveBeenCalledWith('1', updateProjectDto, '1')
    })
  })

  describe('remove', () => {
    it('should remove a project', async () => {
      const user = { _id: '1' }
      const result = { success: true, message: 'Project deleted successfully' }

      vi.spyOn(service, 'remove').mockResolvedValue(result as any)

      expect(await controller.remove('1', user as any)).toEqual(result)
      expect(service.remove).toHaveBeenCalledWith('1', '1')
    })
  })
})
