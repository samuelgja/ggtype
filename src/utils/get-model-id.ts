let id = 0
/**
 * Generates a unique model ID using an incrementing counter.
 * Returns IDs in base-36 format for compact representation.
 * @group Utils
 * @internal
 * @returns A unique string ID for a model
 */
export function getModelId(): string {
  id++
  return id.toString(36)
}
