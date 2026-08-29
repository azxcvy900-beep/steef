import { db } from '@/lib/firebase/client';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query as firestoreQuery,
  where as firestoreWhere,
  orderBy as firestoreOrderBy,
  limit as firestoreLimit,
  getDocs,
  WhereFilterOp,
} from 'firebase/firestore';
import { DatabaseInterface, QueryOptions } from './DatabaseInterface';

export class FirestoreBaseRepository<T> implements DatabaseInterface<T> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  async create(id: string, data: Partial<T>): Promise<T> {
    const docRef = doc(db, this.collectionName, id);
    const now = new Date();
    const docData = { ...data, createdAt: now, updatedAt: now };
    await setDoc(docRef, docData);
    return { id, ...docData } as unknown as T;
  }

  async get(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as unknown as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const docRef = doc(db, this.collectionName, id);
    const updateData = { ...data, updatedAt: new Date() };
    await updateDoc(docRef, updateData as any);
    const updated = await this.get(id);
    return updated as T;
  }

  async delete(id: string): Promise<boolean> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
    return true;
  }

  async query(options: QueryOptions): Promise<T[]> {
    const colRef = collection(db, this.collectionName);
    const constraints: any[] = [];

    if (options.where) {
      options.where.forEach((w) => {
        constraints.push(firestoreWhere(w.field, w.operator as WhereFilterOp, w.value));
      });
    }

    if (options.orderBy) {
      options.orderBy.forEach((o) => {
        constraints.push(firestoreOrderBy(o.field, o.direction));
      });
    }

    if (options.limit) {
      constraints.push(firestoreLimit(options.limit));
    }

    const q = firestoreQuery(colRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as unknown as T);
  }
}
