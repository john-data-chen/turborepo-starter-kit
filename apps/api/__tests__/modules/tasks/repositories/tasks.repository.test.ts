import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TaskRepository } from "../../../../src/modules/tasks/repositories/tasks.repository";

describe("TaskRepository", () => {
  let repository: TaskRepository;
  let mockModel: any;

  beforeEach(() => {
    // Correctly define MockModel as a function that mimics a constructor
    const MockModel = vi.fn().mockImplementation(function (data) {
      return {
        ...data,
        save: vi.fn().mockResolvedValue(data)
      };
    }) as any;

    // Attach static methods
    MockModel.find = vi.fn().mockReturnThis();
    MockModel.findById = vi.fn().mockReturnThis();
    MockModel.findByIdAndUpdate = vi.fn().mockReturnThis();
    MockModel.deleteOne = vi.fn().mockReturnThis();
    MockModel.deleteMany = vi.fn().mockReturnThis();
    MockModel.updateMany = vi.fn().mockReturnThis();
    MockModel.populate = vi.fn().mockReturnThis();
    MockModel.sort = vi.fn().mockReturnThis();
    MockModel.exec = vi.fn();

    mockModel = MockModel;
    repository = new TaskRepository(mockModel);
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  describe("create", () => {
    it("should create a task", async () => {
      const data = { title: "Test Task", project: new Types.ObjectId() };

      // The MockModel implementation defined in beforeEach handles the instance creation
      // We can override it if needed, but the default one works for this test

      const result = await repository.create(data);

      expect(mockModel).toHaveBeenCalledWith(data);
      expect(result).toEqual(expect.objectContaining(data));
    });
  });

  describe("findByQuery", () => {
    it("should find tasks by query", async () => {
      const query = { project: new Types.ObjectId() };
      const mockTasks = [{ _id: new Types.ObjectId(), title: "Task 1" }];

      mockModel.exec.mockResolvedValue(mockTasks);

      const result = await repository.findByQuery(query);

      expect(mockModel.find).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockTasks);
    });

    it("should accept custom sort order", async () => {
      const query = { project: new Types.ObjectId() };
      const mockTasks = [{ _id: new Types.ObjectId(), title: "Task 1" }];

      mockModel.exec.mockResolvedValue(mockTasks);

      await repository.findByQuery(query, { orderInProject: -1 });

      expect(mockModel.sort).toHaveBeenCalledWith({ orderInProject: -1 });
    });
  });

  describe("findById", () => {
    it("should find a task by id", async () => {
      const taskId = new Types.ObjectId().toHexString();
      const mockTask = { _id: taskId, title: "Task 1" };

      mockModel.findById.mockReturnValue(mockTask);

      // Fix: Actually call the repository method
      await repository.findById(taskId);

      expect(mockModel.findById).toHaveBeenCalledWith(taskId);
    });
  });

  describe("findByIdPopulated", () => {
    it("should find a task by id with populated fields", async () => {
      const taskId = new Types.ObjectId().toHexString();
      const mockTask = {
        _id: taskId,
        title: "Task 1",
        creator: { name: "Creator", email: "creator@test.com" }
      };

      mockModel.exec.mockResolvedValue(mockTask);

      const result = await repository.findByIdPopulated(taskId);

      expect(result).toEqual(mockTask);
    });
  });

  describe("updateById", () => {
    it("should update a task by id", async () => {
      const taskId = new Types.ObjectId().toHexString();
      const updateData = { title: "Updated Task" };
      const mockTask = { _id: taskId, ...updateData };

      mockModel.exec.mockResolvedValue(mockTask);

      const result = await repository.updateById(taskId, updateData);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        taskId,
        { $set: updateData },
        { returnDocument: "after" }
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe("deleteById", () => {
    it("should delete a task by id", async () => {
      const taskId = new Types.ObjectId().toHexString();

      mockModel.exec.mockResolvedValue({ deletedCount: 1 });

      const result = await repository.deleteById(taskId);

      expect(mockModel.deleteOne).toHaveBeenCalled();
      expect(result).toEqual({ deletedCount: 1 });
    });
  });

  describe("deleteByProjectId", () => {
    it("should delete all tasks by project id", async () => {
      const projectId = new Types.ObjectId().toHexString();

      mockModel.exec.mockResolvedValue({ deletedCount: 5 });

      const result = await repository.deleteByProjectId(projectId);

      expect(mockModel.deleteMany).toHaveBeenCalled();
      expect(result).toEqual({ deletedCount: 5 });
    });

    it("should return 0 if no tasks deleted", async () => {
      const projectId = new Types.ObjectId().toHexString();

      mockModel.exec.mockResolvedValue({ deletedCount: 0 });

      const result = await repository.deleteByProjectId(projectId);

      expect(result).toEqual({ deletedCount: 0 });
    });
  });

  describe("decrementOrderAfter", () => {
    it("should decrement order for tasks after deleted order", async () => {
      const projectId = new Types.ObjectId();
      const deletedOrder = 5;

      mockModel.exec.mockResolvedValue({ modifiedCount: 3 });

      await repository.decrementOrderAfter(projectId, deletedOrder);

      expect(mockModel.updateMany).toHaveBeenCalledWith(
        { project: projectId, orderInProject: { $gt: deletedOrder } },
        { $inc: { orderInProject: -1 } }
      );
    });
  });

  describe("reorderOnMoveWithinProject", () => {
    it("should decrement order when moving to higher order", async () => {
      const projectId = new Types.ObjectId();
      const taskId = new Types.ObjectId().toHexString();
      const oldOrder = 2;
      const newOrder = 5;

      mockModel.updateMany.mockResolvedValue({ modifiedCount: 3 });

      await repository.reorderOnMoveWithinProject(projectId, taskId, oldOrder, newOrder);

      expect(mockModel.updateMany).toHaveBeenCalledWith(
        {
          project: projectId,
          orderInProject: { $gt: oldOrder, $lte: newOrder },
          _id: { $ne: taskId }
        },
        { $inc: { orderInProject: -1 } }
      );
    });

    it("should increment order when moving to lower order", async () => {
      const projectId = new Types.ObjectId();
      const taskId = new Types.ObjectId().toHexString();
      const oldOrder = 5;
      const newOrder = 2;

      mockModel.updateMany.mockResolvedValue({ modifiedCount: 3 });

      await repository.reorderOnMoveWithinProject(projectId, taskId, oldOrder, newOrder);

      expect(mockModel.updateMany).toHaveBeenCalledWith(
        {
          project: projectId,
          orderInProject: { $gte: newOrder, $lt: oldOrder },
          _id: { $ne: taskId }
        },
        { $inc: { orderInProject: 1 } }
      );
    });
  });

  describe("incrementOrderFrom", () => {
    it("should increment order for tasks from a position", async () => {
      const projectId = new Types.ObjectId();
      const fromOrder = 5;
      const excludeTaskId = new Types.ObjectId().toHexString();

      mockModel.updateMany.mockResolvedValue({ modifiedCount: 3 });

      await repository.incrementOrderFrom(projectId, fromOrder, excludeTaskId);

      expect(mockModel.updateMany).toHaveBeenCalledWith(
        {
          project: projectId,
          orderInProject: { $gte: fromOrder },
          _id: { $ne: excludeTaskId }
        },
        { $inc: { orderInProject: 1 } }
      );
    });
  });

  describe("save", () => {
    it("should save a task document", async () => {
      const mockTask = {
        _id: new Types.ObjectId(),
        title: "Task 1",
        save: vi.fn().mockResolvedValue({ _id: new Types.ObjectId(), title: "Task 1" })
      };

      const result = await repository.save(mockTask as any);

      expect(mockTask.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ title: "Task 1" }));
    });
  });
});
