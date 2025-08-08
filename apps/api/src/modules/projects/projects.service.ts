import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { TasksService } from '../tasks/tasks.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectDocument } from './schemas/projects.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @Inject(forwardRef(() => TasksService))
    private tasksService: TasksService
  ) {}

  /**
   * Delete all projects associated with a board
   * @param boardId The ID of the board whose projects should be deleted
   * @returns Promise with the deletion result
   */
  async deleteByBoardId(boardId: string): Promise<{ deletedCount: number }> {
    if (!Types.ObjectId.isValid(boardId)) {
      throw new BadRequestException('Invalid board ID');
    }

    const result = await this.projectModel
      .deleteMany({
        board: new Types.ObjectId(boardId)
      })
      .exec();

    console.log(`Deleted ${result.deletedCount} projects for board ${boardId}`);
    return { deletedCount: result.deletedCount || 0 };
  }

  async findByBoardId(boardId: string): Promise<ProjectDocument[]> {
    if (!Types.ObjectId.isValid(boardId)) {
      throw new NotFoundException('Invalid board ID');
    }

    const projects = await this.projectModel
      .find({ board: new Types.ObjectId(boardId) })
      .populate('board', 'title')
      .populate('owner', 'name email') // Populate owner with name and email
      .populate('members', 'name email') // Populate members with name and email
      .lean();

    if (!projects || projects.length === 0) {
      return [];
    }

    return projects as ProjectDocument[];
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string
  ): Promise<ProjectDocument> {
    console.log('Update request received:', { id, updateProjectDto, userId });

    if (!Types.ObjectId.isValid(id)) {
      const error = 'Invalid project ID';
      console.error(error, { id });
      throw new BadRequestException(error);
    }

    if (!Types.ObjectId.isValid(userId)) {
      const error = 'Invalid user ID';
      console.error(error, { userId });
      throw new BadRequestException(error);
    }

    console.log('Finding project with ID:', id);
    const project = await this.projectModel.findById(id);
    if (!project) {
      const error = 'Project not found';
      console.error(error, { id });
      throw new NotFoundException(error);
    }

    console.log('Found project:', project);
    console.log('Checking permissions...');

    // Check if the user is the owner of the project
    if (project.owner.toString() !== userId) {
      const error = 'You do not have permission to update this project';
      console.error(error, { userId, projectId: id });
      throw new BadRequestException(error);
    }

    console.log('Updating project with data:', updateProjectDto);

    // Prepare update data
    const updateData: Partial<Project> = {};

    // Only update the fields that are provided in the DTO
    if (updateProjectDto.title !== undefined) {
      updateData.title = updateProjectDto.title;
    }

    if (updateProjectDto.description !== undefined) {
      updateData.description = updateProjectDto.description;
    }

    if (updateProjectDto.status) {
      updateData.status = updateProjectDto.status;
    }

    if (updateProjectDto.dueDate) {
      updateData.dueDate = new Date(updateProjectDto.dueDate);
    }

    if (updateProjectDto.assigneeId !== undefined) {
      updateData.assignee = updateProjectDto.assigneeId
        ? new Types.ObjectId(updateProjectDto.assigneeId)
        : null;
    }

    if (updateProjectDto.orderInBoard !== undefined) {
      updateData.orderInBoard = updateProjectDto.orderInBoard;
    }

    console.log('Updating project with data:', updateData);

    try {
      const updatedProject = await this.projectModel
        .findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true, runValidators: true }
        )
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .populate('assignee', 'name email')
        .lean();

      if (!updatedProject) {
        throw new NotFoundException('Project not found after update');
      }

      console.log('Project updated successfully:', updatedProject);
      return updatedProject as ProjectDocument;
    } catch (error) {
      console.error('Error updating project:', error);
      if (error instanceof Error && error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Failed to update project');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    console.log('Delete request received:', { id, userId });

    if (!Types.ObjectId.isValid(id)) {
      const error = 'Invalid project ID';
      console.error(error, { id });
      throw new BadRequestException(error);
    }

    if (!Types.ObjectId.isValid(userId)) {
      const error = 'Invalid user ID';
      console.error(error, { userId });
      throw new BadRequestException(error);
    }

    console.log('Finding project with ID:', id);
    const project = await this.projectModel.findById(id);
    if (!project) {
      const error = 'Project not found';
      console.error(error, { id });
      throw new NotFoundException(error);
    }

    // Check if the user is the owner of the project
    if (project.owner.toString() !== userId) {
      const error = 'You do not have permission to delete this project';
      console.error(error, { userId, projectId: id });
      throw new BadRequestException(error);
    }

    // Store project info before deletion for reordering
    const { board: boardId, orderInBoard: deletedOrder } = project;

    console.log('Deleting project and associated tasks...');

    // First delete all tasks associated with this project
    try {
      const deleteResult = await this.tasksService.deleteTasksByProjectId(id);
      console.log(
        `Deleted ${deleteResult.deletedCount} tasks for project ${id}`
      );
    } catch (error) {
      console.error('Error deleting tasks for project:', error);
      // We'll continue with project deletion even if task deletion fails
      // to prevent orphaned projects, but log the error
    }

    // Then delete the project itself
    const result = await this.projectModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      const error = 'Failed to delete project';
      console.error(error, { id });
      throw new Error(error);
    }

    // Reorder remaining projects in the same board
    // Decrease orderInBoard by 1 for all projects with order greater than deleted project
    if (deletedOrder !== undefined) {
      console.log(
        `Reordering projects in board ${boardId} after deleting project with order ${deletedOrder}`
      );

      const reorderResult = await this.projectModel
        .updateMany(
          {
            board: boardId,
            orderInBoard: { $gt: deletedOrder }
          },
          {
            $inc: { orderInBoard: -1 }
          }
        )
        .exec();

      console.log(
        `Reordered ${reorderResult.modifiedCount} projects in board ${boardId}`
      );
    }

    console.log(
      'Project, associated tasks, and project order updated successfully'
    );
  }

  /**
   * Add a user to project members if they're not already a member
   * @param projectId Project ID
   * @param userId User ID to add as member
   */
  async addMemberIfNotExists(projectId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(userId)) {
      console.error('Invalid project ID or user ID', { projectId, userId });
      return;
    }

    const userIdObj = new Types.ObjectId(userId);

    // Check if user is already a member
    const isMember = await this.projectModel.exists({
      _id: projectId,
      members: userIdObj
    });

    if (isMember) {
      return; // Already a member, nothing to do
    }

    // Add user to members array if not already a member
    await this.projectModel.updateOne(
      { _id: projectId },
      { $addToSet: { members: userIdObj } }
    );
  }

  async create(
    createProjectDto: CreateProjectDto & { owner: string }
  ): Promise<ProjectDocument> {
    try {
      console.log(
        'Raw createProjectDto received in service:',
        JSON.stringify(createProjectDto, null, 2)
      );

      const { title, description, boardId, owner } = createProjectDto;

      console.log('Processed fields in service:', {
        title,
        description,
        boardId,
        owner,
        isBoardIdValid: Types.ObjectId.isValid(boardId),
        isOwnerValid: Types.ObjectId.isValid(owner),
        ownerType: typeof owner
      });

      if (!Types.ObjectId.isValid(boardId)) {
        console.error('Invalid board ID:', boardId);
        throw new BadRequestException(`Invalid board ID: ${boardId}`);
      }

      if (!Types.ObjectId.isValid(owner)) {
        console.error('Invalid owner ID:', owner);
        throw new BadRequestException(`Invalid owner ID: ${owner}`);
      }

      // Get the next orderInBoard value if not provided
      let order = createProjectDto.orderInBoard;
      if (order === undefined) {
        const lastProject = await this.projectModel
          .findOne({ board: boardId })
          .sort({ orderInBoard: -1 })
          .select('orderInBoard')
          .lean();
        order = lastProject ? lastProject.orderInBoard + 1 : 0;
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
      };

      const project = new this.projectModel(projectData);

      console.log(
        'Saving project with data:',
        JSON.stringify(
          {
            title: projectData.title,
            description: projectData.description,
            board: projectData.board,
            owner: projectData.owner,
            members: projectData.members,
            orderInBoard: projectData.orderInBoard
          },
          null,
          2
        )
      );

      const savedProject = await project.save();

      // Populate the owner and members before returning
      const populatedProject = await this.projectModel
        .findById(savedProject._id)
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .lean();

      console.log(
        'Successfully created and populated project:',
        JSON.stringify(
          {
            _id: populatedProject._id,
            title: populatedProject.title,
            owner: populatedProject.owner,
            members: populatedProject.members,
            board: populatedProject.board
          },
          null,
          2
        )
      );

      return populatedProject as ProjectDocument;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error; // Re-throw the error to be handled by the controller
    }
  }
}
