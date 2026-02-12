/**
 * Chunks an array into batches of given size.
 * Memory-efficient generator to avoid duplicating large arrays.
 */

export function* chunk<T>(arr: T[], size: number): Generator<T[]> {
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size);
  }
}
