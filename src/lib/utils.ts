// ============================================================
// lib/utils.ts — Shared utility functions
// ============================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a unique ID */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Format a Date for Arabic display */
export function formatDateAr(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Format relative time in Arabic */
export function formatRelativeAr(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days === 1) return 'أمس';
  if (days < 7) return `منذ ${days} أيام`;
  return formatDateAr(d);
}

/** Priority labels in Arabic */
export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'منخفضة',
  MEDIUM: 'متوسطة',
  HIGH: 'عالية',
  CRITICAL: 'حرجة',
};

/** Status labels in Arabic */
export const TASK_STATUS_LABELS: Record<string, string> = {
  PENDING: 'معلق',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغى',
  DELAYED: 'متأخر',
};

/** Approval status labels in Arabic */
export const APPROVAL_STATUS_LABELS: Record<string, string> = {
  PENDING_APPROVAL: 'بانتظار الموافقة',
  APPROVED: 'موافق عليه',
  REJECTED: 'مرفوض',
  CANCELLED: 'ملغى',
  EXPIRED: 'منتهي الصلاحية',
};
