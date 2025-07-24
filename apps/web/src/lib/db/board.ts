'use server';

import { BoardModel } from '@/models/board.model';
import { ProjectModel } from '@/models/project.model';
import { Board, BoardDocument, Project } from '@/types/dbInterface';
import { Types } from 'mongoose';
import { connectToDatabase } from './connect';
import { getUserByEmail, getUserById } from './user';

export async function fetchBoardsFromDb(userEmail: string): Promise<Board[]> {
  try {
    await connectToDatabase();
    const user = await getUserByEmail(userEmail);
    if (!user) {
      console.warn(
        `User not found for email: ${userEmail}. Returning empty board list.`
      );
      return [];
    }

    const boardsFromDb = await BoardModel.find({
      $or: [{ owner: user.id }, { members: user.id }]
    })
      .populate({
        path: 'projects',
        populate: {
          path: 'owner members',
          select: 'name' // Only select name for nested owner/members
        }
      })
      .lean();

    const allUserIds = new Set<string>();
    boardsFromDb.forEach((board) => {
      allUserIds.add(board.owner.toString());
      board.members.forEach((memberId) => allUserIds.add(memberId.toString()));
    });

    const userMap = await getUserMap(Array.from(allUserIds));

    return boardsFromDb.map((board) =>
      convertBoardToPlainObject(board as BoardDocument, userMap)
    );
  } catch (error) {
    console.error('Error in getBoardsFromDb:', error);
    return [];
  }
}

async function getUserMap(userIds: string[]): Promise<Map<string, string>> {
  const userMap = new Map<string, string>();
  const users = await Promise.all(userIds.map((id) => getUserById(id)));
  users.forEach((user) => {
    if (user) {
      userMap.set(user.id, user.name);
    }
  });
  return userMap;
}

function convertBoardToPlainObject(
  boardDoc: BoardDocument,
  userMap: Map<string, string>
): Board {
  const ownerId = boardDoc.owner.toString();
  return {
    _id: boardDoc._id.toString(),
    title: boardDoc.title,
    description: boardDoc.description || '',
    owner: {
      id: ownerId,
      name: userMap.get(ownerId) || 'Unknown User'
    },
    members: boardDoc.members.filter(Boolean).map((memberId) => {
      const id = memberId.toString();
      return {
        id,
        name: userMap.get(id) || 'Unknown User'
      };
    }),
    projects: (boardDoc.projects || []).filter(Boolean).map((p): Project => {
      const projectDoc = p as unknown as {
        _id: Types.ObjectId;
        title: string;
        description?: string;
        board: Types.ObjectId;
        owner: { _id: Types.ObjectId; name: string };
        members: { _id: Types.ObjectId; name: string }[];
        createdAt: Date;
        updatedAt: Date;
      };
      return {
        _id: projectDoc._id.toString(),
        title: projectDoc.title,
        description: projectDoc.description || '',
        board: projectDoc.board.toString(),
        owner: projectDoc.owner
          ? { id: projectDoc.owner._id.toString(), name: projectDoc.owner.name }
          : { id: '', name: 'Unknown' },
        members: (projectDoc.members || [])
          .filter(Boolean)
          .map((m: { _id: Types.ObjectId; name: string }) => ({
            id: m._id.toString(),
            name: m.name
          })),
        tasks: [],
        createdAt: new Date(projectDoc.createdAt).toISOString(),
        updatedAt: new Date(projectDoc.updatedAt).toISOString()
      };
    }),
    createdAt: new Date(boardDoc.createdAt),
    updatedAt: new Date(boardDoc.updatedAt)
  };
}

export async function createBoardInDb({
  title,
  userEmail,
  description
}: {
  title: string;
  userEmail: string;
  description?: string;
}): Promise<Board | null> {
  try {
    await connectToDatabase();
    const user = await getUserByEmail(userEmail);
    if (!user) throw new Error('User not found');

    const newBoard = await BoardModel.create({
      title,
      description,
      owner: user.id,
      members: [user.id],
      projects: []
    });

    const userMap = new Map([[user.id, user.name]]);
    return convertBoardToPlainObject(newBoard.toObject(), userMap);
  } catch (error) {
    console.error('Error in createBoardInDb:', error);
    return null;
  }
}

export async function updateBoardInDb(
  boardId: string,
  data: Partial<Board>,
  userEmail: string
): Promise<Board | null> {
  try {
    await connectToDatabase();

    const user = await getUserByEmail(userEmail);
    if (!user) throw new Error('User not found');

    const existingBoard = await BoardModel.findById(boardId).lean();
    if (!existingBoard) throw new Error('Board not found');

    if (existingBoard.owner.toString() !== user.id) {
      throw new Error('Unauthorized: Only board owner can update the board');
    }

    const board = await BoardModel.findByIdAndUpdate(
      boardId,
      { ...data },
      { new: true }
    ).lean();

    if (!board) return null;

    const allUserIds = new Set<string>();
    allUserIds.add(board.owner.toString());
    board.members.forEach((memberId) => allUserIds.add(memberId.toString()));
    const userMap = await getUserMap(Array.from(allUserIds));

    return convertBoardToPlainObject(board as BoardDocument, userMap);
  } catch (error) {
    console.error('Error in updateBoardInDb:', error);
    return null;
  }
}

export async function deleteBoardInDb(
  boardId: string,
  userEmail: string
): Promise<boolean> {
  try {
    await connectToDatabase();

    const user = await getUserByEmail(userEmail);
    if (!user) throw new Error('User not found');

    const board = await BoardModel.findById(boardId).lean();
    if (!board) throw new Error('Board not found');

    if (board.owner.toString() !== user.id) {
      throw new Error('Unauthorized: Only board owner can delete the board');
    }

    const { TaskModel } = await import('@/models/task.model');
    await TaskModel.deleteMany({
      project: { $in: board.projects }
    });

    await ProjectModel.deleteMany({ board: boardId });
    await BoardModel.findByIdAndDelete(boardId);

    return true;
  } catch (error) {
    console.error('Error in deleteBoardInDb:', error);
    return false;
  }
}
