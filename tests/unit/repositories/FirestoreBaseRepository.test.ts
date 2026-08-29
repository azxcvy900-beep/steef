import { describe, it, expect, vi } from 'vitest';
import { FirestoreBaseRepository } from '@/repositories/FirestoreBaseRepository';
import { db } from '@/lib/firebase/client';

// Mock Firebase
vi.mock('@/lib/firebase/client', () => ({
  db: {}
}));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn().mockResolvedValue({ exists: () => true, id: 'test-id', data: () => ({ name: 'test' }) }),
  setDoc: vi.fn().mockResolvedValue(undefined),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  deleteDoc: vi.fn().mockResolvedValue(undefined),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({ docs: [] }),
}));

describe('FirestoreBaseRepository', () => {
  it('should initialize with collection name', () => {
    class TestRepo extends FirestoreBaseRepository<any> {
      constructor() { super('test_collection'); }
      getColName() { return this.collectionName; }
    }
    const repo = new TestRepo();
    expect(repo.getColName()).toBe('test_collection');
  });

  it('should call getDoc when get is called', async () => {
    const repo = new FirestoreBaseRepository<any>('test');
    const result = await repo.get('test-id');
    expect(result).toHaveProperty('id', 'test-id');
    expect(result).toHaveProperty('name', 'test');
  });
});
