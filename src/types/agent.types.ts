// ============================================================
// Agent Types
// ============================================================

export type AgentType = 'executive_agent' | 'developer_agent' | 'system';

export type IntentType =
  | 'TASK'
  | 'PROJECT'
  | 'IDEA'
  | 'DECISION'
  | 'DEVELOPMENT'
  | 'REPORT'
  | 'QUERY'
  | 'APPROVAL_RESPONSE'
  | 'SETTINGS'
  | 'UNKNOWN';

export type AgentStatus =
  | 'SUCCESS'
  | 'PARTIAL_SUCCESS'
  | 'FAILED'
  | 'BLOCKED'
  | 'WAITING_APPROVAL';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agentType?: AgentType;
  status?: AgentStatus;
  metadata?: Record<string, unknown>;
}

export interface AgentInput {
  message: string;
  userId: string;
  conversationHistory: Message[];
  context?: Record<string, unknown>;
}

export interface AgentOutput {
  response: string;
  intent: IntentType;
  status: AgentStatus;
  actionsPerformed: string[];
  approvalRequested?: string; // approvalId if approval was requested
  memoryUpdated: boolean;
  metadata?: Record<string, unknown>;
}

export interface ClassificationResult {
  intent: IntentType;
  confidence: number;
  entities: Record<string, unknown>;
  requiresApproval: boolean;
  suggestedTools: string[];
}

export interface PlanStep {
  id: string;
  description: string;
  toolName?: string;
  input?: Record<string, unknown>;
  requiresApproval: boolean;
  dependsOn?: string[]; // step ids
}

export interface AgentPlan {
  id: string;
  intent: IntentType;
  steps: PlanStep[];
  estimatedDuration?: number; // seconds
  createdAt: Date;
}

// Developer Agent specific
export type DevelopmentTaskStatus =
  | 'PENDING_ANALYSIS'
  | 'ANALYZING'
  | 'REPORT_READY'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'TESTS_RUNNING'
  | 'CHANGE_REPORT_READY'
  | 'PENDING_DEPLOYMENT_APPROVAL'
  | 'DEPLOYED'
  | 'REJECTED'
  | 'FAILED';

export interface DevelopmentTask {
  id: string;
  title: string;
  description: string;
  requestedBy: string; // userId
  status: DevelopmentTaskStatus;
  developmentReport?: DevelopmentReport;
  changeReport?: ChangeReport;
  approvalId?: string;
  deploymentApprovalId?: string;
  branchName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DevelopmentReport {
  problem: string;
  evidence: string[];
  rootCause: string;
  proposedSolution: string;
  filesAffected: string[];
  architectureImpact: string;
  databaseImpact: string;
  securityImpact: string;
  risks: string[];
  testingPlan: string;
  rollbackPlan: string;
  estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: string;
}

export interface ChangeReport {
  filesChanged: string[];
  filesAdded: string[];
  filesRemoved: string[];
  majorChanges: string[];
  testsExecuted: number;
  testsPassed: number;
  testsFailed: number;
  buildResult: 'SUCCESS' | 'FAILED';
  securityChecks: string[];
  knownLimitations: string[];
  remainingRisks: string[];
  rollbackInfo: string;
}
