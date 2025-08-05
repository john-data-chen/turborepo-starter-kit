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

  private async toTaskResponse(task: TaskDocument): Promise<TaskResponseDto> {
    // First populate the user fields
    const populatedTask = await this.taskModel.populate(task, [
      {
        path: 'creator',
        select: 'name email'
      },
      {
        path: 'assignee',
        select: 'name email'
      },
      {
        path: 'lastModifier',
        select: 'name email'
      }
    ]);

    // Helper function to create user response object
    const toUserResponse = (user: any) => {
      if (!user) return null;
      return {
        _id: user._id?.toString() || '',
        name: user.name,
        email: user.email
      };
    };

    // Build the response object
    const response: any = {
      _id: populatedTask._id.toString(),
      title: populatedTask.title,
      status: populatedTask.status,
      board: populatedTask.board?.toString(),
      project: populatedTask.project?.toString(),
      creator: toUserResponse(populatedTask.creator),
      lastModifier: toUserResponse(populatedTask.lastModifier),
      createdAt: populatedTask.createdAt,
      updatedAt: populatedTask.updatedAt
    };

    // Handle optional fields
    if (populatedTask.description) {
      response.description = populatedTask.description;
    }

    if (populatedTask.dueDate) {
      response.dueDate = populatedTask.dueDate;
    }

    if (populatedTask.assignee) {
      response.assignee = toUserResponse(populatedTask.assignee);
    }

    return response as TaskResponseDto;
  }

  async create(
    createTaskDto: CreateTaskDto,
    userId: string
  ): Promise<TaskResponseDto> {
    try {
      // Convert string IDs to ObjectIds
      const taskData = {
        ...createTaskDto,
        project: new Types.ObjectId(createTaskDto.project),
        board: new Types.ObjectId(createTaskDto.board),
        creator: new Types.ObjectId(createTaskDto.creator),
        status: createTaskDto.status || TaskStatus.TODO,
        lastModifier: new Types.ObjectId(userId),
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
    // Prepare update data
    const updateData: any = {
      ...updateTaskDto,
      lastModifier: new Types.ObjectId(userId),
      updatedAt: new Date()
    };

    // Handle assigneeId if provided
    if ('assigneeId' in updateTaskDto) {
      updateData.assignee = updateTaskDto.assigneeId
        ? new Types.ObjectId(updateTaskDto.assigneeId)
        : null;
      // Remove assigneeId to prevent it from being saved directly
      delete updateData.assigneeId;
    }

    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .populate('project', 'title')
      .exec();

    if (!updatedTask) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return this.toTaskResponse(updatedTask as unknown as TaskDocument);
  }

  async remove(id: string): Promise<void> {
    const result = await this.taskModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async updateStatus(
    id: string,
    status: TaskStatus,
    userId: string
  ): Promise<TaskResponseDto> {
    const updatedTask = await this.taskModel
      .findByIdAndUpdate(
        id,
        {
          status,
          lastModifier: userId,
          updatedAt: new Date()
        },
        { new: true }
      )
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .populate('project', 'title')
      .exec();

    if (!updatedTask) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return this.toTaskResponse(updatedTask as unknown as TaskDocument);
  }
}
