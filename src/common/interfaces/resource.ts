export interface ResourceInterface<T> {
  item: object;
  toJson(): T;
  // collection(items: any[]): T[];
  extractObject(data?: object): T;
}
