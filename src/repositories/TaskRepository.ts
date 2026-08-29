import { FirestoreBaseRepository } from './FirestoreBaseRepository';
import { Task } from '@/types/models.types';

export class TaskRepository extends FirestoreBaseRepository<Task> {
  constructor() {
    super('tasks');
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    const tasks = await this.query({
      where: [{ field: 'userId', operator: '==', value: userId }]
    }, userId); // Pass userId for authorization
    
    return tasks.sort((a, b) => {
      const timeA = (a.createdAt as any)?.seconds || (a.createdAt as any)?._seconds || 0;
      const timeB = (b.createdAt as any)?.seconds || (b.createdAt as any)?._seconds || 0;
      return timeB - timeA;
    });
  }

  async getActiveTasksByUser(userId: string): Promise<Task[]> {
    const allTasks = await this.getTasksByUser(userId);
    return allTasks.filter(task => task.status !== 'DONE');
  }
}
