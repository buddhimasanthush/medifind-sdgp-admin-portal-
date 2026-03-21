/**
 * Converts any Date objects in a record (or array of records) to ISO strings.
 * Required because Drizzle returns timestamp columns as Date objects,
 * but the Zod schemas generated from the OpenAPI spec expect string values.
 */
export function serializeDates<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = value instanceof Date ? value.toISOString() : value;
  }
  return result as T;
}

export function serializeDatesArray<T extends Record<string, unknown>>(arr: T[]): T[] {
  return arr.map(serializeDates);
}
