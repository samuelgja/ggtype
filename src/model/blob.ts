import {
  copyModel,
  getBaseModel,
  getSchemaBase,
  type GetSchemaOptions,
  type Model,
} from './model'
import { isBlob } from '../utils/array-buffer-handler'
import type { JSONSchema7 } from 'json-schema'
import { setModelState } from './model-state'

export interface Blob<
  R extends boolean = true,
> extends Model<globalThis.Blob, R> {
  /**
   * Marks the blob model as optional
   * @returns A new Blob instance marked as optional
   */
  readonly isOptional: () => Blob<false>
  /**
   * Inferred TypeScript type for the blob model (always Blob)
   */
  readonly infer: globalThis.Blob
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new Blob instance with the updated title
   */
  readonly title: (name: string) => Blob<R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new Blob instance with the updated description
   */
  readonly description: (description: string) => Blob<R>
}

/**
 * Creates a blob model for validation and type inference.
 * Returns a model that validates Blob values, automatically converting ArrayBuffer
 * instances to Blob objects when needed. Supports optional required constraint.
 * @returns A Blob instance for validating Blob values
 * @example
 * ```ts
 * import { action, m } from 'ggtype'
 *
 * // Blob upload action
 * const uploadBlob = action(
 *   m.object({
 *     data: m.blob(), // Required by default
 *     type: m.string(),
 *   }),
 *   async ({ params }) => {
 *     // params.data is a Blob instance
 *     return { success: true, size: params.data.size }
 *   }
 * )
 * ```
 */
export function blob(): Blob<true> {
  const baseModel = getBaseModel<Blob<true>>()
  const model: Blob<true> = {
    ...baseModel,
    onParse: (data: unknown) => {
      if (isBlob(data)) return data as globalThis.Blob
      if (data instanceof globalThis.Blob) {
        return new globalThis.Blob([data])
      }
      if (data instanceof ArrayBuffer) {
        return new globalThis.Blob([data])
      }
      return data as globalThis.Blob
    },
    isOptional() {
      const copied = copyModel(
        this,
      ) as unknown as Blob<false>
      copied.$internals.isRequired = false
      return copied
    },

    getSchema(options?: GetSchemaOptions) {
      const schema: JSONSchema7 = {
        type: 'object',
        ...getSchemaBase(this),
        properties: {},
      }
      return setModelState({
        schema,
        $internal: this.$internals,
        ...options,
      })
    },
  }
  return model
}
