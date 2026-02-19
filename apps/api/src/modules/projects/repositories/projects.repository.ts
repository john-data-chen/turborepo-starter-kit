import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { Project, ProjectDocument } from "../schemas/projects.schema";

@Injectable()
export class ProjectRepository {
  constructor(@InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>) {}

  async findByBoardId(boardId: string): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({ board: new Types.ObjectId(boardId) })
      .populate("board", "title")
      .populate("owner", "name email")
      .populate("members", "name email")
      .exec();
  }

  async findById(id: string): Promise<ProjectDocument | null> {
    return this.projectModel.findById(id);
  }

  async findByIdPopulated(id: string): Promise<ProjectDocument | null> {
    return this.projectModel
      .findById(id)
      .populate("owner", "name email")
      .populate("members", "name email")
      .populate("assignee", "name email")
      .exec();
  }

  async create(data: Partial<Project>): Promise<ProjectDocument> {
    const project = new this.projectModel(data);
    return project.save();
  }

  async updateById(id: string, updateData: Partial<Project>): Promise<ProjectDocument | null> {
    return this.projectModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .populate("owner", "name email")
      .populate("members", "name email")
      .populate("assignee", "name email")
      .exec();
  }

  async deleteById(id: string): Promise<{ deletedCount: number }> {
    const result = await this.projectModel.deleteOne({ _id: id });
    return { deletedCount: result.deletedCount };
  }

  async deleteByBoardId(boardId: string): Promise<{ deletedCount: number }> {
    const result = await this.projectModel
      .deleteMany({ board: new Types.ObjectId(boardId) })
      .exec();
    return { deletedCount: result.deletedCount || 0 };
  }

  async getLastOrderInBoard(boardId: string): Promise<number> {
    const lastProject = await this.projectModel
      .findOne({ board: boardId })
      .sort({ orderInBoard: -1 })
      .select("orderInBoard")
      .lean();
    return lastProject ? lastProject.orderInBoard + 1 : 0;
  }

  async decrementOrderAfter(boardId: Types.ObjectId, deletedOrder: number): Promise<void> {
    await this.projectModel
      .updateMany(
        { board: boardId, orderInBoard: { $gt: deletedOrder } },
        { $inc: { orderInBoard: -1 } }
      )
      .exec();
  }

  async addMember(projectId: string, userId: Types.ObjectId): Promise<void> {
    await this.projectModel.updateOne({ _id: projectId }, { $addToSet: { members: userId } });
  }

  async isMember(projectId: string, userId: Types.ObjectId): Promise<boolean> {
    const result = await this.projectModel.exists({
      _id: projectId,
      members: userId
    });
    return !!result;
  }
}
