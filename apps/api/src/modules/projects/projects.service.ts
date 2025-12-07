import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { BoardService } from '../boards/boards.service'
import { TasksService } from '../tasks/tasks.service'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { Project, ProjectDocument } from './schemas/projects.schema'

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @Inject(forwardRef(() => TasksService))
    private tasksService: TasksService,
    @Inject(forwardRef(() => BoardService))
    private boardService: BoardService
  ) {}

  /**
   * Delete all projects associated with a board
   * @param boardId The ID of the board whose projects should be deleted
   * @returns Promise with the deletion result
   */
  async deleteByBoardId(boardId: string): Promise<{ deletedCount: number }> {
    if (!Types.ObjectId.isValid(boardId)) {
      throw new BadRequestException('Invalid board ID')
    }

    const result = await this.projectModel
      .deleteMany({
        board: new Types.ObjectId(boardId)
      })
      .exec()
    return { deletedCount: result.deletedCount || 0 }
  }

  async findByBoardId(boardId: string): Promise<ProjectDocument[]> {
    if (!Types.ObjectId.isValid(boardId)) {
      throw new NotFoundException('Invalid board ID')
    }

    const projects = await this.projectModel
      .find({ board: new Types.ObjectId(boardId) })
      .populate('board', 'title')
      .populate('owner', 'name email') // Populate owner with name and email
      .populate('members', 'name email') // Populate members with name and email
      .exec()

    if (!projects || projects.length === 0) {
      return []
    }

    return projects
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string
  ): Promise<ProjectDocument> {
    if (!Types.ObjectId.isValid(id)) {
      const error = 'Invalid project ID'
      console.error(error, { id })
      throw new BadRequestException(error)
    }

    if (!Types.ObjectId.isValid(userId)) {
      const error = 'Invalid user ID'
      console.error(error, { userId })
      throw new BadRequestException(error)
    }

    const project = await this.projectModel.findById(id)
    if (!project) {
      const error = 'Project not found'
      console.error(error, { id })
      throw new NotFoundException(error)
    }

    // Convert userId to string to ensure consistent comparison
    const userIdString = userId.toString()

    // Permission model:
    // - Owner can update any field
    // - Board members (owner or members) can update orderInBoard only
    const isOwner = project.owner.toString() === userIdString
    const isOrderOnly =
      updateProjectDto.orderInBoard !== undefined &&
      updateProjectDto.title === undefined &&
      updateProjectDto.description === undefined &&
      updateProjectDto.status === undefined &&
      updateProjectDto.dueDate === undefined &&
      updateProjectDto.assigneeId === undefined

    if (!isOwner) {
      if (isOrderOnly) {
        // Allow if user is a member of the board containing this project
        try {
          const boardId = project.board.toString()
          const board = await this.boardService.findOne(boardId, userId)
          if (!board) {
            const error = 'You do not have permission to reorder projects in this board'
            console.error(error, { userId, projectId: id, boardId })
            throw new BadRequestException(error)
          }
        } catch (err) {
          const error = 'You do not have permission to reorder projects in this board'
          console.error(error, {
            userId,
            projectId: id,
            boardId: project.board.toString(),
            originalError: err instanceof Error ? err.message : String(err)
          })
          throw new BadRequestException(error)
        }
      } else {
        const error = 'You do not have permission to update this project'
        console.error(error, { userId, projectId: id })
        throw new BadRequestException(error)
      }
    }

    // Prepare update data
    const updateData: Partial<Project> = {}

    // Only update the fields that are provided in the DTO
    if (updateProjectDto.title !== undefined) {
      updateData.title = updateProjectDto.title
    }

    if (updateProjectDto.description !== undefined) {
      updateData.description = updateProjectDto.description
    }

    if (updateProjectDto.status) {
      updateData.status = updateProjectDto.status
    }

    if (updateProjectDto.dueDate) {
      updateData.dueDate = new Date(updateProjectDto.dueDate)
    }

    if (updateProjectDto.assigneeId !== undefined) {
      updateData.assignee = updateProjectDto.assigneeId
        ? new Types.ObjectId(updateProjectDto.assigneeId)
        : null
    }

    if (updateProjectDto.orderInBoard !== undefined) {
      updateData.orderInBoard = updateProjectDto.orderInBoard
    }

    try {
      const updatedProject = await this.projectModel
        .findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .populate('assignee', 'name email')
        .exec()

      if (!updatedProject) {
        throw new NotFoundException('Project not found after update')
      }
      return updatedProject
    } catch (error) {
      console.error('Error updating project:', error)
      if (error instanceof Error && error.name === 'ValidationError') {
        throw new BadRequestException(error.message)
      }
      throw new BadRequestException('Failed to update project')
    }
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      const error = 'Invalid project ID'
      console.error(error, { id })
      throw new BadRequestException(error)
    }

    if (!Types.ObjectId.isValid(userId)) {
      const error = 'Invalid user ID'
      console.error(error, { userId })
      throw new BadRequestException(error)
    }

    const project = await this.projectModel.findById(id)
    if (!project) {
      const error = 'Project not found'
      console.error(error, { id })
      throw new NotFoundException(error)
    }

    // Convert userId to string to ensure consistent comparison
    const userIdString = userId.toString()

    // Check if the user is the owner of the project
    if (project.owner.toString() !== userIdString) {
      const error = 'You do not have permission to delete this project'
      console.error(error, { userId, projectId: id })
      throw new BadRequestException(error)
    }

    // Store project info before deletion for reordering
    const { board: boardId, orderInBoard: deletedOrder } = project

    // First delete all tasks associated with this project
    try {
      await this.tasksService.deleteTasksByProjectId(id)
    } catch (error) {
      console.error('Error deleting tasks for project:', error)
      // We'll continue with project deletion even if task deletion fails
      // to prevent orphaned projects, but log the error
    }

    // Then delete the project itself
    const result = await this.projectModel.deleteOne({ _id: id })

    if (result.deletedCount === 0) {
      const error = 'Failed to delete project'
      console.error(error, { id })
      throw new Error(error)
    }

    // Reorder remaining projects in the same board
    // Decrease orderInBoard by 1 for all projects with order greater than deleted project
    if (deletedOrder !== undefined) {
      await this.projectModel
        .updateMany(
          {
            board: boardId,
            orderInBoard: { $gt: deletedOrder }
          },
          {
            $inc: { orderInBoard: -1 }
          }
        )
        .exec()
    }
    return { message: 'Project deleted successfully' }
  }

  /**
   * Add a user to project members if they're not already a member
   * @param projectId Project ID
   * @param userId User ID to add as member
   */
  async addMemberIfNotExists(projectId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(userId)) {
      console.error('Invalid project ID or user ID', { projectId, userId })
      return
    }

    const userIdObj = new Types.ObjectId(userId)

    // Check if user is already a member
    const isMember = await this.projectModel.exists({
      _id: projectId,
      members: userIdObj
    })

    if (isMember) {
      return // Already a member, nothing to do
    }

    // Add user to members array if not already a member
    await this.projectModel.updateOne({ _id: projectId }, { $addToSet: { members: userIdObj } })
  }

  async create(createProjectDto: CreateProjectDto & { owner: string }): Promise<ProjectDocument> {
    try {
      const { title, description, boardId, owner } = createProjectDto

      if (!Types.ObjectId.isValid(boardId)) {
        console.error('Invalid board ID:', boardId)
        throw new BadRequestException(`Invalid board ID: ${boardId}`)
      }

      if (!Types.ObjectId.isValid(owner)) {
        console.error('Invalid owner ID:', owner)
        throw new BadRequestException(`Invalid owner ID: ${owner}`)
      }

      // Get the next orderInBoard value if not provided
      let order = createProjectDto.orderInBoard
      if (order === undefined) {
        const lastProject = await this.projectModel
          .findOne({ board: boardId })
          .sort({ orderInBoard: -1 })
          .select('orderInBoard')
          .lean()
        order = lastProject ? lastProject.orderInBoard + 1 : 0
      }

      // Create the project with only the fields defined in the schema
      const projectData: Partial<Project> = {
        title,
        description: description || null,
        owner: new Types.ObjectId(owner),
        board: new Types.ObjectId(boardId),
        members: [new Types.ObjectId(owner)],
        orderInBoard: order,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const project = new this.projectModel(projectData)

      const savedProject = await project.save()

      // Populate the owner and members before returning
      const populatedProject = await this.projectModel
        .findById(savedProject._id)
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .exec()

      if (!populatedProject) {
        throw new NotFoundException('Project not found after creation')
      }

      return populatedProject
    } catch (error) {
      console.error('Error creating project:', error)
      throw error // Re-throw the error to be handled by the controller
    }
  }
}
