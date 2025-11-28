let idCounter = 0

/**
 * Creates a unique identifier using a simple incrementing counter.
 * Uses base36 encoding for compact representation.
 * @group Utils
 * @internal
 * @returns A unique string identifier
 */
export function createId(): string {
  idCounter++
  return idCounter.toString(36)
}
