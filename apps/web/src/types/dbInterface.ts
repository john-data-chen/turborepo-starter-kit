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
  _id: string;
  name: string;
  email: string;
}

export interface Session {
  user: UserInfo;
  accessToken: string;
}

export interface BoardDocument {
  _id: string;
  title: string;
  description?: string;
  owner: string;
  members: string[];
  projects: string[];
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
  id: string; // Alias for _id for consistency
  title: string;
  description?: string | null;
  status: TaskStatus;
  dueDate?: Date | null;
  board: string;
  project: string;
  assignee?: UserInfo;
  creator: UserInfo;
  lastModifier: UserInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface Board {
  _id: string;
  title: string;
  description?: string;
  owner: string | UserInfo;  // Can be string (ID) or UserInfo object
  members: UserInfo[];
  projects: Project[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
