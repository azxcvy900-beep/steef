import { FirestoreBaseRepository } from './FirestoreBaseRepository';
import { Task } from '@/types/models.types';

export class TaskRepository extends FirestoreBaseRepository<Task> {
  constructor() {
    super('tasks');
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    // Fetch by userId and sort locally to avoid requiring a composite index
    // (userId ASC, createdAt DESC) which would block the build.
    const tasks = await this.query({
      where: [{ field: 'userId', operator: '==', value: userId }]
    });
    return tasks.sort((a, b) => {
      const timeA = (a.createdAt as any)?.seconds || 0;
      const timeB = (b.createdAt as any)?.seconds || 0;
      return timeB - timeA;
    });
  }

  async getActiveTasksByUser(userId: string): Promise<Task[]> {
    // Fetch all tasks by user and filter locally to avoid requiring a composite index
    // (userId ASC, status ASC) which would block the build.
    const allTasks = await this.getTasksByUser(userId);
    return allTasks.filter(task => task.status !== 'DONE');
  }
}
