import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { Types } from "mongoose";

/**
 * Custom pipe to transform a string ID to a MongoDB ObjectId
 * or pass through if it's already an ObjectId
 */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<unknown, Types.ObjectId> {
  transform(value: unknown): Types.ObjectId {
    if (!value) {
      throw new BadRequestException("ID is required");
    }
    if (typeof value !== "string" && !(value instanceof Types.ObjectId)) {
      throw new BadRequestException("Invalid ID format");
    }
    if (Types.ObjectId.isValid(value)) {
      return typeof value === "string" ? new Types.ObjectId(value) : (value);
    }
    throw new BadRequestException("Invalid ID format");
  }
}
