import { describe, expect, it } from "vitest";

import { API_PORT } from "../../src/constants/api";
import { demoBoards, demoProjects, demoTasks, demoUsers } from "../../src/constants/demoData";

describe("Constants", () => {
  it("should have the correct API_PORT", () => {
    expect(API_PORT).toEqual(3001);
  });

  it("should have the correct demoUsers", () => {
    expect(demoUsers).toBeInstanceOf(Array);
    expect(demoUsers.length).toBeGreaterThan(0);
  });

  it("should have the correct demoBoards", () => {
    expect(demoBoards).toBeInstanceOf(Array);
    expect(demoBoards.length).toBeGreaterThan(0);
  });

  it("should have the correct demoProjects", () => {
    expect(demoProjects).toBeInstanceOf(Array);
    expect(demoProjects.length).toBeGreaterThan(0);
  });

  it("should have the correct demoTasks", () => {
    expect(demoTasks).toBeInstanceOf(Array);
    expect(demoTasks.length).toBeGreaterThan(0);
  });
});
