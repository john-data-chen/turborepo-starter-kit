import { describe, it, expect } from "vitest";

import { BOARD_KEYS } from "@/hooks/use-boards";
import { PROJECT_KEYS } from "@/hooks/use-projects";
import { TASK_KEYS } from "@/hooks/use-tasks";

describe("hook keys", () => {
  it("should generate correct BOARD_KEYS", () => {
    expect(BOARD_KEYS.all).toEqual(["boards"]);
    expect(BOARD_KEYS.detail("1")).toContain("1");
  });

  it("should generate correct PROJECT_KEYS", () => {
    expect(PROJECT_KEYS.all).toEqual(["projects"]);
    expect(PROJECT_KEYS.list("b1")).toContainEqual({ boardId: "b1" });
  });

  it("should generate correct TASK_KEYS", () => {
    expect(TASK_KEYS.all).toEqual(["tasks"]);
    expect(TASK_KEYS.list({ project: "p1" })).toContainEqual({ project: "p1" });
  });
});
