import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { Board, BoardDocument } from "../schemas/boards.schema";

@Injectable()
export class BoardRepository {
  constructor(@InjectModel(Board.name) private readonly boardModel: Model<BoardDocument>) {}

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
          owner: { _id: 1, name: 1, email: 1 },
          members: { _id: 1, name: 1, email: 1 }
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
        owner: { _id: 1, name: 1, email: 1 },
        members: { _id: 1, name: 1, email: 1 },
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

  async create(data: {
    title: string;
    description?: string;
    owner: Types.ObjectId;
    members: Types.ObjectId[];
    projects?: Types.ObjectId[];
  }): Promise<Board> {
    const board = new this.boardModel(data);
    return board.save();
  }

  async findByOwner(userId: Types.ObjectId): Promise<Board[]> {
    return this.boardModel.aggregate([
      { $match: { owner: userId } },
      ...this.getBoardPopulateStages()
    ]);
  }

  async findByMemberNotOwner(userId: Types.ObjectId): Promise<Board[]> {
    return this.boardModel.aggregate([
      { $match: { members: userId, owner: { $ne: userId } } },
      ...this.getBoardPopulateStages()
    ]);
  }

  async findOneWithAccess(boardId: Types.ObjectId, userId: Types.ObjectId): Promise<Board | null> {
    const [board] = await this.boardModel.aggregate([
      {
        $match: {
          _id: boardId,
          $or: [{ owner: userId }, { members: userId }]
        }
      },
      ...this.getBoardPopulateStages(),
      { $limit: 1 }
    ]);
    return board ?? null;
  }

  async findById(id: string): Promise<BoardDocument | null> {
    return this.boardModel.findById(id).exec();
  }

  async updateById(id: string, updateData: Partial<Board>): Promise<BoardDocument | null> {
    return this.boardModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
  }

  async deleteById(id: string): Promise<{ deletedCount: number }> {
    const result = await this.boardModel.deleteOne({ _id: id }).exec();
    return { deletedCount: result.deletedCount };
  }

  async addMember(boardId: string, ownerId: string, memberId: string): Promise<Board | null> {
    return this.boardModel
      .findOneAndUpdate(
        { _id: boardId, owner: ownerId },
        { $addToSet: { members: memberId } },
        { new: true }
      )
      .exec();
  }

  async removeMember(boardId: string, ownerId: string, memberId: string): Promise<Board | null> {
    return this.boardModel
      .findOneAndUpdate(
        { _id: boardId, owner: ownerId },
        { $pull: { members: memberId } },
        { new: true }
      )
      .exec();
  }
}
