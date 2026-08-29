import { FirestoreBaseRepository } from './FirestoreBaseRepository';
import { Memory } from '@/types/models.types';

export class MemoryRepository extends FirestoreBaseRepository<Memory> {
  constructor() {
    super('memories');
  }

  async getMemoriesByUser(userId: string, limitCount = 20): Promise<Memory[]> {
    const memories = await this.query({
      where: [{ field: 'userId', operator: '==', value: userId }]
    });
    
    // Sort locally by importance
    memories.sort((a, b) => b.importance - a.importance);
    
    return memories.slice(0, limitCount);
  }
}
