import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { CreateBoardDto } from "../../../../src/modules/boards/dto/create-boards.dto";

describe("CreateBoardDto", () => {
  it("should pass validation with valid data", async () => {
    const dto = new CreateBoardDto();
    dto.title = "Test Board";
    dto.description = "Test Description";
    dto.owner = "507f1f77bcf86cd799439013";
    dto.members = ["507f1f77bcf86cd799439014"];
    dto.projects = ["507f1f77bcf86cd799439015"];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass validation with minimal required data", async () => {
    const dto = new CreateBoardDto();
    dto.title = "Test Board";
    dto.owner = "507f1f77bcf86cd799439013";

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail validation without title", async () => {
    const dto = new CreateBoardDto();
    dto.owner = "507f1f77bcf86cd799439013";

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === "title")).toBeDefined();
  });

  it("should fail validation without owner", async () => {
    const dto = new CreateBoardDto();
    dto.title = "Test Board";

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === "owner")).toBeDefined();
  });

  it("should fail validation with invalid owner id", async () => {
    const dto = new CreateBoardDto();
    dto.title = "Test Board";
    dto.owner = "invalid-id";

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === "owner")).toBeDefined();
  });

  it("should fail validation with invalid member ids", async () => {
    const dto = new CreateBoardDto();
    dto.title = "Test Board";
    dto.owner = "507f1f77bcf86cd799439013";
    dto.members = ["invalid-id"];

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === "members")).toBeDefined();
  });

  it("should fail validation with invalid project ids", async () => {
    const dto = new CreateBoardDto();
    dto.title = "Test Board";
    dto.owner = "507f1f77bcf86cd799439013";
    dto.projects = ["invalid-id"];

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === "projects")).toBeDefined();
  });

  it("should fail validation with empty title", async () => {
    const dto = new CreateBoardDto();
    dto.title = "";
    dto.owner = "507f1f77bcf86cd799439013";

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === "title")).toBeDefined();
  });

  it("should fail validation with non-string title", async () => {
    const dto = new CreateBoardDto();
    (dto as any).title = 123;
    dto.owner = "507f1f77bcf86cd799439013";

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === "title")).toBeDefined();
  });

  it("should fail validation with non-array members", async () => {
    const dto = new CreateBoardDto();
    dto.title = "Test Board";
    dto.owner = "507f1f77bcf86cd799439013";
    (dto as any).members = "not-an-array";

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === "members")).toBeDefined();
  });

  it("should fail validation with non-array projects", async () => {
    const dto = new CreateBoardDto();
    dto.title = "Test Board";
    dto.owner = "507f1f77bcf86cd799439013";
    (dto as any).projects = "not-an-array";

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === "projects")).toBeDefined();
  });
});
