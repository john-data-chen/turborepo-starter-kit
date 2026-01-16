import { validate } from "class-validator";

import { CreateTaskDto, TaskStatus } from "../../../../src/modules/tasks/dto/create-task.dto";

describe("CreateTaskDto", () => {
  it("should be valid with correct data", async () => {
    const dto = new CreateTaskDto();
    dto.title = "Test Task";
    dto.board = "60f6e1b3b3f3b3b3b3f3b3b4";
    dto.project = "60f6e1b3b3f3b3b3b3f3b3b5";
    dto.creator = "60f6e1b3b3f3b3b3b3f3b3b3";
    dto.lastModifier = "60f6e1b3b3f3b3b3b3f3b3b3";
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should be invalid if title is missing", async () => {
    const dto = new CreateTaskDto();
    dto.board = "60f6e1b3b3f3b3b3b3f3b3b4";
    dto.project = "60f6e1b3b3f3b3b3b3f3b3b5";
    dto.creator = "60f6e1b3b3f3b3b3b3f3b3b3";
    dto.lastModifier = "60f6e1b3b3f3b3b3b3f3b3b3";
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should be invalid if board is missing", async () => {
    const dto = new CreateTaskDto();
    dto.title = "Test Task";
    dto.project = "60f6e1b3b3f3b3b3b3f3b3b5";
    dto.creator = "60f6e1b3b3f3b3b3b3f3b3b3";
    dto.lastModifier = "60f6e1b3b3f3b3b3b3f3b3b3";
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should be invalid if project is missing", async () => {
    const dto = new CreateTaskDto();
    dto.title = "Test Task";
    dto.board = "60f6e1b3b3f3b3b3b3f3b3b4";
    dto.creator = "60f6e1b3b3f3b3b3b3f3b3b3";
    dto.lastModifier = "60f6e1b3b3f3b3b3b3f3b3b3";
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should be invalid if creator is missing", async () => {
    const dto = new CreateTaskDto();
    dto.title = "Test Task";
    dto.board = "60f6e1b3b3f3b3b3b3f3b3b4";
    dto.project = "60f6e1b3b3f3b3b3b3f3b3b5";
    dto.lastModifier = "60f6e1b3b3f3b3b3b3f3b3b3";
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should be invalid if lastModifier is missing", async () => {
    const dto = new CreateTaskDto();
    dto.title = "Test Task";
    dto.board = "60f6e1b3b3f3b3b3b3f3b3b4";
    dto.project = "60f6e1b3b3f3b3b3b3f3b3b5";
    dto.creator = "60f6e1b3b3f3b3b3b3f3b3b3";
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should be valid with optional fields", async () => {
    const dto = new CreateTaskDto();
    dto.title = "Test Task";
    dto.board = "60f6e1b3b3f3b3b3b3f3b3b4";
    dto.project = "60f6e1b3b3f3b3b3b3f3b3b5";
    dto.creator = "60f6e1b3b3f3b3b3b3f3b3b3";
    dto.lastModifier = "60f6e1b3b3f3b3b3b3f3b3b3";
    dto.description = "Test description";
    dto.status = TaskStatus.IN_PROGRESS;
    dto.dueDate = new Date().toISOString();
    dto.orderInProject = 1;
    dto.assignee = "60f6e1b3b3f3b3b3b3f3b3b6";
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
