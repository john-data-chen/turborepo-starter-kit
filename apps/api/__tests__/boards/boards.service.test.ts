import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BoardService } from "../../src/modules/boards/boards.service";
import { BoardRepository } from "../../src/modules/boards/repositories/boards.repository";

describe("BoardService", () => {
  let service: BoardService;
  let boardRepository: Record<string, ReturnType<typeof vi.fn>>;
  let eventEmitter: { emit: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    boardRepository = {
      create: vi.fn(),
      findByOwner: vi.fn().mockResolvedValue([]),
      findByMemberNotOwner: vi.fn().mockResolvedValue([]),
      findOneWithAccess: vi.fn(),
      findById: vi.fn(),
      updateById: vi.fn(),
      deleteById: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn()
    };

    eventEmitter = {
      emit: vi.fn()
    };

    service = new BoardService(boardRepository as unknown as BoardRepository, eventEmitter as any);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a board", async () => {
      const createBoardDto = { title: "Test Board", owner: "60f6e1b3b3f3b3b3b3f3b3b3" };
      const expectedBoard = {
        title: "Test Board",
        owner: new Types.ObjectId("60f6e1b3b3f3b3b3b3f3b3b3"),
        members: [new Types.ObjectId("60f6e1b3b3f3b3b3b3f3b3b3")]
      };
      boardRepository.create.mockResolvedValue(expectedBoard);

      const result = await service.create(createBoardDto as any);

      expect(result).toEqual(expectedBoard);
      expect(boardRepository.create).toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should find all boards for a user", async () => {
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";

      await service.findAll(userId);

      expect(boardRepository.findByOwner).toHaveBeenCalled();
      expect(boardRepository.findByMemberNotOwner).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should find a board by id", async () => {
      const boardId = "60f6e1b3b3f3b3b3b3f3b3b4";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      boardRepository.findOneWithAccess.mockResolvedValue({});

      await service.findOne(boardId, userId);

      expect(boardRepository.findOneWithAccess).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update a board", async () => {
      const boardId = "60f6e1b3b3f3b3b3b3f3b3b4";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const updateBoardDto = { title: "Test Board Updated" };
      const board = { _id: boardId, owner: { toString: () => userId }, members: [] };

      boardRepository.findById.mockResolvedValue(board);
      boardRepository.updateById.mockResolvedValue(board);
      boardRepository.findOneWithAccess.mockResolvedValue(board);

      await service.update(boardId, updateBoardDto, userId);

      expect(boardRepository.findById).toHaveBeenCalledWith(boardId);
      expect(boardRepository.updateById).toHaveBeenCalledWith(boardId, updateBoardDto);
    });
  });

  describe("remove", () => {
    it("should remove a board and emit event", async () => {
      const boardId = "60f6e1b3b3f3b3b3b3f3b3b4";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const board = { _id: boardId, owner: { toString: () => userId }, members: [] };

      boardRepository.findById.mockResolvedValue(board);
      boardRepository.deleteById.mockResolvedValue({ deletedCount: 1 });

      await service.remove(boardId, userId);

      expect(boardRepository.findById).toHaveBeenCalledWith(boardId);
      expect(eventEmitter.emit).toHaveBeenCalledWith("board.deleted", expect.any(Object));
      expect(boardRepository.deleteById).toHaveBeenCalledWith(boardId);
    });
  });

  describe("addMember", () => {
    it("should add a member to a board", async () => {
      const boardId = "60f6e1b3b3f3b3b3b3f3b3b4";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const memberId = "60f6e1b3b3f3b3b3b3f3b3b5";

      boardRepository.addMember.mockResolvedValue({});

      await service.addMember(boardId, userId, memberId);

      expect(boardRepository.addMember).toHaveBeenCalledWith(boardId, userId, memberId);
    });
  });

  describe("removeMember", () => {
    it("should remove a member from a board", async () => {
      const boardId = "60f6e1b3b3f3b3b3b3f3b3b4";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const memberId = "60f6e1b3b3f3b3b3b3f3b3b5";

      boardRepository.removeMember.mockResolvedValue({});

      await service.removeMember(boardId, userId, memberId);

      expect(boardRepository.removeMember).toHaveBeenCalledWith(boardId, userId, memberId);
    });
  });
});
