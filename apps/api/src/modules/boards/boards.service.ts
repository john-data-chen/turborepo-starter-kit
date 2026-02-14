import { forwardRef, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { ProjectsService } from "../projects/projects.service";
import { TasksService } from "../tasks/tasks.service";

import { CreateBoardDto } from "./dto/create-boards.dto";
import { UpdateBoardDto } from "./dto/update-boards.dto";
import { Board, BoardDocument } from "./schemas/boards.schema";

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    @Inject(forwardRef(() => ProjectsService))
    private projectsService: ProjectsService,
    @Inject(forwardRef(() => TasksService))
    private tasksService: TasksService
  ) {}

  private getProjectPopulatePipeline() {
    return [
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner"
        }
      },
      { $unwind: "$owner" },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members"
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          owner: {
            _id: 1,
            name: 1,
            email: 1
          },
          members: {
            _id: 1,
            name: 1,
            email: 1
          }
        }
      }
    ];
  }

  private getBoardProjection() {
    return {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        owner: {
          _id: 1,
          name: 1,
          email: 1
        },
        members: {
          _id: 1,
          name: 1,
          email: 1
        },
        projects: 1,
        createdAt: 1,
        updatedAt: 1
      }
    };
  }

  private getBoardPopulateStages() {
    return [
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner"
        }
      },
      { $unwind: "$owner" },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members"
        }
      },
      {
        $lookup: {
          from: "projects",
          localField: "projects",
          foreignField: "_id",
          as: "projects",
          pipeline: this.getProjectPopulatePipeline()
        }
      },
      this.getBoardProjection()
    ];
  }

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    // Convert owner string to ObjectId
    const ownerId = new Types.ObjectId(createBoardDto.owner);

    // Create the board with the owner as ObjectId
    const createdBoard = new this.boardModel({
      ...createBoardDto,
      owner: ownerId,
      // Add owner to members if not already present
      members: [
        ...new Set([ownerId, ...(createBoardDto.members || []).map((id) => new Types.ObjectId(id))])
      ]
    });

    return createdBoard.save();
  }

  async findAll(userId: string): Promise<{ myBoards: Board[]; teamBoards: Board[] }> {
    try {
      // Ensure userId is a valid ObjectId
      const isValidObjectId = Types.ObjectId.isValid(userId);
      if (!isValidObjectId) {
        this.logger.warn(`Invalid user ID format: ${userId}`);
        return { myBoards: [], teamBoards: [] };
      }
      // First, find boards where user is the owner
      const ownedBoards = await this.boardModel.aggregate([
        { $match: { owner: new Types.ObjectId(userId) } },
        ...this.getBoardPopulateStages()
      ]);

      // Then find boards where user is a member but not the owner
      const memberBoards = await this.boardModel.aggregate([
        {
          $match: {
            members: new Types.ObjectId(userId),
            owner: { $ne: new Types.ObjectId(userId) }
          }
        },
        ...this.getBoardPopulateStages()
      ]);

      return { myBoards: ownedBoards, teamBoards: memberBoards };
    } catch (error) {
      this.logger.error("Error finding boards:", error);
      throw error;
    }
  }

  async findOne(id: string, userId: string): Promise<Board> {
    try {
      // Validate ObjectIds
      if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
        throw new NotFoundException("Invalid board or user ID format");
      }

      const [board] = await this.boardModel.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(id),
            $or: [{ owner: new Types.ObjectId(userId) }, { members: new Types.ObjectId(userId) }]
          }
        },
        ...this.getBoardPopulateStages(),
        { $limit: 1 }
      ]);
      return board;
    } catch (error) {
      this.logger.error(`Error finding board ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, updateBoardDto: UpdateBoardDto, userId: string): Promise<Board> {
    // Convert userId to string to ensure consistent comparison
    const userIdString = userId.toString();

    // First, verify the board exists and the user has permission
    const board = await this.boardModel.findById(id).exec();

    if (!board) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }

    // Check if the user is the owner or a member
    const isOwner = board.owner.toString() === userIdString;
    const isMember = board.members.some((memberId) => memberId.toString() === userIdString);

    if (!isOwner && !isMember) {
      this.logger.warn("User has no permission to update board");
      throw new NotFoundException(`Board with ID "${id}" not found or access denied`);
    }

    // Update the board
    await this.boardModel.findByIdAndUpdate(id, { $set: updateBoardDto }, { new: true }).exec();

    // Return the fully populated board using the same approach as findOne()
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    // Convert userId to string to ensure consistent comparison
    const userIdString = userId.toString();

    // First, check if the board exists and the user has permission
    const board = await this.boardModel.findById(id).exec();

    if (!board) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }

    // Check if the user is the owner
    const isOwner = board.owner.toString() === userIdString;

    if (!isOwner) {
      this.logger.warn(
        `User ${userIdString} is not the owner of board ${id}. Board owner: ${board.owner.toString()}`
      );
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }

    try {
      // First, find all projects associated with this board
      const projects = await this.projectsService.findByBoardId(id);

      // Delete all tasks for each project
      for (const project of projects) {
        try {
          await this.tasksService.deleteTasksByProjectId(project._id.toString());
        } catch (error) {
          this.logger.error(`Error deleting tasks for project ${project._id}:`, error);
          // Continue with next project even if one fails
        }
      }

      // Delete all projects for this board
      await this.projectsService.deleteByBoardId(id);

      // Finally, delete the board itself
      const result = await this.boardModel.deleteOne({ _id: id }).exec();

      if (result.deletedCount === 0) {
        this.logger.error(`Failed to delete board ${id} for unknown reason`);
        throw new NotFoundException(`Failed to delete board with ID "${id}"`);
      }
      return { message: "Board deleted successfully" };
    } catch (error) {
      this.logger.error(`Error during board deletion for board ${id}:`, error);
      throw error;
    }
  }

  // Additional methods for board management
  async addMember(boardId: string, userId: string, memberId: string): Promise<Board> {
    const board = await this.boardModel
      .findOneAndUpdate(
        { _id: boardId, owner: userId },
        { $addToSet: { members: memberId } },
        { new: true }
      )
      .exec();

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    return board;
  }

  async removeMember(boardId: string, userId: string, memberId: string): Promise<Board> {
    const board = await this.boardModel
      .findOneAndUpdate(
        { _id: boardId, owner: userId },
        { $pull: { members: memberId } },
        { new: true }
      )
      .exec();

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    return board;
  }
}
