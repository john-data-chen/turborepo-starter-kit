import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

/**
 * Custom pipe to transform a string ID to a MongoDB ObjectId
 * or pass through if it's already an ObjectId
 */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<any, Types.ObjectId> {
  transform(value: any): Types.ObjectId {
    if (!value) {
      throw new BadRequestException('ID is required');
    }

    // If it's already an ObjectId or can be converted to one, return it
    if (Types.ObjectId.isValid(value)) {
      return typeof value === 'string' ? new Types.ObjectId(value) : value;
    }

    throw new BadRequestException('Invalid ID format');
  }
}
