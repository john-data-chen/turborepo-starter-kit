import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProjectRepository } from "../../../../src/modules/projects/repositories/projects.repository";

describe("ProjectRepository", () => {
  let repository: ProjectRepository;
  let mockModel: any;

  beforeEach(() => {
    // Correctly define MockModel as a function that mimics a constructor
    const MockModel = vi.fn().mockImplementation(function (data) {
      return {
        ...data,
        save: vi.fn().mockResolvedValue(data)
      };
    }) as any;

    MockModel.find = vi.fn().mockReturnThis();
    MockModel.findById = vi.fn().mockReturnThis();
    MockModel.populate = vi.fn().mockReturnThis();
    MockModel.exec = vi.fn();
    MockModel.findByIdAndUpdate = vi.fn().mockReturnThis();
    MockModel.deleteOne = vi.fn();
    MockModel.deleteMany = vi.fn().mockReturnThis();
    MockModel.findOne = vi.fn().mockReturnThis();
    MockModel.sort = vi.fn().mockReturnThis();
    MockModel.select = vi.fn().mockReturnThis();
    MockModel.lean = vi.fn();
    MockModel.updateMany = vi.fn().mockReturnThis();
    MockModel.updateOne = vi.fn();
    MockModel.exists = vi.fn();

    mockModel = MockModel;
    repository = new ProjectRepository(mockModel);
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  describe("findByBoardId", () => {
    it("should find projects by board id", async () => {
      const boardId = new Types.ObjectId().toHexString();
      const mockProjects = [{ _id: new Types.ObjectId(), title: "Project 1" }];

      mockModel.exec.mockResolvedValue(mockProjects);

      const result = await repository.findByBoardId(boardId);

      expect(result).toEqual(mockProjects);
    });
  });

  describe("findById", () => {
    it("should find a project by id", async () => {
      const projectId = new Types.ObjectId().toHexString();
      const mockProject = { _id: projectId, title: "Project 1" };

      mockModel.findById.mockReturnValue(mockProject);

      await repository.findById(projectId);

      expect(mockModel.findById).toHaveBeenCalledWith(projectId);
    });
  });

  describe("findByIdPopulated", () => {
    it("should find a project by id with populated fields", async () => {
      const projectId = new Types.ObjectId().toHexString();
      const mockProject = {
        _id: projectId,
        title: "Project 1",
        owner: { name: "Owner", email: "owner@test.com" }
      };

      mockModel.exec.mockResolvedValue(mockProject);

      const result = await repository.findByIdPopulated(projectId);

      expect(result).toEqual(mockProject);
    });
  });

  describe("create", () => {
    it("should create a project", async () => {
      const data = { title: "Test Project", board: new Types.ObjectId() };

      // Default implementation from beforeEach will handle this

      const result = await repository.create(data);

      expect(mockModel).toHaveBeenCalledWith(data);
      expect(result).toEqual(expect.objectContaining(data));
    });
  });

  describe("updateById", () => {
    it("should update a project by id", async () => {
      const projectId = new Types.ObjectId().toHexString();
      const updateData = { title: "Updated Project" };
      const mockProject = { _id: projectId, ...updateData };

      mockModel.exec.mockResolvedValue(mockProject);

      const result = await repository.updateById(projectId, updateData);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        projectId,
        { $set: updateData },
        { returnDocument: "after", runValidators: true }
      );
      expect(result).toEqual(mockProject);
    });
  });

  describe("deleteById", () => {
    it("should delete a project by id", async () => {
      const projectId = new Types.ObjectId().toHexString();

      mockModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await repository.deleteById(projectId);

      expect(mockModel.deleteOne).toHaveBeenCalledWith({ _id: projectId });
      expect(result).toEqual({ deletedCount: 1 });
    });
  });

  describe("deleteByBoardId", () => {
    it("should delete all projects by board id", async () => {
      const boardId = new Types.ObjectId().toHexString();

      mockModel.exec.mockResolvedValue({ deletedCount: 5 });

      const result = await repository.deleteByBoardId(boardId);

      expect(mockModel.deleteMany).toHaveBeenCalled();
      expect(result).toEqual({ deletedCount: 5 });
    });

    it("should return 0 if no projects deleted", async () => {
      const boardId = new Types.ObjectId().toHexString();

      mockModel.exec.mockResolvedValue({ deletedCount: 0 });

      const result = await repository.deleteByBoardId(boardId);

      expect(result).toEqual({ deletedCount: 0 });
    });
  });

  describe("getLastOrderInBoard", () => {
    it("should return next order when projects exist", async () => {
      const boardId = new Types.ObjectId().toHexString();

      mockModel.lean.mockResolvedValue({ orderInBoard: 5 });

      const result = await repository.getLastOrderInBoard(boardId);

      expect(result).toBe(6);
    });

    it("should return 0 when no projects exist", async () => {
      const boardId = new Types.ObjectId().toHexString();

      mockModel.lean.mockResolvedValue(null);

      const result = await repository.getLastOrderInBoard(boardId);

      expect(result).toBe(0);
    });
  });

  describe("decrementOrderAfter", () => {
    it("should decrement order for projects after deleted order", async () => {
      const boardId = new Types.ObjectId();
      const deletedOrder = 5;

      mockModel.exec.mockResolvedValue({ modifiedCount: 3 });

      await repository.decrementOrderAfter(boardId, deletedOrder);

      expect(mockModel.updateMany).toHaveBeenCalledWith(
        { board: boardId, orderInBoard: { $gt: deletedOrder } },
        { $inc: { orderInBoard: -1 } }
      );
    });
  });

  describe("addMember", () => {
    it("should add a member to a project", async () => {
      const projectId = new Types.ObjectId().toHexString();
      const userId = new Types.ObjectId();

      mockModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await repository.addMember(projectId, userId);

      expect(mockModel.updateOne).toHaveBeenCalledWith(
        { _id: projectId },
        { $addToSet: { members: userId } }
      );
    });
  });

  describe("isMember", () => {
    it("should return true when user is a member", async () => {
      const projectId = new Types.ObjectId().toHexString();
      const userId = new Types.ObjectId();

      mockModel.exists.mockResolvedValue({ _id: new Types.ObjectId() });

      const result = await repository.isMember(projectId, userId);

      expect(result).toBe(true);
    });

    it("should return false when user is not a member", async () => {
      const projectId = new Types.ObjectId().toHexString();
      const userId = new Types.ObjectId();

      mockModel.exists.mockResolvedValue(null);

      const result = await repository.isMember(projectId, userId);

      expect(result).toBe(false);
    });
  });
});
