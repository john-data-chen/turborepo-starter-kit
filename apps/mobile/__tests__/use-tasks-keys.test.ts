import { describe, it, expect } from "vitest";

import { TASK_KEYS } from "@/hooks/use-tasks";

describe("useTasks constants", () => {
  it("should generate correct keys", () => {
    expect(TASK_KEYS.all).toEqual(["tasks"]);
    expect(TASK_KEYS.lists()).toContain("list");
    expect(TASK_KEYS.list({ project: "p1" })).toContainEqual({ project: "p1" });
    expect(TASK_KEYS.detail("t1")).toContain("t1");
  });
});
