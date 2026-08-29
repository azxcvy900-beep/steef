export interface QueryOptions {
  where?: Array<{ field: string; operator: string; value: any }>;
  orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  limit?: number;
}

export interface DatabaseInterface<T> {
  create(id: string, data: Partial<T>): Promise<T>;
  get(id: string): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  query(options: QueryOptions): Promise<T[]>;
}
