import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock server-only to prevent it from throwing in Vitest
vi.mock('server-only', () => ({}));

import { FirestoreBaseRepository } from '@/repositories/FirestoreBaseRepository';
import * as admin from '@/lib/firebase/admin';

// Mock the admin module
vi.mock('@/lib/firebase/admin', () => {
  const mockGet = vi.fn();
  const mockSet = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  
  const mockDoc = vi.fn(() => ({
    get: mockGet,
    set: mockSet,
    update: mockUpdate,
    delete: mockDelete,
  }));
  
  const mockWhere = vi.fn();
  const mockOrderBy = vi.fn();
  const mockLimit = vi.fn();
  const mockCollectionGet = vi.fn();
  
  const mockCollection = vi.fn(() => {
    const chainable = {
      doc: mockDoc,
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockCollectionGet,
    };
    mockWhere.mockReturnValue(chainable);
    mockOrderBy.mockReturnValue(chainable);
    mockLimit.mockReturnValue(chainable);
    return chainable;
  });

  return {
    getAdminDb: vi.fn(() => ({
      collection: mockCollection
    })),
    __mocks: { mockGet, mockSet, mockUpdate, mockDelete, mockDoc, mockWhere, mockCollectionGet }
  };
});

describe('FirestoreBaseRepository - Server Side Authorization', () => {
  const mockAdmin = vi.mocked(admin) as any;
  const mocks = mockAdmin.__mocks;
  
  let repo: FirestoreBaseRepository<any>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    repo = new FirestoreBaseRepository('test_collection');
  });

  it('prevents querying without enforcing ownerId', async () => {
    mocks.mockCollectionGet.mockResolvedValueOnce({ forEach: vi.fn() });
    await repo.query({}, 'user_123');
    
    // Ensure that .where('userId', '==', 'user_123') was forcefully called
    expect(mocks.mockWhere).toHaveBeenCalledWith('userId', '==', 'user_123');
  });

  it('allows fetching a document if ownerId matches', async () => {
    mocks.mockGet.mockResolvedValueOnce({
      exists: true,
      id: 'doc_1',
      data: () => ({ userId: 'user_123', title: 'My Task' })
    });
    
    const doc = await repo.getById('doc_1', 'user_123');
    expect(doc).toEqual({ id: 'doc_1', userId: 'user_123', title: 'My Task' });
  });

  it('DENIES fetching a document if ownerId does NOT match', async () => {
    // Document belongs to hacker_999
    mocks.mockGet.mockResolvedValueOnce({
      exists: true,
      id: 'doc_1',
      data: () => ({ userId: 'hacker_999', title: 'Secret Task' })
    });
    
    // user_123 tries to read it
    await expect(repo.getById('doc_1', 'user_123')).rejects.toThrow(/Unauthorized access/);
  });

  it('forces ownerId on document creation', async () => {
    await repo.create('doc_2', { title: 'New Task', userId: 'spoofed_id' }, 'user_123');
    
    // Check what was passed to .set()
    const setCallArgs = mocks.mockSet.mock.calls[0][0];
    expect(setCallArgs.userId).toBe('user_123'); // Overwrote spoofed_id
    expect(setCallArgs.title).toBe('New Task');
  });

  it('DENIES updating a document if ownerId does NOT match', async () => {
    mocks.mockGet.mockResolvedValueOnce({
      exists: true,
      id: 'doc_1',
      data: () => ({ userId: 'user_123', title: 'Secret Task' })
    });
    
    // hacker_999 tries to update user_123's task
    await expect(repo.update('doc_1', { title: 'Hacked' }, 'hacker_999')).rejects.toThrow(/Unauthorized/);
    expect(mocks.mockUpdate).not.toHaveBeenCalled();
  });

  it('DENIES deleting a document if ownerId does NOT match', async () => {
    mocks.mockGet.mockResolvedValueOnce({
      exists: true,
      id: 'doc_1',
      data: () => ({ userId: 'user_123', title: 'Secret Task' })
    });
    
    // hacker_999 tries to delete user_123's task
    await expect(repo.delete('doc_1', 'hacker_999')).rejects.toThrow(/Unauthorized/);
    expect(mocks.mockDelete).not.toHaveBeenCalled();
  });
});
