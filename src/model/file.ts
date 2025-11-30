import {
  copyModel,
  getBaseModel,
  getSchemaBase,
  type GetSchemaOptions,
  type Model,
} from './model'
import { isFile } from '../utils/array-buffer-handler'
import type { JSONSchema7 } from 'json-schema'
import { setModelState } from './model-state'

export interface File<
  R extends boolean = true,
> extends Model<globalThis.File, R> {
  /**
   * Marks the file model as optional
   * @returns A new File instance marked as optional
   */
  readonly isOptional: () => File<false>
  /**
   * Inferred TypeScript type for the file model (always File)
   */
  readonly infer: globalThis.File
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new File instance with the updated title
   */
  readonly title: (name: string) => File<R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new File instance with the updated description
   */
  readonly description: (description: string) => File<R>
}

/**
 * Creates a file model for validation and type inference.
 * Returns a model that validates File values, automatically converting Blob and ArrayBuffer
 * instances to File objects when needed. Supports optional required constraint.
 * @returns A File instance for validating File values
 * @example
 * ```ts
 * import { action, m } from 'ggtype'
 *
 * // File upload action
 * const uploadFile = action(
 *   m.object({
 *     file: m.file(), // Required by default
 *     name: m.string(),
 *   }),
 *   async ({ params }) => {
 *     // params.file is a File instance
 *     return { success: true, size: params.file.size }
 *   }
 * )
 * ```
 */
export function file(): File<true> {
  const baseModel = getBaseModel<File<true>>()
  const model: File<true> = {
    ...baseModel,
    onParse: (data: unknown) => {
      if (isFile(data)) return data as globalThis.File
      if (data instanceof Blob) {
        return new globalThis.File([data], 'file', {
          type: data.type,
        }) as globalThis.File
      }
      if (data instanceof ArrayBuffer) {
        return new globalThis.File([data], 'file', {
          type: 'application/octet-stream',
        }) as globalThis.File
      }
      return data as globalThis.File
    },
    isOptional() {
      const copied = copyModel(
        this,
      ) as unknown as File<false>
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
