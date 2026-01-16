import { validate } from "class-validator";

import { CreateProjectDto } from "../../../../src/modules/projects/dto/create-project.dto";

describe("CreateProjectDto", () => {
  it("should be valid with correct data", async () => {
    const dto = new CreateProjectDto();
    dto.title = "Test Project";
    dto.boardId = "60f6e1b3b3f3b3b3b3f3b3b4";
    dto.owner = "60f6e1b3b3f3b3b3b3f3b3b3";
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should be invalid if title is missing", async () => {
    const dto = new CreateProjectDto();
    dto.boardId = "60f6e1b3b3f3b3b3b3f3b3b4";
    dto.owner = "60f6e1b3b3f3b3b3b3f3b3b3";
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should be invalid if boardId is missing", async () => {
    const dto = new CreateProjectDto();
    dto.title = "Test Project";
    dto.owner = "60f6e1b3b3f3b3b3b3f3b3b3";
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should be invalid if owner is missing", async () => {
    const dto = new CreateProjectDto();
    dto.title = "Test Project";
    dto.boardId = "60f6e1b3b3f3b3b3b3f3b3b4";
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
