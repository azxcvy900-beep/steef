import 'server-only';
import { getAdminDb } from '@/lib/firebase/admin';
import { DatabaseInterface, QueryOptions } from './DatabaseInterface';
import { WhereFilterOp } from 'firebase-admin/firestore';

export class FirestoreBaseRepository<T> implements DatabaseInterface<T> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  async create(id: string, data: Partial<T>, ownerId: string): Promise<T> {
    const adminDb = getAdminDb();
    const docRef = adminDb.collection(this.collectionName).doc(id);
    const now = new Date();
    const payload = {
      ...data,
      userId: ownerId, // Forcefully inject ownerId to prevent spoofing
      createdAt: now,
      updatedAt: now,
    };
    await docRef.set(payload);
    return { id, ...payload } as unknown as T;
  }

  async getById(id: string, ownerId: string): Promise<T | null> {
    const adminDb = getAdminDb();
    const docRef = adminDb.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return null;
    }
    
    const data = docSnap.data();
    // Server-side Authorization Check
    if (data?.userId !== ownerId) {
      throw new Error(`Unauthorized access to document ${id} in ${this.collectionName}`);
    }
    
    return { id: docSnap.id, ...data } as T;
  }

  async update(id: string, data: Partial<T>, ownerId: string): Promise<T> {
    const adminDb = getAdminDb();
    // First fetch to verify ownership
    await this.getById(id, ownerId);

    const docRef = adminDb.collection(this.collectionName).doc(id);
    const payload = {
      ...data,
      // Prevent changing the userId
      userId: ownerId,
      updatedAt: new Date(),
    };
    await docRef.update(payload);
    
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as T;
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const adminDb = getAdminDb();
    // First fetch to verify ownership
    await this.getById(id, ownerId);

    const docRef = adminDb.collection(this.collectionName).doc(id);
    await docRef.delete();
    return true;
  }

  async query(options: QueryOptions, ownerId: string): Promise<T[]> {
    const adminDb = getAdminDb();
    let q: FirebaseFirestore.Query = adminDb.collection(this.collectionName);

    // Forcefully apply authorization filter
    q = q.where('userId', '==', ownerId);

    if (options.where) {
      options.where.forEach(clause => {
        // Skip adding userId again if it's already there
        if (clause.field !== 'userId') {
          q = q.where(clause.field, clause.operator as WhereFilterOp, clause.value);
        }
      });
    }

    if (options.orderBy) {
      options.orderBy.forEach(order => {
        q = q.orderBy(order.field, order.direction);
      });
    }

    if (options.limit) {
      q = q.limit(options.limit);
    }

    const querySnapshot = await q.get();
    const results: T[] = [];
    
    querySnapshot.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() } as T);
    });

    return results;
  }
}
