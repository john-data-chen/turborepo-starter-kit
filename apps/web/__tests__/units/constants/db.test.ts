import { describe, expect, it } from "vitest";

import { CONNECT_TIMEOUT_MS, SERVER_SELECTION_TIMEOUT_MS, SOCKET_TIMEOUT_MS } from "@/constants/db";

describe("db constants", () => {
  it("should have correct CONNECT_TIMEOUT_MS value", () => {
    expect(CONNECT_TIMEOUT_MS).toBe(10000);
    expect(typeof CONNECT_TIMEOUT_MS).toBe("number");
  });

  it("should have correct SOCKET_TIMEOUT_MS value", () => {
    expect(SOCKET_TIMEOUT_MS).toBe(45000);
    expect(typeof SOCKET_TIMEOUT_MS).toBe("number");
  });

  it("should have correct SERVER_SELECTION_TIMEOUT_MS value", () => {
    expect(SERVER_SELECTION_TIMEOUT_MS).toBe(10000);
    expect(typeof SERVER_SELECTION_TIMEOUT_MS).toBe("number");
  });

  it("should have SOCKET_TIMEOUT_MS greater than CONNECT_TIMEOUT_MS", () => {
    expect(SOCKET_TIMEOUT_MS).toBeGreaterThan(CONNECT_TIMEOUT_MS);
  });

  it("should have all timeout values as positive numbers", () => {
    expect(CONNECT_TIMEOUT_MS).toBeGreaterThan(0);
    expect(SOCKET_TIMEOUT_MS).toBeGreaterThan(0);
    expect(SERVER_SELECTION_TIMEOUT_MS).toBeGreaterThan(0);
  });
});
