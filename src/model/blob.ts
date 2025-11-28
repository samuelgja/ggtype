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

export interface BlobModel<
  R extends boolean = false,
> extends Model<Blob, R> {
  /**
   * Marks the blob model as required
   * @returns A new BlobModel instance marked as required
   */
  readonly isRequired: () => BlobModel<true>
  /**
   * Inferred TypeScript type for the blob model (always Blob)
   */
  readonly infer: Blob
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new BlobModel instance with the updated title
   */
  readonly title: (name: string) => BlobModel<R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new BlobModel instance with the updated description
   */
  readonly description: (
    description: string,
  ) => BlobModel<R>
}

/**
 * Creates a blob model for validation and type inference.
 * Returns a model that validates Blob values, automatically converting ArrayBuffer
 * instances to Blob objects when needed. Supports optional required constraint.
 * @returns A BlobModel instance for validating Blob values
 * @example
 * ```ts
 * import { action, m } from 'ggtype'
 *
 * // Blob upload action
 * const uploadBlob = action(
 *   m.object({
 *     data: m.blob().isRequired(),
 *     type: m.string().isRequired(),
 *   }),
 *   async ({ params }) => {
 *     // params.data is a Blob instance
 *     return { success: true, size: params.data.size }
 *   }
 * )
 * ```
 */
export function blob(): BlobModel<false> {
  const baseModel = getBaseModel<BlobModel<false>>()
  const model: BlobModel<false> = {
    ...baseModel,
    onParse: (data: unknown) => {
      if (isBlob(data)) return data as Blob
      if (data instanceof Blob) {
        return new Blob([data])
      }
      if (data instanceof ArrayBuffer) {
        return new Blob([data])
      }
      return data as Blob
    },
    isRequired() {
      const copied = copyModel(
        this,
      ) as unknown as BlobModel<true>
      copied.$internals.isRequired = true
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
