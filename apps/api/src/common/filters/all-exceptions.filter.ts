import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from "@nestjs/common";
import { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.getResponse() : "Internal server error";

    if (status >= 500) {
      const errorMessage = exception instanceof Error ? exception.message : "Unknown error";
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(`Unhandled exception: ${errorMessage}`, stack);
    }

    response
      .status(status)
      .json(
        typeof message === "string"
          ? { statusCode: status, message }
          : { statusCode: status, ...(typeof message === "object" ? message : { message }) }
      );
  }
}
