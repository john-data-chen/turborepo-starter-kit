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

  private toTaskResponse(task: TaskDocument): TaskResponseDto {
    return {
      _id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate,
      board: task.board.toString(),
      project: task.project.toString(),
      assignee: task.assignee?.toString(),
      creator: task.creator.toString(),
      lastModifier: task.lastModifier.toString(),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
  }

  async create(
    createTaskDto: CreateTaskDto,
    userId: string
  ): Promise<TaskResponseDto> {
    const createdTask = new this.taskModel({
      ...createTaskDto,
      creator: userId,
      lastModifier: userId
    });

    const savedTask = await createdTask.save();
    return this.toTaskResponse(savedTask);
  }

  async findAll(
    projectId?: string,
    assigneeId?: string
  ): Promise<TaskResponseDto[]> {
    const query: any = {};

    if (projectId) {
      query.project = projectId;
    }

    if (assigneeId) {
      query.assignee = assigneeId;
    }

    const tasks = await this.taskModel
      .find(query)
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .exec();

    return tasks.map((task) =>
      this.toTaskResponse(task as unknown as TaskDocument)
    );
  }

  async findOne(id: string): Promise<TaskResponseDto> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return this.toTaskResponse(task);
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
    const updatedTask = await this.taskModel
      .findByIdAndUpdate(
        id,
        {
          ...updateTaskDto,
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
