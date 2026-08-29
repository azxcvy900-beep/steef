'use server';

import { TaskRepository } from '@/repositories/TaskRepository';

export async function getUserTasks(userId: string) {
  const repo = new TaskRepository();
  const tasks = await repo.getTasksByUser(userId);
  return tasks;
}

export async function getActiveUserTasks(userId: string) {
  const repo = new TaskRepository();
  const tasks = await repo.getActiveTasksByUser(userId);
  return tasks;
}
