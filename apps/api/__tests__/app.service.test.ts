import { beforeEach, describe, expect, it } from "vitest";

import { AppService } from "../src/app.service";

describe("AppService", () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getHello", () => {
    it('should return "Hello World!"', () => {
      expect(service.getHello()).toEqual("Hello World!");
    });
  });
});
