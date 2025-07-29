import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Board, BoardDocument } from "../schemas/board.schema";
import { UserService } from "../../user/services/user.service";

export interface BoardResponse {
  id: string;
  title: string;
  description?: string;
  owner: string;
  members: string[];
  projects: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    private userService: UserService,
  ) {}

  async findAll(userId: string): Promise<BoardResponse[]> {
    try {
      const userIdObj = new Types.ObjectId(userId);
      const boards = await this.boardModel
        .find({
          $or: [{ owner: userIdObj }, { members: userIdObj }],
        })
        .populate("projects")
        .lean()
        .exec();

      return boards.map((board) => this.toResponseObject(board));
    } catch (error) {
      console.error("Error fetching boards:", error);
      throw error;
    }
  }

  async findOne(id: string, userId: string): Promise<BoardResponse> {
    try {
      const boardId = new Types.ObjectId(id);
      const userIdObj = new Types.ObjectId(userId);

      const board = await this.boardModel
        .findOne({
          _id: boardId,
          $or: [{ owner: userIdObj }, { members: userIdObj }],
        })
        .populate("projects")
        .lean()
        .exec();

      if (!board) {
        throw new NotFoundException(`Board with ID ${id} not found`);
      }

      return this.toResponseObject(board);
    } catch (error) {
      console.error(`Error finding board with ID ${id}:`, error);
      throw error;
    }
  }

  async create(
    createBoardDto: { title: string; description?: string },
    userId: string,
  ): Promise<BoardResponse> {
    try {
      const userIdObj = new Types.ObjectId(userId);
      const createdBoard = new this.boardModel({
        ...createBoardDto,
        owner: userIdObj,
        members: [userIdObj],
        projects: [],
      });

      const savedBoard = await createdBoard.save();
      return this.toResponseObject(savedBoard.toObject());
    } catch (error) {
      console.error("Error creating board:", error);
      throw error;
    }
  }

  async update(
    id: string,
    updateBoardDto: { title?: string; description?: string },
    userId: string,
  ): Promise<BoardResponse> {
    try {
      const boardId = new Types.ObjectId(id);
      const userIdObj = new Types.ObjectId(userId);

      const board = await this.boardModel.findOneAndUpdate(
        { _id: boardId, owner: userIdObj },
        { $set: updateBoardDto },
        { new: true },
      );

      if (!board) {
        throw new NotFoundException(`Board with ID ${id} not found`);
      }

      return this.toResponseObject(board.toObject());
    } catch (error) {
      console.error(`Error updating board with ID ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<boolean> {
    try {
      const boardId = new Types.ObjectId(id);
      const userIdObj = new Types.ObjectId(userId);

      const result = await this.boardModel.deleteOne({
        _id: boardId,
        owner: userIdObj,
      });

      if (result.deletedCount === 0) {
        throw new NotFoundException(`Board with ID ${id} not found`);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting board with ID ${id}:`, error);
      throw error;
    }
  }

  async addProjectToBoard(
    boardId: string,
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const boardIdObj = new Types.ObjectId(boardId);
      const projectIdObj = new Types.ObjectId(projectId);

      // Verify user has access to the board
      await this.findOne(boardId, userId);

      const result = await this.boardModel.updateOne(
        { _id: boardIdObj },
        { $addToSet: { projects: projectIdObj } },
      );

      if (result.matchedCount === 0) {
        throw new NotFoundException(`Board with ID ${boardId} not found`);
      }

      return true;
    } catch (error) {
      console.error(
        `Error adding project ${projectId} to board ${boardId}:`,
        error,
      );
      throw error;
    }
  }

  async removeProjectFromBoard(
    boardId: string,
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const boardIdObj = new Types.ObjectId(boardId);
      const projectIdObj = new Types.ObjectId(projectId);

      // Verify user has access to the board
      await this.findOne(boardId, userId);

      const result = await this.boardModel.updateOne(
        { _id: boardIdObj },
        { $pull: { projects: projectIdObj } },
      );

      if (result.matchedCount === 0) {
        throw new NotFoundException(`Board with ID ${boardId} not found`);
      }

      return true;
    } catch (error) {
      console.error(
        `Error removing project ${projectId} from board ${boardId}:`,
        error,
      );
      throw error;
    }
  }

  private toResponseObject(board: any): BoardResponse {
    return {
      id: board._id.toString(),
      title: board.title,
      description: board.description,
      owner: board.owner.toString(),
      members: board.members.map((m: any) => m.toString()),
      projects: board.projects
        ? board.projects.map((p: any) => p.toString())
        : [],
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  }
}
