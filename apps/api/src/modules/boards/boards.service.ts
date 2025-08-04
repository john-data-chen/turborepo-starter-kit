import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateBoardDto } from './dto/create-boards.dto';
import { UpdateBoardDto } from './dto/update-boards.dto';
import { Board, BoardDocument } from './schemas/boards.schema';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>
  ) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    // Convert owner string to ObjectId
    const ownerId = new Types.ObjectId(createBoardDto.owner);

    // Create the board with the owner as ObjectId
    const createdBoard = new this.boardModel({
      ...createBoardDto,
      owner: ownerId,
      // Add owner to members if not already present
      members: [
        ...new Set([
          ownerId,
          ...(createBoardDto.members || []).map((id) => new Types.ObjectId(id))
        ])
      ]
    });

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
      const ownedBoards = await this.boardModel.aggregate([
        { $match: { owner: new Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner'
          }
        },
        { $unwind: '$owner' },
        {
          $project: {
            title: 1,
            description: 1,
            owner: 1,
            members: 1,
            projects: 1,
            createdAt: 1,
            updatedAt: 1
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'members',
            foreignField: '_id',
            as: 'members'
          }
        },
        {
          $lookup: {
            from: 'projects',
            localField: 'projects',
            foreignField: '_id',
            as: 'projects',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'owner',
                  foreignField: '_id',
                  as: 'owner'
                }
              },
              { $unwind: '$owner' },
              {
                $lookup: {
                  from: 'users',
                  localField: 'members',
                  foreignField: '_id',
                  as: 'members'
                }
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  description: 1,
                  owner: {
                    _id: 1,
                    name: 1,
                    email: 1
                  },
                  members: {
                    _id: 1,
                    name: 1,
                    email: 1
                  }
                }
              }
            ]
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            owner: {
              _id: 1,
              name: 1,
              email: 1
            },
            members: {
              _id: 1,
              name: 1,
              email: 1
            },
            projects: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ]);
      console.log(
        `[BoardService] Found ${ownedBoards.length} boards where user is owner`
      );

      // Then find boards where user is a member but not the owner
      const memberBoards = await this.boardModel.aggregate([
        {
          $match: {
            members: new Types.ObjectId(userId),
            owner: { $ne: new Types.ObjectId(userId) }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner'
          }
        },
        { $unwind: '$owner' },
        {
          $lookup: {
            from: 'users',
            localField: 'members',
            foreignField: '_id',
            as: 'members'
          }
        },
        {
          $lookup: {
            from: 'projects',
            localField: 'projects',
            foreignField: '_id',
            as: 'projects',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'owner',
                  foreignField: '_id',
                  as: 'owner'
                }
              },
              { $unwind: '$owner' },
              {
                $lookup: {
                  from: 'users',
                  localField: 'members',
                  foreignField: '_id',
                  as: 'members'
                }
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  description: 1,
                  owner: {
                    _id: 1,
                    name: 1,
                    email: 1
                  },
                  members: {
                    _id: 1,
                    name: 1,
                    email: 1
                  }
                }
              }
            ]
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            owner: {
              _id: 1,
              name: 1,
              email: 1
            },
            members: {
              _id: 1,
              name: 1,
              email: 1
            },
            projects: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ]);
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
                projects: board.projects,
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

      const [board] = await this.boardModel.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(id),
            $or: [
              { owner: new Types.ObjectId(userId) },
              { members: new Types.ObjectId(userId) }
            ]
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner'
          }
        },
        { $unwind: '$owner' },
        {
          $lookup: {
            from: 'users',
            localField: 'members',
            foreignField: '_id',
            as: 'members'
          }
        },
        {
          $lookup: {
            from: 'projects',
            localField: 'projects',
            foreignField: '_id',
            as: 'projects',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'owner',
                  foreignField: '_id',
                  as: 'owner'
                }
              },
              { $unwind: '$owner' },
              {
                $lookup: {
                  from: 'users',
                  localField: 'members',
                  foreignField: '_id',
                  as: 'members'
                }
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  description: 1,
                  owner: {
                    _id: 1,
                    name: 1,
                    email: 1
                  },
                  members: {
                    _id: 1,
                    name: 1,
                    email: 1
                  }
                }
              }
            ]
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            owner: {
              _id: 1,
              name: 1,
              email: 1
            },
            members: {
              _id: 1,
              name: 1,
              email: 1
            },
            projects: 1,
            createdAt: 1,
            updatedAt: 1
          }
        },
        { $limit: 1 }
      ]);

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
    // First, verify the board exists and the user has permission
    const board = await this.boardModel.findById(id).exec();

    if (!board) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }

    // Check if the user is the owner or a member
    const isOwner = board.owner.toString() === userId;
    const isMember = board.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isOwner && !isMember) {
      throw new NotFoundException(
        `Board with ID "${id}" not found or access denied`
      );
    }

    // Update the board
    const updatedBoard = await this.boardModel
      .findByIdAndUpdate(id, { $set: updateBoardDto }, { new: true })
      .exec();

    if (!updatedBoard) {
      // This should theoretically never happen since we already checked the board exists
      throw new NotFoundException(`Failed to update board with ID "${id}"`);
    }

    return updatedBoard;
  }

  async remove(id: string, userId: string): Promise<void> {
    console.log(
      `[BoardService] Attempting to delete board ${id} for user ${userId}`
    );

    // First, check if the board exists and the user has permission
    const board = await this.boardModel.findById(id).exec();

    if (!board) {
      console.error(`[BoardService] Board with ID "${id}" not found`);
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }

    // Check if the user is the owner
    if (board.owner.toString() !== userId) {
      console.error(
        `[BoardService] User ${userId} is not the owner of board ${id}`
      );
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }

    // If we get here, the board exists and the user is the owner, so delete it
    const result = await this.boardModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      // This should theoretically never happen because we already checked the board exists
      console.error(
        `[BoardService] Failed to delete board ${id} for unknown reason`
      );
      throw new NotFoundException(`Failed to delete board with ID "${id}"`);
    }

    console.log(`[BoardService] Successfully deleted board ${id}`);
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
