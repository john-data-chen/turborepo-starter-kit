import { describe, expect, it } from "vitest";

import { Task, TaskSchema, TaskStatus } from "../../../../src/modules/tasks/schemas/tasks.schema";

describe("TaskSchema", () => {
  it("should be defined", () => {
    expect(TaskSchema).toBeDefined();
  });

  it("should have correct TaskStatus enum values", () => {
    expect(TaskStatus.TODO).toBe("TODO");
    expect(TaskStatus.IN_PROGRESS).toBe("IN_PROGRESS");
    expect(TaskStatus.DONE).toBe("DONE");
  });

  it("should have all TaskStatus enum values", () => {
    const values = Object.values(TaskStatus);
    expect(values).toContain("TODO");
    expect(values).toContain("IN_PROGRESS");
    expect(values).toContain("DONE");
    expect(values.length).toBe(3);
  });

  it("should have timestamps option enabled", () => {
    expect(TaskSchema.options.timestamps).toBe(true);
  });

  it("should have required fields defined", () => {
    const paths = TaskSchema.paths;
    expect(paths.title).toBeDefined();
    expect(paths.title.options.required).toBe(true);
    expect(paths.creator).toBeDefined();
    expect(paths.creator.options.required).toBe(true);
    expect(paths.lastModifier).toBeDefined();
    expect(paths.lastModifier.options.required).toBe(true);
    expect(paths.board).toBeDefined();
    expect(paths.board.options.required).toBe(true);
    expect(paths.project).toBeDefined();
    expect(paths.project.options.required).toBe(true);
  });

  it("should have optional fields defined", () => {
    const paths = TaskSchema.paths;
    expect(paths.description).toBeDefined();
    expect(paths.description.options.required).not.toBe(true);
    expect(paths.dueDate).toBeDefined();
    expect(paths.dueDate.options.required).not.toBe(true);
    expect(paths.assignee).toBeDefined();
    expect(paths.assignee.options.required).not.toBe(true);
  });

  it("should have status field with enum and default value", () => {
    const statusPath = TaskSchema.paths.status;
    expect(statusPath).toBeDefined();
    expect(Object.values(statusPath.options.enum)).toContain("TODO");
    expect(Object.values(statusPath.options.enum)).toContain("IN_PROGRESS");
    expect(Object.values(statusPath.options.enum)).toContain("DONE");
    expect(statusPath.options.default).toBe(TaskStatus.TODO);
  });

  it("should have orderInProject with default value", () => {
    const orderPath = TaskSchema.paths.orderInProject;
    expect(orderPath).toBeDefined();
    expect(orderPath.options.default).toBe(0);
  });

  it("should have createdAt and updatedAt fields", () => {
    const paths = TaskSchema.paths;
    expect(paths.createdAt).toBeDefined();
    expect(paths.updatedAt).toBeDefined();
  });

  it("should have reference fields", () => {
    const paths = TaskSchema.paths;
    expect(paths.creator.options.ref).toBe("User");
    expect(paths.assignee.options.ref).toBe("User");
    expect(paths.lastModifier.options.ref).toBe("User");
    expect(paths.board.options.ref).toBe("Board");
    expect(paths.project.options.ref).toBe("Project");
  });

  it("should create Task class instance", () => {
    const task = new Task();
    expect(task).toBeDefined();
    expect(task).toBeInstanceOf(Task);
  });
});
