import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
    console.log(`Finding boards for user: ${userId}`);

    const query = {
      $or: [{ owner: userId }, { members: userId }]
    };

    console.log('MongoDB query:', JSON.stringify(query));

    const boards = await this.boardModel
      .find(query)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .lean()
      .exec();

    console.log(`Found ${boards.length} boards for user ${userId}`);
    if (boards.length > 0) {
      console.log('Sample board:', JSON.stringify(boards[0]));
    }

    return boards;
  }

  async findOne(id: string, userId: string): Promise<Board> {
    const board = await this.boardModel
      .findOne({
        _id: id,
        $or: [{ owner: userId }, { members: userId }]
      })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate('projects')
      .exec();

    if (!board) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }

    return board;
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
