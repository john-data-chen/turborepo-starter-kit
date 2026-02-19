import { HttpException, HttpStatus } from "@nestjs/common";
import { ArgumentsHost } from "@nestjs/common/interfaces";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { AllExceptionsFilter } from "../../../src/common/filters/all-exceptions.filter";

describe("AllExceptionsFilter", () => {
  let filter: AllExceptionsFilter;
  let mockResponse: Record<string, ReturnType<typeof vi.fn>>;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    mockHost = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: vi.fn().mockReturnValue(mockResponse)
      })
    } as unknown as ArgumentsHost;
  });

  it("should be defined", () => {
    expect(filter).toBeDefined();
  });

  describe("HttpException handling", () => {
    it("should handle HttpException with string response", () => {
      const exception = new HttpException("Bad request", HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Bad request"
      });
    });

    it("should handle HttpException with object response", () => {
      const exception = new HttpException(
        { error: "Validation failed", details: "Field is required" },
        HttpStatus.BAD_REQUEST
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        error: "Validation failed",
        details: "Field is required"
      });
    });

    it("should handle HttpException with array response", () => {
      const exception = new HttpException(["error1", "error2"], HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        0: "error1",
        1: "error2"
      });
    });
  });

  describe("non-HttpException handling", () => {
    it("should handle generic Error with 500 status", () => {
      const exception = new Error("Something went wrong");

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal server error"
      });
    });

    it("should handle unknown exception type", () => {
      const exception = "Unknown error string";

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal server error"
      });
    });

    it("should handle null exception", () => {
      filter.catch(null, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal server error"
      });
    });
  });

  describe("logging for 5xx errors", () => {
    it("should log error for 500 status", () => {
      const exception = new Error("Server error");
      const loggerSpy = vi.spyOn(filter["logger"], "error");

      filter.catch(exception, mockHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        "Unhandled exception: Server error",
        expect.any(String)
      );
    });

    it("should not log error for 400 status", () => {
      const exception = new HttpException("Bad request", HttpStatus.BAD_REQUEST);
      const loggerSpy = vi.spyOn(filter["logger"], "error");

      filter.catch(exception, mockHost);

      expect(loggerSpy).not.toHaveBeenCalled();
    });

    it("should handle non-Error 5xx exceptions in logging", () => {
      const exception = { status: 500, message: "Weird error" };
      const loggerSpy = vi.spyOn(filter["logger"], "error");

      filter.catch(exception as any, mockHost);

      expect(loggerSpy).toHaveBeenCalledWith("Unhandled exception: Unknown error", undefined);
    });
  });
});
