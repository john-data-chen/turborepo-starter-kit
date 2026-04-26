import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { Task, TaskDocument } from "../schemas/tasks.schema";

@Injectable()
export class TaskRepository {
  constructor(@InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>) {}

  async create(data: Partial<Task>): Promise<TaskDocument> {
    const task = new this.taskModel(data);
    return task.save();
  }

  async findByQuery(
    query: Record<string, unknown>,
    sort: Record<string, 1 | -1> = { orderInProject: 1 }
  ): Promise<TaskDocument[]> {
    return this.taskModel.find(query).sort(sort).populate("lastModifier", "name email").exec();
  }

  async findById(id: string): Promise<TaskDocument | null> {
    return this.taskModel.findById(id);
  }

  async findByIdPopulated(id: string): Promise<TaskDocument | null> {
    return this.taskModel
      .findById(id)
      .populate("creator", "name email")
      .populate("assignee", "name email")
      .populate("lastModifier", "name email")
      .exec();
  }

  async updateById(id: string, updateData: Record<string, unknown>): Promise<TaskDocument | null> {
    return this.taskModel
      .findByIdAndUpdate(id, { $set: updateData }, { returnDocument: "after" })
      .populate("lastModifier", "name email")
      .exec();
  }

  async deleteById(id: string): Promise<{ deletedCount: number }> {
    const result = await this.taskModel.deleteOne({ _id: new Types.ObjectId(id) }).exec();
    return { deletedCount: result.deletedCount };
  }

  async deleteByProjectId(projectId: string): Promise<{ deletedCount: number }> {
    const result = await this.taskModel
      .deleteMany({ project: new Types.ObjectId(projectId) })
      .exec();
    return { deletedCount: result.deletedCount || 0 };
  }

  async decrementOrderAfter(projectId: Types.ObjectId, deletedOrder: number): Promise<void> {
    await this.taskModel
      .updateMany(
        { project: projectId, orderInProject: { $gt: deletedOrder } },
        { $inc: { orderInProject: -1 } }
      )
      .exec();
  }

  async reorderOnMoveWithinProject(
    projectId: Types.ObjectId,
    taskId: string,
    oldOrder: number,
    newOrder: number
  ): Promise<void> {
    if (newOrder > oldOrder) {
      await this.taskModel.updateMany(
        {
          project: projectId,
          orderInProject: { $gt: oldOrder, $lte: newOrder },
          _id: { $ne: taskId }
        },
        { $inc: { orderInProject: -1 } }
      );
    } else {
      await this.taskModel.updateMany(
        {
          project: projectId,
          orderInProject: { $gte: newOrder, $lt: oldOrder },
          _id: { $ne: taskId }
        },
        { $inc: { orderInProject: 1 } }
      );
    }
  }

  async incrementOrderFrom(
    projectId: Types.ObjectId,
    fromOrder: number,
    excludeTaskId: string
  ): Promise<void> {
    await this.taskModel.updateMany(
      {
        project: projectId,
        orderInProject: { $gte: fromOrder },
        _id: { $ne: excludeTaskId }
      },
      { $inc: { orderInProject: 1 } }
    );
  }

  async save(task: TaskDocument): Promise<TaskDocument> {
    return task.save();
  }
}
