// ============================================================
// AuditLogger — records every important agent action
// ============================================================

import type { AuditLogEntry } from '@/types/report.types';

type AuditStatus = 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'BLOCKED' | 'WAITING_APPROVAL';

interface LogActionParams {
  userId: string;
  actor: string;
  agentType: string;
  tool?: string;
  action: string;
  summarizedInput?: string;
  summarizedOutput?: string;
  status: AuditStatus;
  approvalId?: string;
  relatedTaskId?: string;
  relatedProjectId?: string;
}

/**
 * AuditLogger records all important system actions.
 * Phase 1: logs to console + in-memory buffer.
 * Phase 3+: persists to Firestore.
 */
export class AuditLogger {
  private static buffer: AuditLogEntry[] = [];
  private static maxBufferSize = 500;

  static async log(params: LogActionParams): Promise<void> {
    const entry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      userId: params.userId,
      timestamp: new Date(),
      actor: params.actor,
      agentType: params.agentType,
      tool: params.tool,
      action: params.action,
      summarizedInput: params.summarizedInput,
      summarizedOutput: params.summarizedOutput,
      status: params.status,
      approvalId: params.approvalId,
      relatedTaskId: params.relatedTaskId,
      relatedProjectId: params.relatedProjectId,
    };

    // Console log for development visibility
    const emoji = {
      SUCCESS: '✅',
      PARTIAL_SUCCESS: '⚠️',
      FAILED: '❌',
      BLOCKED: '🚫',
      WAITING_APPROVAL: '⏳',
    }[params.status];

    console.log(
      `[AUDIT] ${emoji} [${params.agentType}] ${params.action}` +
        (params.tool ? ` via ${params.tool}` : '') +
        ` | status: ${params.status}`
    );

    // Buffer for in-memory access
    this.buffer.push(entry);
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift(); // Remove oldest
    }

    // TODO Phase 3: await AuditRepository.create(entry);
  }

  static getRecentLogs(limit = 50): AuditLogEntry[] {
    return this.buffer.slice(-limit).reverse();
  }

  static clearBuffer(): void {
    this.buffer = [];
  }
}
