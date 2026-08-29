export interface QueryOptions {
  where?: Array<{ field: string; operator: string; value: any }>;
  orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  limit?: number;
}

export interface DatabaseInterface<T> {
  create(id: string, data: Partial<T>, ownerId: string): Promise<T>;
  getById(id: string, ownerId: string): Promise<T | null>;
  update(id: string, data: Partial<T>, ownerId: string): Promise<T>;
  delete(id: string, ownerId: string): Promise<boolean>;
  query(options: QueryOptions, ownerId: string): Promise<T[]>;
}
