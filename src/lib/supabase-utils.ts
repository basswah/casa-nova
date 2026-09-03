import type { ZodSchema } from 'zod';

/**
 * Safely cast Supabase query result to an array, optionally validating
 * each item against a Zod schema at runtime.
 */
export function toArray<T>(data: unknown, schema?: ZodSchema<T>): T[] {
  if (!data || !Array.isArray(data)) return [];
  if (!schema) return data as T[];
  const parsed = schema.array().safeParse(data);
  if (!parsed.success) {
    console.warn('[toArray] Validation failed, returning raw data:', parsed.error.flatten());
    return data as T[];
  }
  return parsed.data;
}

/**
 * Safely cast Supabase query result to a single object, optionally
 * validating against a Zod schema at runtime.
 */
export function toSingle<T>(data: unknown, schema?: ZodSchema<T>): T {
  if (!schema) return data as T;
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    console.warn('[toSingle] Validation failed, returning raw data:', parsed.error.flatten());
    return data as T;
  }
  return parsed.data;
}

/** Default timeout for standard Supabase requests (ms). */
export const DEFAULT_TIMEOUT_MS = 15000;
/** Timeout for heavier operations (bulk updates, multi-step RPCs). */
export const HEAVY_TIMEOUT_MS = 30000;

/**
 * Races a promise against a timeout so hung network requests reject cleanly
 * instead of leaving the UI stuck forever.
 */
export function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number = DEFAULT_TIMEOUT_MS,
  label = 'Request',
): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}
