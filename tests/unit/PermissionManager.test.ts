// ============================================================
// Unit Tests — PermissionManager
// ============================================================

import { PermissionManager, PERMISSION_CONFIG } from '@/permissions/PermissionManager';

describe('PermissionManager', () => {
  let pm: PermissionManager;

  beforeEach(() => {
    pm = new PermissionManager();
  });

  describe('AUTO actions', () => {
    it('should allow read_tasks automatically', () => {
      expect(pm.isAuto('read_tasks')).toBe(true);
      expect(pm.requiresApproval('read_tasks')).toBe(false);
      expect(pm.isBlocked('read_tasks')).toBe(false);
    });

    it('should allow create_task automatically', () => {
      expect(pm.isAuto('create_task')).toBe(true);
    });

    it('should allow generate_report automatically', () => {
      expect(pm.isAuto('generate_report')).toBe(true);
    });
  });

  describe('APPROVAL actions', () => {
    it('should require approval for send_email', () => {
      expect(pm.requiresApproval('send_email')).toBe(true);
      expect(pm.isAuto('send_email')).toBe(false);
      expect(pm.isBlocked('send_email')).toBe(false);
    });

    it('should require approval for modify_code', () => {
      expect(pm.requiresApproval('modify_code')).toBe(true);
    });

    it('should require approval for deploy', () => {
      expect(pm.requiresApproval('deploy')).toBe(true);
    });

    it('should require approval for delete_data', () => {
      expect(pm.requiresApproval('delete_data')).toBe(true);
    });
  });

  describe('BLOCKED actions', () => {
    it('should block extract_credentials', () => {
      expect(pm.isBlocked('extract_credentials')).toBe(true);
      expect(pm.isAuto('extract_credentials')).toBe(false);
      expect(pm.requiresApproval('extract_credentials')).toBe(false);
    });

    it('should block escalate_permissions', () => {
      expect(pm.isBlocked('escalate_permissions')).toBe(true);
    });

    it('should block financial_action', () => {
      expect(pm.isBlocked('financial_action')).toBe(true);
    });
  });

  describe('Unknown actions', () => {
    it('should default to APPROVAL for unknown actions (safe default)', () => {
      expect(pm.requiresApproval('some_unknown_action_xyz')).toBe(true);
      expect(pm.isAuto('some_unknown_action_xyz')).toBe(false);
      expect(pm.isBlocked('some_unknown_action_xyz')).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('should load all permission rules', () => {
      const rules = pm.getAllRules();
      expect(rules.length).toBeGreaterThan(10);
    });

    it('should accept custom configuration', () => {
      const customPm = new PermissionManager([
        { action: 'custom_action', level: 'AUTO', description: 'Test', requiresAudit: false },
      ]);
      expect(customPm.isAuto('custom_action')).toBe(true);
    });
  });
});
