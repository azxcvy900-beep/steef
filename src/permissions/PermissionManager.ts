// ============================================================
// Permission System
// ============================================================

export type Permission =
  | 'READ'
  | 'WRITE'
  | 'DELETE'
  | 'SEND'
  | 'EXECUTE'
  | 'DEPLOY';

export type PermissionLevel = 'AUTO' | 'APPROVAL' | 'BLOCKED';

export interface PermissionRule {
  action: string;       // e.g. "send_email", "modify_code"
  level: PermissionLevel;
  description: string;
  requiresAudit: boolean;
}

/**
 * Master permission configuration.
 * AUTO    → Execute immediately, log to audit.
 * APPROVAL → Create ApprovalRequest, wait for user.
 * BLOCKED  → Never execute, explain refusal.
 */
export const PERMISSION_CONFIG: PermissionRule[] = [
  // AUTO — Safe read / internal operations
  { action: 'read_tasks',          level: 'AUTO',     description: 'Read tasks from database',            requiresAudit: false },
  { action: 'read_projects',       level: 'AUTO',     description: 'Read projects from database',         requiresAudit: false },
  { action: 'read_ideas',          level: 'AUTO',     description: 'Read ideas from database',            requiresAudit: false },
  { action: 'read_decisions',      level: 'AUTO',     description: 'Read decisions from database',        requiresAudit: false },
  { action: 'create_task',         level: 'AUTO',     description: 'Create a new task',                   requiresAudit: true  },
  { action: 'update_task',         level: 'AUTO',     description: 'Update task status or details',       requiresAudit: true  },
  { action: 'create_project',      level: 'AUTO',     description: 'Create a new project',                requiresAudit: true  },
  { action: 'create_idea',         level: 'AUTO',     description: 'Store a new idea',                    requiresAudit: true  },
  { action: 'create_decision',     level: 'AUTO',     description: 'Record a decision',                   requiresAudit: true  },
  { action: 'generate_report',     level: 'AUTO',     description: 'Generate internal report',            requiresAudit: true  },
  { action: 'search_web',          level: 'AUTO',     description: 'Search the web for information',      requiresAudit: true  },
  { action: 'summarize',           level: 'AUTO',     description: 'Summarize content',                   requiresAudit: false },

  // APPROVAL — External / impactful operations
  { action: 'send_email',          level: 'APPROVAL', description: 'Send an email on behalf of user',     requiresAudit: true  },
  { action: 'modify_code',         level: 'APPROVAL', description: 'Modify source code files',            requiresAudit: true  },
  { action: 'delete_code',         level: 'APPROVAL', description: 'Delete source code files',            requiresAudit: true  },
  { action: 'install_dependency',  level: 'APPROVAL', description: 'Install npm/pip package',             requiresAudit: true  },
  { action: 'deploy',              level: 'APPROVAL', description: 'Deploy to production',                requiresAudit: true  },
  { action: 'publish_content',     level: 'APPROVAL', description: 'Publish content externally',          requiresAudit: true  },
  { action: 'write_google_sheets', level: 'APPROVAL', description: 'Write data to Google Sheets',         requiresAudit: true  },
  { action: 'change_schema',       level: 'APPROVAL', description: 'Modify database schema',              requiresAudit: true  },
  { action: 'change_security',     level: 'APPROVAL', description: 'Change security rules/auth',          requiresAudit: true  },
  { action: 'connect_service',     level: 'APPROVAL', description: 'Connect a new external service',      requiresAudit: true  },
  { action: 'delete_data',         level: 'APPROVAL', description: 'Delete important data',               requiresAudit: true  },
  { action: 'grant_permission',    level: 'APPROVAL', description: 'Grant new permissions',               requiresAudit: true  },
  { action: 'change_config',       level: 'APPROVAL', description: 'Change production configuration',     requiresAudit: true  },

  // BLOCKED — Never allowed
  { action: 'extract_credentials', level: 'BLOCKED',  description: 'Extract API keys or passwords',       requiresAudit: true  },
  { action: 'escalate_permissions',level: 'BLOCKED',  description: 'Escalate own permissions',            requiresAudit: true  },
  { action: 'financial_action',    level: 'BLOCKED',  description: 'Unauthorized financial operations',   requiresAudit: true  },
  { action: 'destructive_security',level: 'BLOCKED',  description: 'Destructive security operations',     requiresAudit: true  },
];

export class PermissionManager {
  private rules: Map<string, PermissionRule>;

  constructor(config: PermissionRule[] = PERMISSION_CONFIG) {
    this.rules = new Map(config.map((r) => [r.action, r]));
  }

  check(action: string): PermissionRule {
    const rule = this.rules.get(action);
    if (!rule) {
      // Unknown actions default to APPROVAL (safe default)
      return {
        action,
        level: 'APPROVAL',
        description: `Unknown action: ${action}`,
        requiresAudit: true,
      };
    }
    return rule;
  }

  isAuto(action: string): boolean {
    return this.check(action).level === 'AUTO';
  }

  requiresApproval(action: string): boolean {
    return this.check(action).level === 'APPROVAL';
  }

  isBlocked(action: string): boolean {
    return this.check(action).level === 'BLOCKED';
  }

  getAllRules(): PermissionRule[] {
    return Array.from(this.rules.values());
  }
}

// Singleton instance
export const permissionManager = new PermissionManager();
