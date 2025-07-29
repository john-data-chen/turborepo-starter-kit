import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Task, TaskDocument, TaskStatus } from "../schemas/task.schema";
import { BoardService } from "../../board/services/board.service";
import { ProjectService } from "../../project/services/project.service";
import { UserService } from "../../user/services/user.service";

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: Date;
  board: string;
  project: string;
  assignee?: string;
  creator: string;
  lastModifier: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private boardService: BoardService,
    private projectService: ProjectService,
    private userService: UserService,
  ) {}

  async findByProject(
    projectId: string,
    userId: string,
  ): Promise<TaskResponse[]> {
    try {
      // Verify user has access to the project's board
      await this.projectService.findOne(projectId, userId);

      const tasks = await this.taskModel
        .find({ project: projectId })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      return tasks.map((task) => this.toResponseObject(task));
    } catch (error) {
      console.error(`Error finding tasks for project ${projectId}:`, error);
      throw error;
    }
  }

  async findOne(id: string, userId: string): Promise<TaskResponse> {
    try {
      const task = await this.taskModel.findById(id).lean().exec();

      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      // Verify user has access to the task's board
      await this.boardService.findOne(task.board.toString(), userId);

      return this.toResponseObject(task);
    } catch (error) {
      console.error(`Error finding task with ID ${id}:`, error);
      throw error;
    }
  }

  async create(
    createTaskDto: {
      title: string;
      description?: string;
      status?: TaskStatus;
      dueDate?: Date;
      projectId: string;
      assigneeId?: string;
    },
    userId: string,
  ): Promise<TaskResponse> {
    try {
      // Verify user has access to the project
      const project = await this.projectService.findOne(
        createTaskDto.projectId,
        userId,
      );

      // Verify assignee is a member of the board if provided
      if (createTaskDto.assigneeId) {
        await this.verifyUserIsBoardMember(
          project.board,
          createTaskDto.assigneeId,
        );
      }

      const createdTask = new this.taskModel({
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status || TaskStatus.TODO,
        dueDate: createTaskDto.dueDate,
        board: project.board,
        project: createTaskDto.projectId,
        assignee: createTaskDto.assigneeId,
        creator: userId,
        lastModifier: userId,
      });

      const savedTask = await createdTask.save();
      return this.toResponseObject(savedTask.toObject());
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  async update(
    id: string,
    updateTaskDto: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      dueDate?: Date;
      assigneeId?: string;
      projectId?: string;
    },
    userId: string,
  ): Promise<TaskResponse> {
    try {
      const task = await this.taskModel.findById(id).exec();

      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      // Verify user has access to the task's board
      await this.boardService.findOne(task.board.toString(), userId);

      // If project is being updated, verify the new project exists and user has access
      if (updateTaskDto.projectId) {
        const newProjectId = new Types.ObjectId(updateTaskDto.projectId);

        // Only proceed if the project is actually changing
        const currentProjectId = task.project as unknown as Types.ObjectId;
        if (!currentProjectId || !currentProjectId.equals(newProjectId)) {
          const newProject = await this.projectService.findOne(
            newProjectId.toString(),
            userId,
          );

          // Verify the new project is in the same board
          const currentBoardId = task.board as unknown as Types.ObjectId;
          if (newProject.board !== currentBoardId.toString()) {
            throw new NotFoundException(
              "Cannot move task to a project in a different board",
            );
          }

          task.project = newProjectId as any; // Cast to any to handle Mongoose types
        }
      }

      // Verify new assignee is a member of the board if provided
      if (updateTaskDto.assigneeId) {
        const assigneeId = new Types.ObjectId(updateTaskDto.assigneeId);
        const currentBoardId = task.board as unknown as Types.ObjectId;
        const currentAssigneeId = task.assignee as unknown as
          | Types.ObjectId
          | undefined;

        // Only proceed if the assignee is actually changing
        if (!currentAssigneeId || !currentAssigneeId.equals(assigneeId)) {
          await this.verifyUserIsBoardMember(
            currentBoardId.toString(),
            assigneeId.toString(),
          );
          task.assignee = assigneeId as any; // Cast to any to handle Mongoose types
        }
      }

      // Update other fields if provided
      if (updateTaskDto.title) task.title = updateTaskDto.title;
      if (updateTaskDto.description !== undefined)
        task.description = updateTaskDto.description;
      if (updateTaskDto.status) task.status = updateTaskDto.status;
      if (updateTaskDto.dueDate !== undefined)
        task.dueDate = updateTaskDto.dueDate;

      task.lastModifier = new Types.ObjectId(userId);
      const updatedTask = await task.save();

      return this.toResponseObject(updatedTask.toObject());
    } catch (error) {
      console.error(`Error updating task with ID ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<boolean> {
    try {
      const task = await this.taskModel.findById(id).exec();

      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      // Verify user has access to the task's board
      await this.boardService.findOne(task.board.toString(), userId);

      await task.deleteOne();
      return true;
    } catch (error) {
      console.error(`Error deleting task with ID ${id}:`, error);
      throw error;
    }
  }

  private async verifyUserIsBoardMember(
    boardId: string,
    userId: string,
  ): Promise<void> {
    try {
      const board = await this.boardService.findOne(boardId, userId);

      // Check if the user is the board owner or a member
      if (board.owner !== userId && !board.members.includes(userId)) {
        throw new NotFoundException("User is not a member of this board");
      }
    } catch (error) {
      console.error(
        `Error verifying user ${userId} is a member of board ${boardId}:`,
        error,
      );
      throw error;
    }
  }

  private toResponseObject(task: any): TaskResponse {
    return {
      id: task._id.toString(),
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
      updatedAt: task.updatedAt,
    };
  }
}
