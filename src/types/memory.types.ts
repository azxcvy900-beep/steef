// ============================================================
// Memory System Types
// ============================================================

export interface UserMemory {
  userId: string;
  name: string;
  preferences: {
    language: 'ar' | 'en';
    communicationStyle: 'formal' | 'casual';
    timezone: string;
    workingHours?: { start: string; end: string };
  };
  knownFacts: MemoryFact[];
  updatedAt: Date;
}

export interface MemoryFact {
  key: string;
  value: string;
  confidence: number; // 0-1
  source: string; // conversation turn or explicit
  createdAt: Date;
}

export interface ActivityMemoryEntry {
  id: string;
  userId: string;
  timestamp: Date;
  description: string;
  agentType: string;
  tool?: string;
  action: string;
  status: string;
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
  relatedTaskId?: string;
  relatedProjectId?: string;
}

export interface MemoryRetrievalQuery {
  userId: string;
  query: string;
  types?: ('user' | 'project' | 'task' | 'idea' | 'decision' | 'activity')[];
  limit?: number;
  projectId?: string;
}

export interface MemoryContext {
  userMemory?: UserMemory;
  relevantTasks?: import('./task.types').Task[];
  relevantProjects?: import('./task.types').Project[];
  relevantDecisions?: import('./task.types').Decision[];
  recentActivity?: ActivityMemoryEntry[];
}
