import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "eventemitter2";
import { Types } from "mongoose";

import { BoardDeletedEvent } from "../../common/events";

import { CreateBoardDto } from "./dto/create-boards.dto";
import { UpdateBoardDto } from "./dto/update-boards.dto";
import { BoardRepository } from "./repositories/boards.repository";
import { Board } from "./schemas/boards.schema";

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const ownerId = new Types.ObjectId(createBoardDto.owner);

    return this.boardRepository.create({
      title: createBoardDto.title,
      description: createBoardDto.description,
      owner: ownerId,
      members: [
        ...new Set([ownerId, ...(createBoardDto.members || []).map((id) => new Types.ObjectId(id))])
      ],
      projects: createBoardDto.projects?.map((id) => new Types.ObjectId(id))
    });
  }

  async findAll(userId: string): Promise<{ myBoards: Board[]; teamBoards: Board[] }> {
    if (!Types.ObjectId.isValid(userId)) {
      this.logger.warn(`Invalid user ID format: ${userId}`);
      return { myBoards: [], teamBoards: [] };
    }

    const userObjectId = new Types.ObjectId(userId);
    const [myBoards, teamBoards] = await Promise.all([
      this.boardRepository.findByOwner(userObjectId),
      this.boardRepository.findByMemberNotOwner(userObjectId)
    ]);

    return { myBoards, teamBoards };
  }

  async findOne(id: string, userId: string): Promise<Board | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      throw new NotFoundException("Invalid board or user ID format");
    }

    return this.boardRepository.findOneWithAccess(
      new Types.ObjectId(id),
      new Types.ObjectId(userId)
    );
  }

  async update(id: string, updateBoardDto: UpdateBoardDto, userId: string): Promise<Board | null> {
    const userIdString = userId.toString();
    const board = await this.boardRepository.findById(id);

    if (!board) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }

    const isOwner = board.owner.toString() === userIdString;
    const isMember = board.members.some((memberId) => memberId.toString() === userIdString);

    if (!isOwner && !isMember) {
      throw new NotFoundException(`Board with ID "${id}" not found or access denied`);
    }

    const updateData: Partial<Board> = {
      ...(updateBoardDto.title !== undefined && { title: updateBoardDto.title }),
      ...(updateBoardDto.description !== undefined && { description: updateBoardDto.description }),
      ...(updateBoardDto.owner !== undefined && {
        owner: new Types.ObjectId(updateBoardDto.owner)
      }),
      ...(updateBoardDto.members !== undefined && {
        members: updateBoardDto.members.map((memberId) => new Types.ObjectId(memberId))
      }),
      ...(updateBoardDto.projects !== undefined && {
        projects: updateBoardDto.projects.map((projectId) => new Types.ObjectId(projectId))
      })
    };

    await this.boardRepository.updateById(id, updateData);
    return this.findOne(id, userId);
  }

  // NOTE: caller must verify board ownership before invoking remove().
  // BoardService does NOT re-check permissions — it trusts the caller.
  async remove(id: string, userId: string): Promise<{ message: string }> {
    const userIdString = userId.toString();
    const board = await this.boardRepository.findById(id);

    if (!board) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }

    if (board.owner.toString() !== userIdString) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }

    // Emit event for cascade deletion — ProjectsService and TasksService will handle cleanup
    this.eventEmitter.emit("board.deleted", new BoardDeletedEvent(id, userId));

    const result = await this.boardRepository.deleteById(id);

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Failed to delete board with ID "${id}"`);
    }

    return { message: "Board deleted successfully" };
  }

  async addMember(boardId: string, userId: string, memberId: string): Promise<Board> {
    const board = await this.boardRepository.addMember(boardId, userId, memberId);

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    return board;
  }

  async removeMember(boardId: string, userId: string, memberId: string): Promise<Board> {
    const board = await this.boardRepository.removeMember(boardId, userId, memberId);

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    return board;
  }
}
