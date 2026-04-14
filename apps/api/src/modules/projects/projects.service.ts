import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit
} from "@nestjs/common";
import { EventEmitter2 } from "eventemitter2";
import { Types } from "mongoose";

import { BoardDeletedEvent, ProjectDeletedEvent } from "../../common/events";
import { BoardService } from "../boards/boards.service";

import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectRepository } from "./repositories/projects.repository";
import { Project, ProjectDocument } from "./schemas/projects.schema";

@Injectable()
export class ProjectsService implements OnModuleInit {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly boardService: BoardService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  onModuleInit(): void {
    this.eventEmitter.on("board.deleted", async (event: BoardDeletedEvent) =>
      this.handleBoardDeleted(event)
    );
  }

  // Cascade step: triggered by 'board.deleted' event.
  // Finds all projects belonging to the deleted board and emits 'project.deleted' for each,
  // which TasksService then listens to for final cleanup.
  async handleBoardDeleted(event: BoardDeletedEvent): Promise<void> {
    const projects = await this.projectRepository.findByBoardId(event.boardId);

    // Emit project.deleted for each project so TasksService can clean up
    for (const project of projects) {
      this.eventEmitter.emit("project.deleted", new ProjectDeletedEvent(project._id.toString()));
    }

    await this.projectRepository.deleteByBoardId(event.boardId);
  }

  async findByBoardId(boardId: string): Promise<ProjectDocument[]> {
    if (!Types.ObjectId.isValid(boardId)) {
      throw new NotFoundException("Invalid board ID");
    }

    return this.projectRepository.findByBoardId(boardId);
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string
  ): Promise<ProjectDocument> {
    this.validateIds(id, userId);

    const project = await this.findProjectById(id);
    await this.checkUpdatePermissions(project, userId, updateProjectDto);
    const updateData = this.prepareUpdateData(updateProjectDto);

    const updatedProject = await this.projectRepository.updateById(id, updateData);
    if (!updatedProject) {
      throw new NotFoundException("Project not found after update");
    }
    return updatedProject;
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    this.validateIds(id, userId);

    const project = await this.findProjectById(id);

    if (project.owner.toString() !== userId.toString()) {
      throw new BadRequestException("You do not have permission to delete this project");
    }

    const { board: boardId, orderInBoard: deletedOrder } = project;

    // Emit event for cascade task deletion
    this.eventEmitter.emit("project.deleted", new ProjectDeletedEvent(id));

    const result = await this.projectRepository.deleteById(id);

    if (result.deletedCount === 0) {
      throw new NotFoundException("Failed to delete project");
    }

    // Reorder remaining projects in the same board
    if (deletedOrder !== undefined) {
      await this.projectRepository.decrementOrderAfter(boardId, deletedOrder);
    }

    return { message: "Project deleted successfully" };
  }

  async addMemberIfNotExists(projectId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(userId)) {
      return;
    }

    const userIdObj = new Types.ObjectId(userId);
    const isMember = await this.projectRepository.isMember(projectId, userIdObj);

    if (!isMember) {
      await this.projectRepository.addMember(projectId, userIdObj);
    }
  }

  async create(createProjectDto: CreateProjectDto & { owner: string }): Promise<ProjectDocument> {
    const { title, description, boardId, owner } = createProjectDto;

    if (!Types.ObjectId.isValid(boardId)) {
      throw new BadRequestException(`Invalid board ID: ${boardId}`);
    }

    if (!Types.ObjectId.isValid(owner)) {
      throw new BadRequestException(`Invalid owner ID: ${owner}`);
    }

    let order = createProjectDto.orderInBoard;
    if (order === undefined) {
      order = await this.projectRepository.getLastOrderInBoard(boardId);
    }

    const projectData: Partial<Project> = {
      title,
      description: description || null,
      owner: new Types.ObjectId(owner),
      board: new Types.ObjectId(boardId),
      members: [new Types.ObjectId(owner)],
      orderInBoard: order
    };

    const savedProject = await this.projectRepository.create(projectData);

    const populatedProject = await this.projectRepository.findByIdPopulated(
      savedProject._id.toString()
    );

    if (!populatedProject) {
      throw new NotFoundException("Project not found after creation");
    }

    return populatedProject;
  }

  // --- Private helpers ---

  private validateIds(id: string, userId: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid project ID");
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException("Invalid user ID");
    }
  }

  private async findProjectById(id: string): Promise<ProjectDocument> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException("Project not found");
    }
    return project;
  }

  private async checkUpdatePermissions(
    project: ProjectDocument,
    userId: string,
    updateProjectDto: UpdateProjectDto
  ): Promise<void> {
    const isOwner = project.owner.toString() === userId.toString();
    const isOrderOnly = this.isOrderOnlyUpdate(updateProjectDto);

    if (!isOwner) {
      if (isOrderOnly) {
        await this.verifyBoardMembership(project, userId);
      } else {
        throw new BadRequestException("You do not have permission to update this project");
      }
    }
  }

  private isOrderOnlyUpdate(updateProjectDto: UpdateProjectDto): boolean {
    return (
      updateProjectDto.orderInBoard !== undefined &&
      updateProjectDto.title === undefined &&
      updateProjectDto.description === undefined &&
      updateProjectDto.status === undefined &&
      updateProjectDto.dueDate === undefined &&
      updateProjectDto.assigneeId === undefined
    );
  }

  private async verifyBoardMembership(project: ProjectDocument, userId: string): Promise<void> {
    const boardId = project.board.toString();
    const board = await this.boardService.findOne(boardId, userId);
    if (!board) {
      throw new BadRequestException("You do not have permission to reorder projects in this board");
    }
  }

  private prepareUpdateData(updateProjectDto: UpdateProjectDto): Partial<Project> {
    const updateData: Partial<Project> = {};

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
    if (updateProjectDto.orderInBoard !== undefined) {
      updateData.orderInBoard = updateProjectDto.orderInBoard;
    }
    if (updateProjectDto.assigneeId !== undefined) {
      updateData.assignee = updateProjectDto.assigneeId
        ? new Types.ObjectId(updateProjectDto.assigneeId)
        : null;
    }

    return updateData;
  }
}
