export function toArray<T>(data: unknown): T[] {
  if (!data) return [];
  return data as T[];
}

export function toSingle<T>(data: unknown): T {
  return data as T;
}
