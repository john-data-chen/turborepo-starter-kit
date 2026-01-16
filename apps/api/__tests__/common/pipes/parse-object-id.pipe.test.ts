import { BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";

import { ParseObjectIdPipe } from "../../../src/common/pipes/parse-object-id.pipe";

describe("ParseObjectIdPipe", () => {
  let pipe: ParseObjectIdPipe;

  beforeEach(() => {
    pipe = new ParseObjectIdPipe();
  });

  it("should be defined", () => {
    expect(pipe).toBeDefined();
  });

  it("should throw a BadRequestException if the value is null", () => {
    expect(() => pipe.transform(null)).toThrow(BadRequestException);
  });

  it("should throw a BadRequestException if the value is undefined", () => {
    expect(() => pipe.transform(undefined)).toThrow(BadRequestException);
  });

  it("should return a Types.ObjectId if the value is a valid ObjectId string", () => {
    const objectId = new Types.ObjectId();
    const result = pipe.transform(objectId.toHexString());
    expect(result).toBeInstanceOf(Types.ObjectId);
    expect(result).toEqual(objectId);
  });

  it("should return the same Types.ObjectId if the value is already an ObjectId", () => {
    const objectId = new Types.ObjectId();
    const result = pipe.transform(objectId);
    expect(result).toBeInstanceOf(Types.ObjectId);
    expect(result).toEqual(objectId);
  });

  it("should throw a BadRequestException if the value is not a valid ObjectId string", () => {
    expect(() => pipe.transform("invalid-object-id")).toThrow(BadRequestException);
  });
});
