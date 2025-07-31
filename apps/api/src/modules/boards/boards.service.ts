import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board, BoardDocument } from './schemas/boards.schema';
import { CreateBoardDto } from './dto/create-boards.dto';
import { UpdateBoardDto } from './dto/update-boards.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>
  ) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const createdBoard = new this.boardModel(createBoardDto);
    return createdBoard.save();
  }

  async findAll(userId: string): Promise<Board[]> {
    console.log(
      `[BoardService] Finding boards for user ID: ${userId} (type: ${typeof userId})`
    );

    try {
      // Ensure userId is a valid ObjectId
      const isValidObjectId = Types.ObjectId.isValid(userId);
      if (!isValidObjectId) {
        console.error(`[BoardService] Invalid user ID format: ${userId}`);
        return [];
      }

      const query = {
        $or: [
          { owner: new Types.ObjectId(userId) }, // Ensure owner is compared with ObjectId
          { members: new Types.ObjectId(userId) } // Ensure members contains ObjectId
        ]
      };

      console.log('[BoardService] MongoDB query:', JSON.stringify(query));

      // First, find boards where user is the owner
      const ownedBoards = await this.boardModel
        .find({ owner: new Types.ObjectId(userId) })
        .lean()
        .exec();
      console.log(
        `[BoardService] Found ${ownedBoards.length} boards where user is owner`
      );

      // Then find boards where user is a member
      const memberBoards = await this.boardModel
        .find({
          _id: { $nin: ownedBoards.map((b) => b._id) }, // Exclude already found boards
          members: new Types.ObjectId(userId)
        })
        .lean()
        .exec();
      console.log(
        `[BoardService] Found ${memberBoards.length} boards where user is member`
      );

      const allBoards = [...ownedBoards, ...memberBoards];
      console.log(`[BoardService] Total boards found: ${allBoards.length}`);

      if (allBoards.length > 0) {
        allBoards.forEach((board) => {
          console.log(
            '[BoardService]',
            JSON.stringify(
              {
                _id: board._id,
                title: board.title,
                owner: board.owner,
                members: board.members
              },
              null,
              2
            )
          );
        });
      }

      return allBoards;
    } catch (error) {
      console.error('[BoardService] Error finding boards:', error);
      throw error;
    }
  }

  async findOne(id: string, userId: string): Promise<Board> {
    console.log(
      `[BoardService] Finding board with ID: ${id} for user: ${userId}`
    );

    try {
      // Validate ObjectIds
      if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
        throw new NotFoundException('Invalid board or user ID format');
      }

      const board = await this.boardModel
        .findOne({
          _id: new Types.ObjectId(id),
          $or: [
            { owner: new Types.ObjectId(userId) },
            { members: new Types.ObjectId(userId) }
          ]
        })
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .populate('projects')
        .lean()
        .exec();

      if (!board) {
        console.log(`[BoardService] Board not found or access denied: ${id}`);
        throw new NotFoundException(
          `Board with ID "${id}" not found or access denied`
        );
      }

      console.log(`[BoardService] Found board: ${board.title} (${board._id})`);
      return board;
    } catch (error) {
      console.error(`[BoardService] Error finding board ${id}:`, error);
      throw error;
    }
  }

  async update(
    id: string,
    updateBoardDto: UpdateBoardDto,
    userId: string
  ): Promise<Board> {
    const board = await this.boardModel
      .findOneAndUpdate(
        { _id: id, owner: userId },
        { $set: updateBoardDto },
        { new: true }
      )
      .exec();

    if (!board) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }

    return board;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.boardModel
      .deleteOne({ _id: id, owner: userId })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }
  }

  // Additional methods for board management
  async addMember(
    boardId: string,
    userId: string,
    memberId: string
  ): Promise<Board> {
    const board = await this.boardModel
      .findOneAndUpdate(
        { _id: boardId, owner: userId },
        { $addToSet: { members: memberId } },
        { new: true }
      )
      .exec();

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    return board;
  }

  async removeMember(
    boardId: string,
    userId: string,
    memberId: string
  ): Promise<Board> {
    const board = await this.boardModel
      .findOneAndUpdate(
        { _id: boardId, owner: userId },
        { $pull: { members: memberId } },
        { new: true }
      )
      .exec();

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    return board;
  }
}
