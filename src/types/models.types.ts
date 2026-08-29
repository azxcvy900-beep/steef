export interface User {
  id: string;
  name: string;
  preferences: Record<string, unknown>;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Task {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type MemoryType = 'FACT' | 'PREFERENCE';

export interface Memory {
  id: string;
  userId: string;
  type: MemoryType;
  content: string;
  importance: number; // 1-5
  createdAt: Date;
  updatedAt: Date;
}

export interface Idea {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
