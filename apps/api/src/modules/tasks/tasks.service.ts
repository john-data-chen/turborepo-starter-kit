import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateTaskDto } from './dto/create-task.dto';
import { TaskPermissionsDto } from './dto/task-permissions.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument, TaskStatus } from './schemas/tasks.schema';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  /**
   * Delete all tasks associated with a project
   * @param projectId The ID of the project whose tasks should be deleted
   * @returns Promise with the deletion result
   */
  async deleteTasksByProjectId(
    projectId: string
  ): Promise<{ deletedCount: number }> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new Error('Invalid project ID');
    }

    const result = await this.taskModel
      .deleteMany({
        project: new Types.ObjectId(projectId)
      })
      .exec();

    console.log(
      `Deleted ${result.deletedCount} tasks for project ${projectId}`
    );
    return { deletedCount: result.deletedCount || 0 };
  }

  private toUserResponse(user: any) {
    if (!user) {
      console.log('User is null or undefined');
      return null;
    }
    return {
      _id: user._id?.toString() || '',
      name: user.name,
      email: user.email
    };
  }

  private async toTaskResponse(task: TaskDocument): Promise<TaskResponseDto> {
    console.log('=== toTaskResponse called ===');
    console.log('Raw task input:', JSON.stringify(task, null, 2));

    try {
      // First populate the user fields with detailed error handling
      let populatedTask;
      try {
        populatedTask = await task.populate([
          { path: 'creator', select: 'name email' },
          { path: 'assignee', select: 'name email' },
          { path: 'lastModifier', select: 'name email' }
        ]);
        console.log(
          'After population:',
          JSON.stringify(populatedTask, null, 2)
        );
      } catch (populateError) {
        console.error('Error during population:', populateError);
        // If population fails, use the original task
        populatedTask = task;
      }

      // Build the response object
      const response: any = {
        _id: populatedTask._id.toString(),
        title: populatedTask.title,
        status: populatedTask.status,
        board: populatedTask.board?.toString(),
        project: populatedTask.project?.toString(),
        createdAt: populatedTask.createdAt,
        updatedAt: populatedTask.updatedAt
      };

      // Handle user references with fallbacks
      response.creator = this.toUserResponse(populatedTask.creator);
      response.assignee = this.toUserResponse(populatedTask.assignee);

      // Special handling for lastModifier
      if (populatedTask.lastModifier) {
        response.lastModifier = this.toUserResponse(populatedTask.lastModifier);
      } else if (task.lastModifier) {
        // If population failed but we have the ID, create a minimal user object
        console.log(
          'Using fallback for lastModifier with ID:',
          task.lastModifier
        );
        response.lastModifier = {
          _id: task.lastModifier.toString(),
          name: 'Unknown',
          email: 'unknown@example.com'
        };
      } else {
        // If no lastModifier at all, use creator as fallback
        console.log('No lastModifier found, falling back to creator');
        response.lastModifier = response.creator;
      }

      // Handle optional fields
      if (populatedTask.description) {
        response.description = populatedTask.description;
      }

      if (populatedTask.dueDate) {
        response.dueDate = populatedTask.dueDate;
      }

      return response as TaskResponseDto;
    } catch (error) {
      console.error('Error in toTaskResponse:', error);
      throw error;
    }
  }

  async create(
    createTaskDto: CreateTaskDto,
    _userId: string // Keep for backward compatibility but mark as unused
  ): Promise<TaskResponseDto> {
    try {
      // Convert string IDs to ObjectIds
      const creatorId = new Types.ObjectId(createTaskDto.creator);
      const taskData = {
        ...createTaskDto,
        project: new Types.ObjectId(createTaskDto.project),
        board: new Types.ObjectId(createTaskDto.board),
        creator: creatorId,
        // For new tasks, lastModifier should be the same as creator
        lastModifier: creatorId,
        status: createTaskDto.status || TaskStatus.TODO,
        ...(createTaskDto.assignee && {
          assignee: new Types.ObjectId(createTaskDto.assignee)
        })
      };

      const createdTask = new this.taskModel(taskData);
      const savedTask = await createdTask.save();
      return await this.toTaskResponse(savedTask);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async findAll(
    projectId?: string,
    assigneeId?: string
  ): Promise<TaskResponseDto[]> {
    const query: any = {};

    if (projectId) {
      query.project = new Types.ObjectId(projectId);
    }

    if (assigneeId) {
      query.assignee = new Types.ObjectId(assigneeId);
    }

    const tasks = await this.taskModel.find(query).exec();
    return Promise.all(tasks.map((task) => this.toTaskResponse(task)));
  }

  async findOne(id: string): Promise<TaskResponseDto> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return await this.toTaskResponse(task);
  }

  async checkTaskPermissions(
    taskId: string,
    userId: string
  ): Promise<TaskPermissionsDto> {
    const task = await this.taskModel
      .findById(taskId)
      .populate('creator', '_id')
      .populate('board', 'owner')
      .populate('project', 'owner')
      .lean();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const board = task.board as unknown as { owner: Types.ObjectId };
    const project = task.project as unknown as { owner: Types.ObjectId };
    const creator = task.creator as unknown as { _id: Types.ObjectId };

    const isBoardOwner = board.owner.toString() === userId;
    const isProjectOwner = project.owner.toString() === userId;
    const isCreator = creator._id.toString() === userId;
    const isAssignee = task.assignee?.toString() === userId;

    const canDelete = isBoardOwner || isProjectOwner || isCreator;
    const canEdit = canDelete || isAssignee;

    return { canEdit, canDelete };
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string
  ): Promise<TaskResponseDto> {
    // Create update data with lastModifier set to current user
    const updateData: any = {
      ...updateTaskDto,
      lastModifier: new Types.ObjectId(userId),
      updatedAt: new Date()
    };

    // Remove any undefined values to prevent overwriting with undefined
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // Handle assigneeId if present - convert to ObjectId or set to null
    if ('assigneeId' in updateData) {
      updateData.assignee = updateData.assigneeId
        ? new Types.ObjectId(updateData.assigneeId)
        : null;
      delete updateData.assigneeId;
    }

    // Use findByIdAndUpdate for an atomic operation and to get the updated doc
    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return this.toTaskResponse(updatedTask);
  }

  async remove(id: string): Promise<void> {
    // Convert string ID to ObjectId
    const objectId = new Types.ObjectId(id);
    const result = await this.taskModel.deleteOne({ _id: objectId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async updateStatus(
    id: string,
    status: TaskStatus,
    userId: string
  ): Promise<TaskResponseDto> {
    console.log('=== updateStatus called ===');
    console.log('Task ID:', id);
    console.log('New status:', status);
    console.log('User ID:', userId);

    const session = await this.taskModel.startSession();
    session.startTransaction();

    try {
      // First, find the task to ensure it exists
      const task = await this.taskModel.findById(id).session(session);
      if (!task) {
        throw new NotFoundException(`Task with ID "${id}" not found`);
      }

      // Update the task with the new status and lastModifier
      task.status = status;
      task.lastModifier = new Types.ObjectId(userId);
      task.updatedAt = new Date();

      // Save the updated task in the same session
      await task.save({ session });

      // Now populate the references
      const populatedTask = await this.taskModel
        .findById(id)
        .populate('creator', 'name email')
        .populate('assignee', 'name email')
        .populate('lastModifier', 'name email')
        .populate('project', 'title')
        .session(session)
        .orFail()
        .exec();

      await session.commitTransaction();
      session.endSession();

      console.log(
        'Updated task from DB (before toTaskResponse):',
        JSON.stringify(populatedTask, null, 2)
      );

      // Ensure lastModifier is properly set
      if (!populatedTask.lastModifier) {
        console.warn('lastModifier was not populated, setting it manually');
        populatedTask.lastModifier = {
          _id: new Types.ObjectId(userId),
          name: 'Unknown',
          email: 'unknown@example.com'
        } as any;
      }

      const response = await this.toTaskResponse(populatedTask);
      console.log('Final response:', JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error in updateStatus:', error);
      throw error;
    }
  }
}
