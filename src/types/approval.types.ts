// ============================================================
// Approval System Types
// ============================================================

import type { AgentType } from './agent.types';

export type ApprovalStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export type ApprovalType =
  | 'DEVELOPMENT'
  | 'DEPLOYMENT'
  | 'EXTERNAL_ACTION'
  | 'PERMISSION_CHANGE'
  | 'DATA_DELETION'
  | 'INTEGRATION_CONNECT'
  | 'FINANCIAL'
  | 'COMMUNICATION';

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  title: string;
  description: string;
  reason: string;
  proposedBy: AgentType;
  status: ApprovalStatus;

  // Impact analysis
  affectedFiles?: string[];
  affectedServices?: string[];
  architectureImpact?: string;
  databaseImpact?: string;
  securityImpact?: string;
  risks?: string[];
  recommendation?: string;

  // Development-specific
  estimatedComplexity?: 'LOW' | 'MEDIUM' | 'HIGH';
  testingPlan?: string;
  rollbackPlan?: string;

  // Related entities
  relatedTaskId?: string;
  relatedProjectId?: string;
  developmentTaskId?: string;

  // Metadata
  requestedAt: Date;
  expiresAt: Date;
  respondedAt?: Date;
  responseNote?: string; // User's comment on rejection/modification
  userId: string;
}

export interface CreateApprovalInput {
  type: ApprovalType;
  title: string;
  description: string;
  reason: string;
  proposedBy: AgentType;
  affectedFiles?: string[];
  affectedServices?: string[];
  architectureImpact?: string;
  databaseImpact?: string;
  securityImpact?: string;
  risks?: string[];
  recommendation?: string;
  estimatedComplexity?: 'LOW' | 'MEDIUM' | 'HIGH';
  testingPlan?: string;
  rollbackPlan?: string;
  relatedTaskId?: string;
  relatedProjectId?: string;
  developmentTaskId?: string;
  expiresInDays?: number; // default 7
}

export interface ApprovalDecision {
  approvalId: string;
  decision: 'APPROVED' | 'REJECTED' | 'CANCELLED';
  note?: string;
}
