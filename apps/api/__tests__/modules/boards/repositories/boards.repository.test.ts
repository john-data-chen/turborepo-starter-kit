import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BoardRepository } from "../../../../src/modules/boards/repositories/boards.repository";

describe("BoardRepository", () => {
  let repository: BoardRepository;
  let mockModel: any;

  beforeEach(() => {
    // Correctly define MockModel as a function that mimics a constructor
    const MockModel = vi.fn().mockImplementation(function (data) {
      return {
        ...data,
        save: vi.fn().mockResolvedValue(data)
      };
    }) as any;

    MockModel.aggregate = vi.fn().mockResolvedValue([]);
    MockModel.findById = vi.fn().mockReturnThis();
    MockModel.findByIdAndUpdate = vi.fn().mockReturnThis();
    MockModel.deleteOne = vi.fn().mockReturnThis();
    MockModel.findOneAndUpdate = vi.fn().mockReturnThis();
    MockModel.exec = vi.fn();

    mockModel = MockModel;
    repository = new BoardRepository(mockModel);
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  describe("create", () => {
    it("should create a board", async () => {
      const data = {
        title: "Test Board",
        description: "Test Description",
        owner: new Types.ObjectId(),
        members: [new Types.ObjectId()]
      };

      // Default implementation handles creation

      const result = await repository.create(data);

      expect(mockModel).toHaveBeenCalledWith(data);
      expect(result).toEqual(expect.objectContaining(data));
    });
  });

  describe("findByOwner", () => {
    it("should find boards by owner", async () => {
      const userId = new Types.ObjectId();
      const mockBoards = [{ _id: new Types.ObjectId(), title: "Board 1" }];

      mockModel.aggregate.mockResolvedValue(mockBoards);

      const result = await repository.findByOwner(userId);

      expect(result).toEqual(mockBoards);
    });
  });

  describe("findByMemberNotOwner", () => {
    it("should find boards where user is member but not owner", async () => {
      const userId = new Types.ObjectId();
      const mockBoards = [{ _id: new Types.ObjectId(), title: "Board 1" }];

      mockModel.aggregate.mockResolvedValue(mockBoards);

      const result = await repository.findByMemberNotOwner(userId);

      expect(result).toEqual(mockBoards);
    });
  });

  describe("findOneWithAccess", () => {
    it("should find a board with access check", async () => {
      const boardId = new Types.ObjectId();
      const userId = new Types.ObjectId();
      const mockBoard = { _id: boardId, title: "Board 1" };

      mockModel.aggregate.mockResolvedValue([mockBoard]);

      const result = await repository.findOneWithAccess(boardId, userId);

      expect(result).toEqual(mockBoard);
    });

    it("should return null if board not found", async () => {
      const boardId = new Types.ObjectId();
      const userId = new Types.ObjectId();

      mockModel.aggregate.mockResolvedValue([]);

      const result = await repository.findOneWithAccess(boardId, userId);

      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should find a board by id", async () => {
      const boardId = new Types.ObjectId().toHexString();
      const mockBoard = { _id: boardId, title: "Board 1" };

      mockModel.exec.mockResolvedValue(mockBoard);

      const result = await repository.findById(boardId);

      expect(mockModel.findById).toHaveBeenCalledWith(boardId);
      expect(result).toEqual(mockBoard);
    });
  });

  describe("updateById", () => {
    it("should update a board by id", async () => {
      const boardId = new Types.ObjectId().toHexString();
      const updateData = { title: "Updated Board" };
      const mockBoard = { _id: boardId, ...updateData };

      mockModel.exec.mockResolvedValue(mockBoard);

      const result = await repository.updateById(boardId, updateData);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        boardId,
        { $set: updateData },
        { returnDocument: "after" }
      );
      expect(result).toEqual(mockBoard);
    });
  });

  describe("deleteById", () => {
    it("should delete a board by id", async () => {
      const boardId = new Types.ObjectId().toHexString();

      mockModel.deleteOne.mockReturnValue({ exec: vi.fn().mockResolvedValue({ deletedCount: 1 }) });

      const result = await repository.deleteById(boardId);

      expect(mockModel.deleteOne).toHaveBeenCalledWith({ _id: boardId });
      expect(result).toEqual({ deletedCount: 1 });
    });
  });

  describe("addMember", () => {
    it("should add a member to a board", async () => {
      const boardId = new Types.ObjectId();
      const ownerId = new Types.ObjectId();
      const memberId = new Types.ObjectId();
      const mockBoard = { _id: boardId.toHexString(), members: [memberId.toHexString()] };

      mockModel.findOneAndUpdate.mockReturnValue({ exec: vi.fn().mockResolvedValue(mockBoard) });

      const result = await repository.addMember(
        boardId.toHexString(),
        ownerId.toHexString(),
        memberId.toHexString()
      );

      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: new Types.ObjectId(boardId), owner: new Types.ObjectId(ownerId) },
        { $addToSet: { members: new Types.ObjectId(memberId) } },
        { returnDocument: "after" }
      );
      expect(result).toEqual(mockBoard);
    });
  });

  describe("removeMember", () => {
    it("should remove a member from a board", async () => {
      const boardId = new Types.ObjectId();
      const ownerId = new Types.ObjectId();
      const memberId = new Types.ObjectId();
      const mockBoard = { _id: boardId.toHexString(), members: [] };

      mockModel.findOneAndUpdate.mockReturnValue({ exec: vi.fn().mockResolvedValue(mockBoard) });

      const result = await repository.removeMember(
        boardId.toHexString(),
        ownerId.toHexString(),
        memberId.toHexString()
      );

      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: new Types.ObjectId(boardId), owner: new Types.ObjectId(ownerId) },
        { $pull: { members: new Types.ObjectId(memberId) } },
        { returnDocument: "after" }
      );
      expect(result).toEqual(mockBoard);
    });
  });
});
