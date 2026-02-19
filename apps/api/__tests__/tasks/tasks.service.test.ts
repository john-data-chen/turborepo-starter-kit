import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProjectsService } from "../../src/modules/projects/projects.service";
import { TaskRepository } from "../../src/modules/tasks/repositories/tasks.repository";
import { TasksService } from "../../src/modules/tasks/tasks.service";

describe("TasksService", () => {
  let service: TasksService;
  let taskRepository: Record<string, ReturnType<typeof vi.fn>>;
  let projectsService: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    taskRepository = {
      create: vi.fn(),
      findByQuery: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
      findByIdPopulated: vi.fn(),
      updateById: vi.fn(),
      deleteById: vi.fn().mockResolvedValue({ deletedCount: 1 }),
      deleteByProjectId: vi.fn().mockResolvedValue({ deletedCount: 1 }),
      decrementOrderAfter: vi.fn(),
      reorderOnMoveWithinProject: vi.fn(),
      incrementOrderFrom: vi.fn(),
      save: vi.fn()
    };

    projectsService = {
      addMemberIfNotExists: vi.fn()
    };

    service = new TasksService(
      taskRepository as unknown as TaskRepository,
      projectsService as unknown as ProjectsService
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a task", async () => {
      const createTaskDto = {
        title: "Test Task",
        project: "60f6e1b3b3f3b3b3b3f3b3b4",
        board: "60f6e1b3b3f3b3b3b3f3b3b5"
      };
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const savedTask = {
        _id: { toString: () => "t1" },
        title: "Test Task",
        status: "TODO",
        board: { toString: () => createTaskDto.board },
        project: { toString: () => createTaskDto.project },
        creator: { _id: userId, name: "Test", email: "test@test.com" },
        assignee: null,
        lastModifier: { _id: userId, name: "Test", email: "test@test.com" },
        createdAt: new Date(),
        updatedAt: new Date(),
        orderInProject: 0,
        populate: vi.fn().mockReturnThis()
      };
      taskRepository.create.mockResolvedValue(savedTask);

      const result = await service.create(createTaskDto as any, userId);

      expect(result).toBeDefined();
      expect(taskRepository.create).toHaveBeenCalled();
    });

    it("should create a task with an assignee", async () => {
      const createTaskDto = {
        title: "Test Task",
        project: "60f6e1b3b3f3b3b3b3f3b3b4",
        board: "60f6e1b3b3f3b3b3b3f3b3b5",
        assignee: "60f6e1b3b3f3b3b3b3f3b3b6"
      };
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const savedTask = {
        _id: { toString: () => "t1" },
        title: "Test Task",
        status: "TODO",
        board: { toString: () => createTaskDto.board },
        project: { toString: () => createTaskDto.project },
        creator: { _id: userId, name: "Test", email: "test@test.com" },
        assignee: { _id: createTaskDto.assignee, name: "Assignee", email: "a@test.com" },
        lastModifier: { _id: userId, name: "Test", email: "test@test.com" },
        createdAt: new Date(),
        updatedAt: new Date(),
        orderInProject: 0,
        populate: vi.fn().mockReturnThis()
      };
      taskRepository.create.mockResolvedValue(savedTask);

      const result = await service.create(createTaskDto as any, userId);

      expect(result).toBeDefined();
    });

    it("should throw an error if user id is not provided", async () => {
      const createTaskDto = {
        title: "Test Task",
        project: "60f6e1b3b3f3b3b3b3f3b3b4",
        board: "60f6e1b3b3f3b3b3b3f3b3b5"
      };
      await expect(service.create(createTaskDto as any, null as unknown as string)).rejects.toThrow(
        "User ID is required to create a task"
      );
    });

    it("should handle error when adding creator to project members fails", async () => {
      const createTaskDto = {
        title: "Test Task",
        project: "60f6e1b3b3f3b3b3b3f3b3b4",
        board: "60f6e1b3b3f3b3b3b3f3b3b5"
      };
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const savedTask = {
        _id: { toString: () => "t1" },
        title: "Test Task",
        populate: vi.fn().mockReturnThis()
      };
      taskRepository.create.mockResolvedValue(savedTask);
      projectsService.addMemberIfNotExists.mockRejectedValue(new Error("Failed to add member"));

      // Should not throw
      await service.create(createTaskDto as any, userId);

      expect(projectsService.addMemberIfNotExists).toHaveBeenCalled();
    });
  });

  describe("handleProjectDeleted", () => {
    it("should delete tasks by project id", async () => {
      await service.handleProjectDeleted({ projectId: "60f6e1b3b3f3b3b3b3f3b3b4" });

      expect(taskRepository.deleteByProjectId).toHaveBeenCalledWith("60f6e1b3b3f3b3b3b3f3b3b4");
    });
  });

  describe("findAll", () => {
    it("should find all tasks", async () => {
      await service.findAll();
      expect(taskRepository.findByQuery).toHaveBeenCalledWith({});
    });

    it("should find all tasks with projectId", async () => {
      const projectId = "60f6e1b3b3f3b3b3b3f3b3b4";
      await service.findAll(projectId);
      expect(taskRepository.findByQuery).toHaveBeenCalledWith({
        project: new Types.ObjectId(projectId)
      });
    });

    it("should find all tasks with assigneeId", async () => {
      const assigneeId = "60f6e1b3b3f3b3b3b3f3b3b3";
      await service.findAll(undefined, assigneeId);
      expect(taskRepository.findByQuery).toHaveBeenCalledWith({
        assignee: new Types.ObjectId(assigneeId)
      });
    });
  });

  describe("findOne", () => {
    it("should find a task by id", async () => {
      const taskId = "60f6e1b3b3f3b3b3b3f3b3b5";
      const task = {
        _id: { toString: () => taskId },
        title: "Test Task",
        status: "TODO",
        project: { toString: () => "p1" },
        board: { toString: () => "b1" },
        creator: { _id: "u1", name: "Test", email: "test@test.com" },
        assignee: null,
        lastModifier: { _id: "u1", name: "Test", email: "test@test.com" },
        createdAt: new Date(),
        updatedAt: new Date(),
        orderInProject: 0,
        populate: vi.fn().mockReturnThis()
      };
      taskRepository.findByIdPopulated.mockResolvedValue(task);

      await service.findOne(taskId);

      expect(taskRepository.findByIdPopulated).toHaveBeenCalledWith(taskId);
    });

    it("should throw not found exception when task is not found", async () => {
      taskRepository.findByIdPopulated.mockResolvedValue(null);
      await expect(service.findOne("60f6e1b3b3f3b3b3b3f3b3b5")).rejects.toThrow(
        "Task with ID 60f6e1b3b3f3b3b3b3f3b3b5 not found"
      );
    });
  });

  describe("update", () => {
    it("should update a task", async () => {
      const taskId = "60f6e1b3b3f3b3b3b3f3b3b5";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const updateTaskDto = { title: "Test Task Updated", orderInProject: 0 };
      const task = {
        _id: taskId,
        creator: new Types.ObjectId(userId),
        assignee: null
      };
      const updatedTask = {
        _id: { toString: () => taskId },
        title: "Test Task Updated",
        status: "TODO",
        project: { toString: () => "p1" },
        board: { toString: () => "b1" },
        creator: { _id: userId, name: "Test", email: "test@test.com" },
        assignee: null,
        lastModifier: { _id: userId, name: "Test", email: "test@test.com" },
        createdAt: new Date(),
        updatedAt: new Date(),
        orderInProject: 0,
        populate: vi.fn().mockReturnThis()
      };

      taskRepository.findById.mockResolvedValue(task);
      taskRepository.updateById.mockResolvedValue(updatedTask);

      await service.update(taskId, updateTaskDto, userId);

      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(taskRepository.updateById).toHaveBeenCalled();
    });

    it("should handle assigneeId in update", async () => {
      const taskId = "60f6e1b3b3f3b3b3b3f3b3b5";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const updateTaskDto: any = { assigneeId: "60f6e1b3b3f3b3b3b3f3b3b6" };
      const task = {
        _id: taskId,
        creator: new Types.ObjectId(userId),
        assignee: null
      };
      const updatedTask = {
        _id: { toString: () => taskId },
        populate: vi.fn().mockReturnThis()
      };

      taskRepository.findById.mockResolvedValue(task);
      taskRepository.updateById.mockResolvedValue(updatedTask);

      await service.update(taskId, updateTaskDto, userId);

      expect(taskRepository.updateById).toHaveBeenCalledWith(
        taskId,
        expect.objectContaining({ assignee: new Types.ObjectId("60f6e1b3b3f3b3b3b3f3b3b6") })
      );
    });

    it("should throw not found exception when updating a non-existing task", async () => {
      taskRepository.findById.mockResolvedValue(null);
      await expect(
        service.update("60f6e1b3b3f3b3b3b3f3b3b5", { title: "Updated" }, "60f6e1b3b3f3b3b3b3f3b3b3")
      ).rejects.toThrow("Task with ID 60f6e1b3b3f3b3b3b3f3b3b5 not found");
    });

    it("should throw forbidden exception when updating a task without permission", async () => {
      const task = {
        _id: "60f6e1b3b3f3b3b3b3f3b3b5",
        creator: new Types.ObjectId("60f6e1b3b3f3b3b3b3f3b3b4"),
        assignee: null
      };
      taskRepository.findById.mockResolvedValue(task);
      await expect(
        service.update("60f6e1b3b3f3b3b3b3f3b3b5", { title: "Updated" }, "60f6e1b3b3f3b3b3b3f3b3b3")
      ).rejects.toThrow("You do not have permission to modify this task");
    });

    it("should throw not found exception if task disappeared during update", async () => {
      const taskId = "60f6e1b3b3f3b3b3b3f3b3b5";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const updateTaskDto = { title: "Test Task Updated" };
      const task = {
        _id: taskId,
        creator: new Types.ObjectId(userId),
        assignee: null
      };

      taskRepository.findById.mockResolvedValue(task);
      taskRepository.updateById.mockResolvedValue(null);

      await expect(service.update(taskId, updateTaskDto, userId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("remove", () => {
    it("should remove a task", async () => {
      const taskId = "60f6e1b3b3f3b3b3b3f3b3b5";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const task = {
        _id: taskId,
        creator: new Types.ObjectId(userId),
        project: new Types.ObjectId("60f6e1b3b3f3b3b3b3f3b3b4"),
        orderInProject: 0
      };
      taskRepository.findById.mockResolvedValue(task);

      await service.remove(taskId, userId);

      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(taskRepository.deleteById).toHaveBeenCalledWith(taskId);
      expect(taskRepository.decrementOrderAfter).toHaveBeenCalled();
    });

    it("should throw not found exception when removing a non-existing task", async () => {
      taskRepository.findById.mockResolvedValue(null);
      await expect(
        service.remove("60f6e1b3b3f3b3b3b3f3b3b5", "60f6e1b3b3f3b3b3b3f3b3b3")
      ).rejects.toThrow("Task with ID 60f6e1b3b3f3b3b3b3f3b3b5 not found");
    });

    it("should throw forbidden exception when removing a task without being the creator", async () => {
      const task = {
        _id: "60f6e1b3b3f3b3b3b3f3b3b5",
        creator: new Types.ObjectId("60f6e1b3b3f3b3b3b3f3b3b4"),
        assignee: null
      };
      taskRepository.findById.mockResolvedValue(task);
      await expect(
        service.remove("60f6e1b3b3f3b3b3b3f3b3b5", "60f6e1b3b3f3b3b3b3f3b3b3")
      ).rejects.toThrow("Only the task creator can perform this action");
    });

    it("should throw not found exception if deleteById returns count 0", async () => {
      const taskId = "60f6e1b3b3f3b3b3b3f3b3b5";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const task = {
        _id: taskId,
        creator: new Types.ObjectId(userId),
        project: new Types.ObjectId("60f6e1b3b3f3b3b3b3f3b3b4"),
        orderInProject: 0
      };
      taskRepository.findById.mockResolvedValue(task);
      taskRepository.deleteById.mockResolvedValue({ deletedCount: 0 });

      await expect(service.remove(taskId, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe("moveTask", () => {
    it("should move task within same project", async () => {
      const taskId = "60f6e1b3b3f3b3b3b3f3b3b5";
      const projectId = "60f6e1b3b3f3b3b3b3f3b3b4";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const task = {
        _id: taskId,
        project: new Types.ObjectId(projectId),
        orderInProject: 0,
        creator: new Types.ObjectId(userId),
        assignee: null
      };
      const updatedTask = {
        _id: { toString: () => taskId },
        populate: vi.fn().mockReturnThis()
      };

      taskRepository.findById.mockResolvedValue(task);
      taskRepository.findByIdPopulated.mockResolvedValue(updatedTask);

      await service.moveTask(taskId, projectId, 1, userId);

      expect(taskRepository.save).toHaveBeenCalled();
      expect(taskRepository.reorderOnMoveWithinProject).toHaveBeenCalled();
    });

    it("should move task to different project", async () => {
      const taskId = "60f6e1b3b3f3b3b3b3f3b3b5";
      const oldProjectId = "60f6e1b3b3f3b3b3b3f3b3b4";
      const newProjectId = "60f6e1b3b3f3b3b3b3f3b3b9";
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      const task = {
        _id: taskId,
        project: new Types.ObjectId(oldProjectId),
        orderInProject: 0,
        creator: new Types.ObjectId(userId),
        assignee: null
      };
      const updatedTask = {
        _id: { toString: () => taskId },
        populate: vi.fn().mockReturnThis()
      };

      taskRepository.findById.mockResolvedValue(task);
      taskRepository.findByIdPopulated.mockResolvedValue(updatedTask);

      await service.moveTask(taskId, newProjectId, 1, userId);

      expect(taskRepository.save).toHaveBeenCalled();
      expect(taskRepository.decrementOrderAfter).toHaveBeenCalled();
      expect(taskRepository.incrementOrderFrom).toHaveBeenCalled();
    });

    it("should validate IDs", async () => {
      const userId = "60f6e1b3b3f3b3b3b3f3b3b3";
      // Mock findById to ensure checkTaskPermission passes
      taskRepository.findById.mockResolvedValue({
        _id: "invalid",
        creator: new Types.ObjectId(userId),
        project: new Types.ObjectId()
      });

      await expect(service.moveTask("invalid", "valid", 0, userId)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("toUserResponse", () => {
    it("should return null if user is null", () => {
      const result = (service as any).toUserResponse(null);
      expect(result).toBeNull();
    });
  });

  describe("toTaskResponse", () => {
    it("should handle population error", async () => {
      const task = {
        _id: { toString: () => "1" },
        populate: vi.fn().mockRejectedValue(new Error("Populate error"))
      };
      await expect((service as any).toTaskResponse(task)).rejects.toThrow("Populate error");
    });

    it("should handle missing lastModifier", async () => {
      const task = {
        _id: { toString: () => "1" },
        creator: { _id: "2" },
        populate: vi.fn().mockReturnThis()
      };
      const result = await (service as any).toTaskResponse(task);
      expect(result.lastModifier).toEqual(result.creator);
    });
  });
});
