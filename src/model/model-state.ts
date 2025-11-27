import type { JSONSchema7 } from 'json-schema'
import type { ModelInternalsNotGeneric } from './model'

export const modelsState = new Map<string, JSONSchema7>()
interface Options {
  readonly schema: JSONSchema7
  readonly justRef?: boolean
  readonly $internal: ModelInternalsNotGeneric
  readonly usedRefs?: Set<string>
}

/**
 * Sets model state in the global models state map and returns a schema reference.
 * When justRef is true, stores the schema in the global state and returns a $ref pointer.
 * When justRef is false, returns the schema directly. Tracks used references for schema generation.
 * @param options - Options for setting model state
 * @param options.schema - The JSON schema to store or return
 * @param options.justRef - Whether to return a reference instead of the full schema
 * @param options.$internal - The model internals containing the model ID
 * @param options.usedRefs - Optional set to track used reference IDs
 * @returns A JSON schema, either the full schema or a $ref pointer
 */
export function setModelState(
  options: Options,
): JSONSchema7 {
  const { schema, justRef, $internal, usedRefs } = options
  if (!justRef) {
    return schema
  }

  const ref = `#/$defs/${$internal.id}`
  modelsState.set($internal.id, schema)
  const newSchema: JSONSchema7 = {
    $ref: ref,
  }
  usedRefs?.add($internal.id)
  return newSchema
}
