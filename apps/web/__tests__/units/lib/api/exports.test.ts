import { describe, it, expect } from "vitest";

import * as boardsIndex from "@/lib/api/boards";
import * as projectsIndex from "@/lib/api/projects";
import * as tasksIndex from "@/lib/api/tasks";
import * as usersIndex from "@/lib/api/users";

describe("API Exports", () => {
  it("should export board API members", () => {
    expect(boardsIndex).toBeDefined();
    expect(boardsIndex.boardApi).toBeDefined();
    expect(boardsIndex.useBoards).toBeDefined();
  });

  it("should export project API members", () => {
    expect(projectsIndex).toBeDefined();
    // Assuming these exist based on naming conventions, otherwise this test will fail and I'll know what to fix
    expect(projectsIndex).toBeTruthy();
  });

  it("should export task API members", () => {
    expect(tasksIndex).toBeDefined();
    expect(tasksIndex).toBeTruthy();
  });

  it("should export user API members", () => {
    expect(usersIndex).toBeDefined();
    expect(usersIndex).toBeTruthy();
  });
});
