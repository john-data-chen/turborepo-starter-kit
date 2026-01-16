import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { UpdateBoardDto } from "../../../../src/modules/boards/dto/update-boards.dto";

describe("UpdateBoardDto", () => {
  it("should pass validation with valid data", async () => {
    const dto = new UpdateBoardDto();
    dto.title = "Updated Board";
    dto.description = "Updated Description";
    dto.members = ["507f1f77bcf86cd799439013"];
    dto.projects = ["507f1f77bcf86cd799439014"];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass validation with empty dto", async () => {
    const dto = new UpdateBoardDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass validation with only title", async () => {
    const dto = new UpdateBoardDto();
    dto.title = "Updated Board";
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail validation with invalid member ids", async () => {
    const dto = new UpdateBoardDto();
    dto.members = ["invalid-id"];
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === "members")).toBeDefined();
  });

  it("should fail validation with invalid project ids", async () => {
    const dto = new UpdateBoardDto();
    dto.projects = ["invalid-id"];
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === "projects")).toBeDefined();
  });

  it("should fail validation with non-string title", async () => {
    const dto = new UpdateBoardDto();
    (dto as any).title = 123;
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === "title")).toBeDefined();
  });

  it("should fail validation with non-string description", async () => {
    const dto = new UpdateBoardDto();
    (dto as any).description = 123;
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === "description")).toBeDefined();
  });

  it("should fail validation with non-array members", async () => {
    const dto = new UpdateBoardDto();
    (dto as any).members = "not-an-array";
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === "members")).toBeDefined();
  });

  it("should fail validation with non-array projects", async () => {
    const dto = new UpdateBoardDto();
    (dto as any).projects = "not-an-array";
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === "projects")).toBeDefined();
  });

  it("should pass validation with valid multiple members", async () => {
    const dto = new UpdateBoardDto();
    dto.members = ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"];
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should pass validation with valid multiple projects", async () => {
    const dto = new UpdateBoardDto();
    dto.projects = ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"];
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
