import { nanoid } from 'nanoid'
import { ID_LENGTH } from './array-buffer-handler'

/**
 * Creates a unique identifier using a simple incrementing counter.
 * Uses base36 encoding for compact representation.
 * @group Utils
 * @internal
 * @returns A unique string identifier
 */
export function createId(): string {
  return nanoid(ID_LENGTH)
}
