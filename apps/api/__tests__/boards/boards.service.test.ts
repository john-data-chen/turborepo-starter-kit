import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BoardService } from "../../src/modules/boards/boards.service";
import { Board } from "../../src/modules/boards/schemas/boards.schema";
import { ProjectsService } from "../../src/modules/projects/projects.service";
import { TasksService } from "../../src/modules/tasks/tasks.service";

// Define a mock constructor for the BoardModel
class MockBoardModel {
  constructor(data: any) {
    return {
      ...data,
      save: vi.fn().mockResolvedValue(data),
      populate: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue(data)
    };
  }

  static find = vi.fn().mockReturnThis();
  static findOne = vi.fn().mockReturnThis();
  static findById = vi.fn().mockReturnThis();
  static create = vi.fn();
  static findByIdAndUpdate = vi.fn().mockReturnThis();
  static deleteOne = vi.fn().mockReturnThis();
  static findOneAndUpdate = vi.fn().mockReturnThis();
  static aggregate = vi.fn().mockReturnThis();
}

describe("BoardService", () => {
  let service: BoardService;
  let boardModel: Model<Board>;
  let projectsService: ProjectsService;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: getModelToken(Board.name),
          useValue: MockBoardModel
        },
        {
          provide: ProjectsService,
          useValue: {
            findByBoardId: vi.fn().mockResolvedValue([]),
            deleteByBoardId: vi.fn().mockResolvedValue({ deletedCount: 1 }) // Mock deletedCount
          }
        },
        {
          provide: TasksService,
          useValue: {
            deleteTasksByProjectId: vi.fn()
          }
        }
      ]
    }).compile();

    service = testingModule.get<BoardService>(BoardService);
    boardModel = testingModule.get<typeof MockBoardModel & Model<Board>>(getModelToken(Board.name));
    projectsService = testingModule.get<ProjectsService>(ProjectsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a board", async () => {
      const createBoardDto = { title: "Test Board", owner: "60f6e1b3b3f3b3b3b3f3b3b3" };
      const expectedResult = {
        title: "Test Board",
        owner: "60f6e1b3b3f3b3b3b3f3b3b3",
        members: ["60f6e1b3b3f3b3b3b3f3b3b3"]
      };

      const result = await service.create(createBoardDto as any);

      // Only check the relevant fields since the result includes additional fields
      expect(result.title).toBe(expectedResult.title);
      expect(result.owner.toString()).toBe(expectedResult.owner);
      expect(result.members.map((id) => id.toString())).toEqual(expectedResult.members);
    });
  });

  describe("findAll", () => {
    it("should find all boards for a user", async () => {
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      (boardModel.aggregate as any).mockReturnValue({ exec: vi.fn().mockResolvedValue([]) });

      await service.findAll(userId);

      expect(boardModel.aggregate).toHaveBeenCalledTimes(2);
    });
  });

  describe("findOne", () => {
    it("should find a board by id", async () => {
      const boardId = "60f6e1b3b3f3b3b3b3f3b3b4";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      (boardModel.aggregate as any).mockResolvedValue([{}]);

      await service.findOne(boardId, userId);

      expect(boardModel.aggregate).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update a board", async () => {
      const boardId = "60f6e1b3b3f3b3b3b3f3b3b4";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const updateBoardDto = { title: "Test Board Updated" };
      const board = { _id: boardId, owner: userId, members: [], save: vi.fn() };

      (boardModel.findById as any).mockReturnValue({ exec: vi.fn().mockResolvedValue(board) });
      (boardModel.findByIdAndUpdate as any).mockReturnValue({
        exec: vi.fn().mockResolvedValue(board)
      });

      await service.update(boardId, updateBoardDto, userId);

      expect(boardModel.findById).toHaveBeenCalledWith(boardId);
      expect(boardModel.findByIdAndUpdate).toHaveBeenCalledWith(
        boardId,
        { $set: updateBoardDto },
        { new: true }
      );
    });
  });

  describe("remove", () => {
    it("should remove a board", async () => {
      const boardId = "60f6e1b3b3f3b3b3b3f3b3b4";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const board = {
        _id: boardId,
        owner: { toString: () => userId },
        members: []
      };

      (boardModel.findById as any).mockReturnValue({ exec: vi.fn().mockResolvedValue(board) });
      (boardModel.deleteOne as any).mockReturnValue({
        exec: vi.fn().mockResolvedValue({ deletedCount: 1 })
      });
      (projectsService.deleteByBoardId as any).mockResolvedValue({ deletedCount: 0 });

      await service.remove(boardId, userId);

      expect(boardModel.findById).toHaveBeenCalledWith(boardId);
      expect(boardModel.deleteOne).toHaveBeenCalledWith({ _id: boardId });
    });
  });

  describe("addMember", () => {
    it("should add a member to a board", async () => {
      const boardId = "60f6e1b3b3f3b3b3b3f3b3b4";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const memberId = "60f6e1b3b3f3b3b3b3f3b3b5";

      (boardModel.findOneAndUpdate as any).mockReturnValue({ exec: vi.fn().mockResolvedValue({}) });

      await service.addMember(boardId, userId, memberId);

      expect(boardModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: boardId, owner: userId },
        { $addToSet: { members: memberId } },
        { new: true }
      );
    });
  });

  describe("removeMember", () => {
    it("should remove a member from a board", async () => {
      const boardId = "60f6e1b3b3f3b3b3b3f3b3b4";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const memberId = "60f6e1b3b3f3b3b3b3f3b3b5";

      (boardModel.findOneAndUpdate as any).mockReturnValue({ exec: vi.fn().mockResolvedValue({}) });

      await service.removeMember(boardId, userId, memberId);

      expect(boardModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: boardId, owner: userId },
        { $pull: { members: memberId } },
        { new: true }
      );
    });
  });
});
