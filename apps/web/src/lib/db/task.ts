'use server';

import { BoardModel } from '@/models/board.model';
import { ProjectModel } from '@/models/project.model';
import { TaskModel, TaskType } from '@/models/task.model';
import { Task, TaskStatus } from '@/types/dbInterface';
import { Types } from 'mongoose';
import { connectToDatabase } from './connect';
import { getUserByEmail, getUserById } from './user';

// Define a base interface for both Mongoose documents and plain objects
interface TaskBase {
  _id: Types.ObjectId | string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate?: Date;
  board: Types.ObjectId | string;
  project: Types.ObjectId | string;
  assignee?: Types.ObjectId | string | { id: string; name: string };
  creator: Types.ObjectId | string | { id: string; name: string };
  lastModifier: Types.ObjectId | string | { id: string; name: string };
  createdAt: Date | string;
  updatedAt: Date | string;
  __v?: number;
}

async function convertTaskToPlainObject(taskDoc: TaskBase): Promise<TaskType> {
  if (!taskDoc) {
    throw new Error('Task document is undefined');
  }

  const creatorId =
    typeof taskDoc.creator === 'string'
      ? taskDoc.creator
      : taskDoc.creator.toString();

  const modifierId =
    typeof taskDoc.lastModifier === 'string'
      ? taskDoc.lastModifier
      : taskDoc.lastModifier.toString();

  if (!creatorId || !modifierId) {
    throw new Error(
      `Task document missing required fields: creator (${taskDoc.creator}) or lastModifier (${taskDoc.lastModifier})`
    );
  }

  const assigneeId = taskDoc.assignee
    ? typeof taskDoc.assignee === 'string'
      ? taskDoc.assignee
      : taskDoc.assignee.toString()
    : undefined;

  const [assigneeUser, creatorUser, modifierUser] = await Promise.all([
    assigneeId ? getUserById(assigneeId) : Promise.resolve(null),
    getUserById(creatorId),
    getUserById(modifierId)
  ]);

  if (!creatorUser || !modifierUser) {
    throw new Error('Unable to find creator or modifier user data');
  }

  const boardId =
    typeof taskDoc.board === 'string'
      ? taskDoc.board
      : taskDoc.board.toString();

  const projectId =
    typeof taskDoc.project === 'string'
      ? taskDoc.project
      : taskDoc.project.toString();

  const docId =
    typeof taskDoc._id === 'string' ? taskDoc._id : taskDoc._id.toString();

  return {
    _id: docId,
    title: taskDoc.title,
    description: taskDoc.description || '',
    // Cast the string literal union to the TaskStatus enum type
    status: (taskDoc.status || 'TODO') as TaskStatus,
    dueDate: taskDoc.dueDate,
    board: boardId,
    project: projectId,
    assignee:
      assigneeUser && assigneeId
        ? {
            id: assigneeId,
            name: assigneeUser.name
          }
        : undefined,
    creator: {
      id: creatorId,
      name: creatorUser.name
    },
    lastModifier: {
      id: modifierId,
      name: modifierUser.name
    },
    createdAt:
      typeof taskDoc.createdAt === 'string'
        ? new Date(taskDoc.createdAt)
        : taskDoc.createdAt,
    updatedAt:
      typeof taskDoc.updatedAt === 'string'
        ? new Date(taskDoc.updatedAt)
        : taskDoc.updatedAt
  };
}

async function getBoardByProjectId(
  projectId: string
): Promise<string | undefined> {
  try {
    await connectToDatabase();
    const project = await ProjectModel.findById(projectId);
    return project?.board;
  } catch (error) {
    console.error('Error fetching board:', error);
    throw error;
  }
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  try {
    await connectToDatabase();
    const tasks = await TaskModel.find({ project: projectId }).lean();
    return Promise.all(
      tasks.map((task) => {
        return convertTaskToPlainObject(task as unknown as TaskBase);
      })
    );
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

async function ensureUserIsMember(
  projectId: string,
  userId: string
): Promise<void> {
  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  const boardId = project.board;
  const board = await BoardModel.findById(boardId);
  if (!board) {
    throw new Error('Board not found');
  }

  const isProjectMember = project.members.some(
    (member) => member.toString() === userId
  );

  const isBoardMember = board.members.some(
    (member) => member.toString() === userId
  );

  if (!isProjectMember) {
    await ProjectModel.findByIdAndUpdate(projectId, {
      $addToSet: { members: userId }
    });
  }

  if (!isBoardMember) {
    await BoardModel.findByIdAndUpdate(boardId, {
      $addToSet: { members: userId }
    });
  }
}

export async function createTaskInDb(
  projectId: string,
  title: string,
  userEmail: string,
  description?: string,
  dueDate?: Date,
  assigneeId?: string,
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' = 'TODO'
): Promise<Task> {
  try {
    await connectToDatabase();
    const creator = await getUserByEmail(userEmail);
    if (!creator) {
      throw new Error('Creator not found');
    }

    const boardId = await getBoardByProjectId(projectId);
    if (!boardId) {
      throw new Error('Board not found');
    }

    if (assigneeId) {
      await ensureUserIsMember(projectId, assigneeId);
    }

    const taskData = {
      title,
      description,
      status,
      dueDate,
      board: boardId,
      project: projectId,
      assignee: assigneeId,
      creator: creator.id,
      lastModifier: creator.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newTask = await TaskModel.create(taskData);
    return convertTaskToPlainObject(newTask.toObject() as TaskBase);
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

export async function updateTaskInDb(
  taskId: string,
  title: string,
  userEmail: string,
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' = 'TODO',
  description?: string,
  dueDate?: Date,
  assigneeId?: string
): Promise<Task> {
  try {
    await connectToDatabase();
    const modifier = await getUserByEmail(userEmail);
    if (!modifier) {
      throw new Error('Modifier not found');
    }
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (assigneeId) {
      await ensureUserIsMember(task.project.toString(), assigneeId);
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      {
        title,
        description,
        status,
        dueDate,
        assignee: assigneeId,
        lastModifier: modifier.id,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedTask) {
      throw new Error('Task not found');
    }

    return convertTaskToPlainObject(updatedTask.toObject() as TaskBase);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

export async function updateTaskProjectInDb(
  userEmail: string,
  taskId: string,
  newProjectId: string
): Promise<Task> {
  try {
    await connectToDatabase();

    const user = await getUserByEmail(userEmail);
    if (!user) {
      throw new Error('User not found');
    }

    const targetProject = await ProjectModel.findById(newProjectId);
    if (!targetProject) {
      throw new Error('Target project not found');
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const isTargetProjectOwner =
      targetProject.owner.toString() === user.id.toString();
    const isTargetProjectMember = targetProject.members.some(
      (member) => member.toString() === user.id.toString()
    );
    const isTaskCreator = task.creator.toString() === user.id.toString();
    const isTaskAssignee = task.assignee?.toString() === user.id.toString();

    if (
      !(
        isTargetProjectOwner ||
        (isTargetProjectMember && (isTaskCreator || isTaskAssignee))
      )
    ) {
      throw new Error(
        'Permission denied: You do not have sufficient permissions to move this task'
      );
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      {
        project: new Types.ObjectId(newProjectId),
        lastModifier: user.id,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedTask) {
      throw new Error('Failed to update task');
    }

    return convertTaskToPlainObject(updatedTask.toObject() as TaskBase);
  } catch (error) {
    console.error('Error updating task project:', error);
    throw error;
  }
}

export async function deleteTaskInDb(taskId: string): Promise<void> {
  try {
    await connectToDatabase();
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }
    await TaskModel.findByIdAndDelete(taskId);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}
