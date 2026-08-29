// ============================================================
// Report Types
// ============================================================

import type { Task, Project } from './task.types';

export interface DailyReport {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  type: 'DAILY';

  // Tasks summary
  completedTasks: Task[];
  pendingTasks: Task[];
  delayedTasks: Task[];

  // Projects
  activeProjects: ProjectProgress[];

  // Narrative sections
  problems: string[];
  importantDecisions: string[];
  pendingApprovals: string[];
  achievements: string[];
  risks: string[];
  tomorrowPriorities: string[];
  recommendations: string[];

  // Sync status
  syncedToSheets: boolean;
  syncedAt?: Date;

  createdAt: Date;
}

export interface ProjectProgress {
  project: Project;
  completionPercentage: number;
  recentActivity: string[];
  blockers: string[];
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  timestamp: Date;
  actor: string; // 'user' | agent name
  agentType: string;
  tool?: string;
  action: string;
  summarizedInput?: string;
  summarizedOutput?: string;
  status: string;
  approvalId?: string;
  relatedTaskId?: string;
  relatedProjectId?: string;
}
