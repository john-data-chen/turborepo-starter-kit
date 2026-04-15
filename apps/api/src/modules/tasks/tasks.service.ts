import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit
} from "@nestjs/common";
import { EventEmitter2 } from "eventemitter2";
import { Types } from "mongoose";

import { ProjectDeletedEvent } from "../../common/events";
import { ProjectsService } from "../projects/projects.service";

import { CreateTaskDto } from "./dto/create-task.dto";
import { TaskResponseDto } from "./dto/task-response.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TaskRepository } from "./repositories/tasks.repository";
import { TaskDocument, TaskStatus } from "./schemas/tasks.schema";

interface PopulatedUserRef {
  _id: Types.ObjectId | string;
  name?: string | null;
  email?: string | null;
}

@Injectable()
export class TasksService implements OnModuleInit {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectsService: ProjectsService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  onModuleInit(): void {
    this.eventEmitter.on("project.deleted", async (event: ProjectDeletedEvent) =>
      this.handleProjectDeleted(event)
    );
  }

  async handleProjectDeleted(event: ProjectDeletedEvent): Promise<void> {
    await this.taskRepository.deleteByProjectId(event.projectId);
  }

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<TaskResponseDto> {
    if (!userId) {
      throw new BadRequestException("User ID is required to create a task");
    }

    const creatorId = new Types.ObjectId(userId);
    const projectId = new Types.ObjectId(createTaskDto.project);

    // Add creator to project members if not already a member
    if (createTaskDto.project) {
      try {
        await this.projectsService.addMemberIfNotExists(createTaskDto.project, userId);
      } catch (error) {
        this.logger.error("Error adding creator to project members:", error);
      }
    }

    const orderInProject = createTaskDto.orderInProject ?? 0;

    const taskData = {
      ...createTaskDto,
      project: projectId,
      board: new Types.ObjectId(createTaskDto.board),
      creator: creatorId,
      lastModifier: creatorId,
      status: createTaskDto.status || TaskStatus.TODO,
      orderInProject,
      ...(createTaskDto.assignee && {
        assignee: new Types.ObjectId(createTaskDto.assignee)
      })
    };

    const savedTask = await this.taskRepository.create(taskData);
    return this.toTaskResponse(savedTask);
  }

  async findAll(projectId?: string, assigneeId?: string): Promise<TaskResponseDto[]> {
    const query: Record<string, unknown> = {};

    if (projectId) {
      query.project = new Types.ObjectId(projectId);
    }
    if (assigneeId) {
      query.assignee = new Types.ObjectId(assigneeId);
    }

    const tasks = await this.taskRepository.findByQuery(query);
    return Promise.all(tasks.map(async (task) => this.toTaskResponse(task)));
  }

  async findOne(id: string): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findByIdPopulated(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return this.toTaskResponse(task);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<TaskResponseDto> {
    await this.checkTaskPermission(id, userId);

    const updateData: Record<string, unknown> = {
      ...updateTaskDto,
      lastModifier: new Types.ObjectId(userId),
      updatedAt: new Date()
    };

    // Remove undefined values
    for (const key of Object.keys(updateData)) {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    }

    // Handle assigneeId → assignee conversion
    if ("assigneeId" in updateData) {
      updateData.assignee = updateData.assigneeId
        ? new Types.ObjectId(updateData.assigneeId as string)
        : null;
      delete updateData.assigneeId;
    }

    const updatedTask = await this.taskRepository.updateById(id, updateData);

    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return this.toTaskResponse(updatedTask);
  }

  async remove(id: string, userId: string): Promise<void> {
    const taskToDelete = await this.checkTaskPermission(id, userId, true);
    const { project: projectId, orderInProject: deletedOrder } = taskToDelete;

    const result = await this.taskRepository.deleteById(id);

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    await this.taskRepository.decrementOrderAfter(projectId, deletedOrder);
  }

  async moveTask(
    taskId: string,
    newProjectId: string,
    newOrderInProject: number,
    userId: string
  ): Promise<TaskResponseDto> {
    await this.checkTaskPermission(taskId, userId);

    if (!Types.ObjectId.isValid(taskId)) {
      throw new BadRequestException("Invalid task ID");
    }
    if (!Types.ObjectId.isValid(newProjectId)) {
      throw new BadRequestException("Invalid project ID");
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException("Invalid user ID");
    }

    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID "${taskId}" not found`);
    }

    const oldProjectId = task.project.toString();
    const oldOrderInProject = task.orderInProject ?? 0;

    // Update the task
    task.project = new Types.ObjectId(newProjectId);
    task.orderInProject = newOrderInProject;
    task.lastModifier = new Types.ObjectId(userId);
    task.updatedAt = new Date();
    await this.taskRepository.save(task);

    if (oldProjectId === newProjectId) {
      // Same project: reorder within
      if (oldOrderInProject !== newOrderInProject) {
        await this.taskRepository.reorderOnMoveWithinProject(
          new Types.ObjectId(newProjectId),
          taskId,
          oldOrderInProject,
          newOrderInProject
        );
      }
    } else {
      // Different project: adjust both
      await this.taskRepository.decrementOrderAfter(
        new Types.ObjectId(oldProjectId),
        oldOrderInProject
      );
      await this.taskRepository.incrementOrderFrom(
        new Types.ObjectId(newProjectId),
        newOrderInProject,
        taskId
      );
    }

    const updatedTask = await this.taskRepository.findByIdPopulated(taskId);
    if (!updatedTask) {
      throw new NotFoundException("Task not found after update");
    }

    return this.toTaskResponse(updatedTask);
  }

  // --- Private helpers ---

  private async checkTaskPermission(
    taskId: string,
    userId: string,
    requireCreator = false
  ): Promise<TaskDocument> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const userIdString = userId?.toString();
    const creatorIdString = task.creator?.toString();
    const assigneeIdString = task.assignee?.toString();

    const isCreator = creatorIdString === userIdString;
    const isAssignee = assigneeIdString === userIdString;

    if (requireCreator && !isCreator) {
      throw new ForbiddenException("Only the task creator can perform this action");
    }

    if (!isCreator && !isAssignee) {
      throw new ForbiddenException("You do not have permission to modify this task");
    }

    return task;
  }

  private toUserResponse(user: PopulatedUserRef | null | undefined) {
    if (!user) {
      return null;
    }
    return {
      _id: user._id?.toString() || "",
      name: user.name ?? null,
      email: user.email ?? undefined
    };
  }

  private async toTaskResponse(task: TaskDocument): Promise<TaskResponseDto> {
    let populatedTask = task;
    if (typeof task.populate === "function") {
      populatedTask = await task.populate([
        { path: "creator", select: "name email" },
        { path: "assignee", select: "name email" },
        { path: "lastModifier", select: "name email" }
      ]);
    }

    const response: Partial<TaskResponseDto> & Pick<TaskResponseDto, "_id" | "title" | "status"> = {
      _id: populatedTask._id.toString(),
      title: populatedTask.title,
      status: populatedTask.status,
      board: populatedTask.board?.toString(),
      project: populatedTask.project?.toString(),
      createdAt: populatedTask.createdAt,
      updatedAt: populatedTask.updatedAt,
      orderInProject: populatedTask.orderInProject ?? 0,
      creator: this.toUserResponse(populatedTask.creator as PopulatedUserRef | null),
      assignee: this.toUserResponse(populatedTask.assignee as PopulatedUserRef | null),
      lastModifier: populatedTask.lastModifier
        ? this.toUserResponse(populatedTask.lastModifier as PopulatedUserRef | null)
        : this.toUserResponse(populatedTask.creator as PopulatedUserRef | null)
    };

    if (populatedTask.description) {
      response.description = populatedTask.description;
    }
    if (populatedTask.dueDate) {
      response.dueDate = populatedTask.dueDate;
    }

    return response as TaskResponseDto;
  }
}
