import { BoardModel } from '@/models/board.model';
import { ProjectModel } from '@/models/project.model';
import { TaskModel } from '@/models/task.model';
import { UserModel } from '@/models/user.model';
import mongoose from 'mongoose';

export interface Project {
  _id: string;
  title: string;
  description?: string;
  owner: UserInfo;
  members: UserInfo[];
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
  board: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInfo {
  id: string;
  name: string;
}

export interface BoardDocument {
  _id: string;
  title: string;
  description?: string;
  owner: string | UserInfo;
  members: (string | UserInfo)[];
  projects: (string | Project)[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: Date;
  board: string;
  project: string;
  assignee?: UserInfo;
  creator: UserInfo;
  lastModifier: UserInfo;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectModel = mongoose.InferSchemaType<
  (typeof ProjectModel)['schema']
> & {
  _id: string;
  title: string;
  description?: string;
  owner: string;
  members: string[];
  tasks: Task[];
  board: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserModel = mongoose.InferSchemaType<
  (typeof UserModel)['schema']
> & {
  _id: string;
  email: string;
  name: string;
};

export type TaskModel = mongoose.InferSchemaType<
  (typeof TaskModel)['schema']
> & {
  _id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  board: string;
  project: string;
  assignee?: string;
  creator: string;
  lastModifier: string;
};

export interface Board {
  _id: string;
  title: string;
  description?: string;
  owner: UserInfo;
  members: UserInfo[];
  projects: Project[];
  createdAt: Date;
  updatedAt: Date;
}

export type BoardModel = mongoose.InferSchemaType<
  (typeof BoardModel)['schema']
> & {
  _id: string;
  title: string;
  description?: string;
  owner: string;
  members: string[];
  projects: string[];
  createdAt: Date;
  updatedAt: Date;
};
