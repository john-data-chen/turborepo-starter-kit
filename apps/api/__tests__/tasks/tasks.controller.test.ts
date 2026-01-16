import { beforeEach, describe, expect, it, vi } from "vitest";

import { TasksController } from "../../src/modules/tasks/tasks.controller";

describe("TasksController", () => {
  let controller: TasksController;
  let service: {
    create: vi.Mock;
    findAll: vi.Mock;
    findOne: vi.Mock;
    update: vi.Mock;
    remove: vi.Mock;
    moveTask: vi.Mock;
  };

  beforeEach(() => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      moveTask: vi.fn()
    };

    // Manually instantiate TasksController with the mock TasksService
    controller = new TasksController(service as any);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a task", async () => {
      const createTaskDto = { title: "Test Task", projectId: "1" };
      const req = { user: { _id: "1" } };
      const result = { ...createTaskDto, _id: "1", createdBy: "1" };

      vi.spyOn(service, "create").mockResolvedValue(result as any);

      expect(await controller.create(createTaskDto, req as any)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(createTaskDto, "1");
    });
  });

  describe("findAll", () => {
    it("should find all tasks", async () => {
      const result = [];

      vi.spyOn(service, "findAll").mockResolvedValue(result as any);

      expect(await controller.findAll()).toEqual(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should find a task by id", async () => {
      const result = { _id: "1", title: "Test Task" };

      vi.spyOn(service, "findOne").mockResolvedValue(result as any);

      expect(await controller.findOne("1")).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith("1");
    });
  });

  describe("update", () => {
    it("should update a task", async () => {
      const updateTaskDto = { title: "Test Task Updated" };
      const req = { user: { _id: "1" } };
      const result = { _id: "1", title: "Test Task Updated" };

      vi.spyOn(service, "update").mockResolvedValue(result as any);

      expect(await controller.update("1", updateTaskDto, req)).toEqual(result);
      expect(service.update).toHaveBeenCalledWith("1", updateTaskDto, "1");
    });
  });

  describe("remove", () => {
    it("should remove a task", async () => {
      const req = { user: { _id: "1" } };

      vi.spyOn(service, "remove").mockResolvedValue(undefined);

      await controller.remove("1", req);
      expect(service.remove).toHaveBeenCalledWith("1", "1");
    });
  });

  describe("moveTask", () => {
    it("should move a task", async () => {
      const moveData = { projectId: "2", orderInProject: 1 };
      const req = { user: { _id: "1" } };
      const result = { _id: "1", title: "Test Task", projectId: "2" };

      vi.spyOn(service, "moveTask").mockResolvedValue(result as any);

      expect(await controller.moveTask("1", moveData, req)).toEqual(result);
      expect(service.moveTask).toHaveBeenCalledWith("1", "2", 1, "1");
    });
  });
});
