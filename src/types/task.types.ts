// ============================================================
// Task & Project Types
// ============================================================

export type TaskStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DELAYED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  priority: Priority;
  status: TaskStatus;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  userId: string;
  tags?: string[];
  notes?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId?: string;
  priority?: Priority;
  deadline?: Date;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  deadline?: Date;
  tags?: string[];
  notes?: string;
}

export type ProjectStatus =
  | 'PLANNING'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED';

export interface Project {
  id: string;
  name: string;
  description: string;
  objectives: string[];
  status: ProjectStatus;
  priority: Priority;
  tasks: string[]; // task IDs
  problems: string[];
  decisions: string[];
  achievements: string[];
  relatedFiles: string[];
  relatedIntegrations: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  objectives?: string[];
  priority?: Priority;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  status: 'RAW' | 'REFINED' | 'CONVERTED' | 'DISCARDED';
  priority: Priority;
  potentialProject?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  reasoning: string;
  outcome?: string;
  relatedProjectId?: string;
  relatedTaskId?: string;
  createdAt: Date;
  userId: string;
}
