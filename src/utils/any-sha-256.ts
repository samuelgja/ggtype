import { createHash } from 'node:crypto'

/**
 * Generates a SHA-256 hash of any data by JSON stringifying it first.
 * Useful for creating deterministic hashes of objects for caching or comparison.
 * @group Utils
 * @internal
 * @param data - The data to hash (will be JSON stringified)
 * @returns A hexadecimal SHA-256 hash string
 */
export function anySha256(data: unknown): string {
  const hash = createHash('sha256')
  hash.update(JSON.stringify(data))
  return hash.digest('hex')
}
