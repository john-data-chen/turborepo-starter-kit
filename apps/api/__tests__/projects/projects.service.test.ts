import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BoardService } from "../../src/modules/boards/boards.service";
import { ProjectsService } from "../../src/modules/projects/projects.service";
import { ProjectRepository } from "../../src/modules/projects/repositories/projects.repository";

describe("ProjectsService", () => {
  let service: ProjectsService;
  let projectRepository: Record<string, ReturnType<typeof vi.fn>>;
  let boardService: Record<string, ReturnType<typeof vi.fn>>;
  let eventEmitter: { emit: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    projectRepository = {
      findByBoardId: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
      findByIdPopulated: vi.fn(),
      create: vi.fn(),
      updateById: vi.fn(),
      deleteById: vi.fn().mockResolvedValue({ deletedCount: 1 }),
      deleteByBoardId: vi.fn().mockResolvedValue({ deletedCount: 1 }),
      getLastOrderInBoard: vi.fn().mockResolvedValue(0),
      decrementOrderAfter: vi.fn(),
      addMember: vi.fn(),
      isMember: vi.fn().mockResolvedValue(false)
    };

    boardService = {
      findOne: vi.fn()
    };

    eventEmitter = {
      emit: vi.fn()
    };

    service = new ProjectsService(
      projectRepository as unknown as ProjectRepository,
      boardService as unknown as BoardService,
      eventEmitter as any
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a project", async () => {
      const createProjectDto = {
        title: "Test Project",
        owner: "60f6e1b3b3f3b3b3b3f3b3b3",
        boardId: "60f6e1b3b3f3b3b3b3f3b3b4"
      };
      const savedProject = { _id: new Types.ObjectId(), ...createProjectDto };
      projectRepository.create.mockResolvedValue(savedProject);
      projectRepository.findByIdPopulated.mockResolvedValue(savedProject);

      const result = await service.create(createProjectDto as any);

      expect(result).toBeDefined();
      expect(projectRepository.create).toHaveBeenCalled();
    });

    it("should throw bad request for invalid board id", async () => {
      const createProjectDto = { boardId: "invalid-id", owner: "60f6e1b3b3f3b3b3b3f3b3b3" };
      await expect(service.create(createProjectDto as any)).rejects.toThrow("Invalid board ID");
    });

    it("should throw bad request for invalid owner", async () => {
      const createProjectDto = { boardId: "60f6e1b3b3f3b3b3b3f3b3b4", owner: "invalid-id" };
      await expect(service.create(createProjectDto as any)).rejects.toThrow("Invalid owner ID");
    });
  });

  describe("handleBoardDeleted", () => {
    it("should delete all projects and emit project.deleted for each", async () => {
      const projects = [{ _id: { toString: () => "p1" } }, { _id: { toString: () => "p2" } }];
      projectRepository.findByBoardId.mockResolvedValue(projects);

      await service.handleBoardDeleted({ boardId: "60f6e1b3b3f3b3b3b3f3b3b4", userId: "u1" });

      expect(eventEmitter.emit).toHaveBeenCalledTimes(2);
      expect(projectRepository.deleteByBoardId).toHaveBeenCalledWith("60f6e1b3b3f3b3b3b3f3b3b4");
    });
  });

  describe("findByBoardId", () => {
    it("should find projects by board id", async () => {
      const boardId = "60f6e1b3b3f3b3b3b3f3b3b4";
      await service.findByBoardId(boardId);
      expect(projectRepository.findByBoardId).toHaveBeenCalledWith(boardId);
    });

    it("should throw not found exception for invalid board id", async () => {
      await expect(service.findByBoardId("invalid-id")).rejects.toThrow("Invalid board ID");
    });
  });

  describe("update", () => {
    it("should update a project", async () => {
      const projectId = "60f6e1b3b3f3b3b3b3f3b3b5";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const updateProjectDto = { title: "Test Project Updated" };
      const project = { _id: projectId, owner: { toString: () => userId }, board: "b1" };

      projectRepository.findById.mockResolvedValue(project);
      projectRepository.updateById.mockResolvedValue(project);

      await service.update(projectId, updateProjectDto as any, userId);

      expect(projectRepository.findById).toHaveBeenCalledWith(projectId);
      expect(projectRepository.updateById).toHaveBeenCalled();
    });

    it("should throw bad request for invalid project id", async () => {
      await expect(
        service.update("invalid-id", {} as any, "60f6e1b3b3f3b3b3b3f3b3b3")
      ).rejects.toThrow("Invalid project ID");
    });

    it("should throw bad request for invalid user id", async () => {
      await expect(
        service.update("60f6e1b3b3f3b3b3b3f3b3b5", {} as any, "invalid-id")
      ).rejects.toThrow("Invalid user ID");
    });

    it("should throw not found for non-existing project", async () => {
      projectRepository.findById.mockResolvedValue(null);
      await expect(
        service.update("60f6e1b3b3f3b3b3b3f3b3b5", {} as any, "60f6e1b3b3f3b3b3b3f3b3b3")
      ).rejects.toThrow("Project not found");
    });

    it("should throw bad request if user is not owner and updates more than orderInBoard", async () => {
      const project = {
        _id: "60f6e1b3b3f3b3b3b3f3b3b5",
        owner: { toString: () => "60f6e1b3b3f3b3b3b3f3b3b3" },
        board: "60f6e1b3b3f3b3b3b3f3b3b4"
      };
      projectRepository.findById.mockResolvedValue(project);

      await expect(
        service.update(
          "60f6e1b3b3f3b3b3b3f3b3b5",
          { title: "Updated" } as any,
          "60f6e1b3b3f3b3b3b3f3b3b6"
        )
      ).rejects.toThrow("You do not have permission to update this project");
    });
  });

  describe("remove", () => {
    it("should remove a project and emit event", async () => {
      const projectId = "60f6e1b3b3f3b3b3b3f3b3b5";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const project = {
        _id: projectId,
        owner: { toString: () => userId },
        board: new Types.ObjectId("60f6e1b3b3f3b3b3b3f3b3b4"),
        orderInBoard: 0
      };
      projectRepository.findById.mockResolvedValue(project);

      await service.remove(projectId, userId);

      expect(eventEmitter.emit).toHaveBeenCalledWith("project.deleted", expect.any(Object));
      expect(projectRepository.deleteById).toHaveBeenCalledWith(projectId);
      expect(projectRepository.decrementOrderAfter).toHaveBeenCalled();
    });

    it("should throw bad request for invalid project id", async () => {
      await expect(service.remove("invalid-id", "60f6e1b3b3f3b3b3b3f3b3b3")).rejects.toThrow(
        "Invalid project ID"
      );
    });

    it("should throw bad request for invalid user id", async () => {
      await expect(service.remove("60f6e1b3b3f3b3b3b3f3b3b5", "invalid-id")).rejects.toThrow(
        "Invalid user ID"
      );
    });

    it("should throw not found for non-existing project", async () => {
      projectRepository.findById.mockResolvedValue(null);
      await expect(
        service.remove("60f6e1b3b3f3b3b3b3f3b3b5", "60f6e1b3b3f3b3b3b3f3b3b3")
      ).rejects.toThrow("Project not found");
    });

    it("should throw bad request if user is not owner", async () => {
      const project = {
        _id: "60f6e1b3b3f3b3b3b3f3b3b5",
        owner: { toString: () => "60f6e1b3b3f3b3b3b3f3b3b3" }
      };
      projectRepository.findById.mockResolvedValue(project);
      await expect(
        service.remove("60f6e1b3b3f3b3b3b3f3b3b5", "60f6e1b3b3f3b3b3b3f3b3b6")
      ).rejects.toThrow("You do not have permission to delete this project");
    });
  });

  describe("addMemberIfNotExists", () => {
    it("should add a member to a project if not exists", async () => {
      const projectId = "60f6e1b3b3f3b3b3b3f3b3b5";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      projectRepository.isMember.mockResolvedValue(false);

      await service.addMemberIfNotExists(projectId, userId);

      expect(projectRepository.addMember).toHaveBeenCalledWith(
        projectId,
        new Types.ObjectId(userId)
      );
    });

    it("should not add member if user is already a member", async () => {
      const projectId = "60f6e1b3b3f3b3b3b3f3b3b5";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      projectRepository.isMember.mockResolvedValue(true);

      await service.addMemberIfNotExists(projectId, userId);

      expect(projectRepository.addMember).not.toHaveBeenCalled();
    });
  });
});
