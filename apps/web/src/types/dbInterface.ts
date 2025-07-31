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
