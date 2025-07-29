import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Project, ProjectDocument } from "../schemas/project.schema";
import { BoardService } from "../../board/services/board.service";
import { UserService } from "../../user/services/user.service";

export interface ProjectResponse {
  id: string;
  title: string;
  description?: string;
  owner: string;
  members: string[];
  board: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    private boardService: BoardService,
    private userService: UserService,
  ) {}

  async findAllByBoard(
    boardId: string,
    userId: string,
  ): Promise<ProjectResponse[]> {
    try {
      // Verify user has access to the board
      await this.boardService.findOne(boardId, userId);

      const projects = await this.projectModel
        .find({ board: boardId })
        .lean()
        .exec();

      return projects.map((project) => this.toResponseObject(project));
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  }

  async findOne(id: string, userId: string): Promise<ProjectResponse> {
    try {
      const project = await this.projectModel.findById(id).lean().exec();

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      // Verify user has access to the board this project belongs to
      await this.boardService.findOne(project.board.toString(), userId);

      return this.toResponseObject(project);
    } catch (error) {
      console.error(`Error finding project with ID ${id}:`, error);
      throw error;
    }
  }

  async create(
    createProjectDto: { title: string; description?: string; board: string },
    userId: string,
  ): Promise<ProjectResponse> {
    try {
      const boardId = new Types.ObjectId(createProjectDto.board);
      const userIdObj = new Types.ObjectId(userId);

      // Verify user has access to the board
      await this.boardService.findOne(boardId.toString(), userId);

      const createdProject = new this.projectModel({
        ...createProjectDto,
        board: boardId,
        owner: userIdObj,
        members: [userIdObj],
      });

      const savedProject = await createdProject.save();

      // Add project to board's projects array
      await this.boardService.addProjectToBoard(
        boardId.toString(),
        savedProject._id.toString(),
        userId,
      );

      return this.toResponseObject(savedProject.toObject());
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }

  async update(
    id: string,
    updateProjectDto: { title?: string; description?: string },
    userId: string,
  ): Promise<ProjectResponse> {
    try {
      const projectId = new Types.ObjectId(id);
      const project = await this.projectModel.findById(projectId).exec();

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      // Verify user is the owner
      if (!project.owner.equals(new Types.ObjectId(userId))) {
        throw new NotFoundException(
          "Only the project owner can update this project",
        );
      }

      Object.assign(project, updateProjectDto);
      const updatedProject = await project.save();

      return this.toResponseObject(updatedProject.toObject());
    } catch (error) {
      console.error(`Error updating project with ID ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<boolean> {
    try {
      const projectId = new Types.ObjectId(id);
      const userIdObj = new Types.ObjectId(userId);

      const project = await this.projectModel.findById(projectId).exec();

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      // Verify user is the owner
      if (!project.owner.equals(userIdObj)) {
        throw new NotFoundException(
          "Only the project owner can delete this project",
        );
      }

      // Remove project from board's projects array
      await this.boardService.removeProjectFromBoard(
        project.board.toString(),
        projectId.toString(),
        userId,
      );

      await project.deleteOne();
      return true;
    } catch (error) {
      console.error(`Error deleting project with ID ${id}:`, error);
      throw error;
    }
  }

  private toResponseObject(project: any): ProjectResponse {
    return {
      id: project._id.toString(),
      title: project.title,
      description: project.description,
      owner: project.owner.toString(),
      members: project.members.map((m: any) => m.toString()),
      board: project.board.toString(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
