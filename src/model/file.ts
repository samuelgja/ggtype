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

export interface FileModel<
  R extends boolean = true,
> extends Model<File, R> {
  /**
   * Marks the file model as optional
   * @returns A new FileModel instance marked as optional
   */
  readonly isOptional: () => FileModel<false>
  /**
   * Inferred TypeScript type for the file model (always File)
   */
  readonly infer: File
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new FileModel instance with the updated title
   */
  readonly title: (name: string) => FileModel<R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new FileModel instance with the updated description
   */
  readonly description: (
    description: string,
  ) => FileModel<R>
}

/**
 * Creates a file model for validation and type inference.
 * Returns a model that validates File values, automatically converting Blob and ArrayBuffer
 * instances to File objects when needed. Supports optional required constraint.
 * @returns A FileModel instance for validating File values
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
export function file(): FileModel<true> {
  const baseModel = getBaseModel<FileModel<true>>()
  const model: FileModel<true> = {
    ...baseModel,
    onParse: (data: unknown) => {
      if (isFile(data)) return data as File
      if (data instanceof Blob) {
        return new File([data], 'file', {
          type: data.type,
        }) as File
      }
      if (data instanceof ArrayBuffer) {
        return new File([data], 'file', {
          type: 'application/octet-stream',
        }) as File
      }
      return data as File
    },
    isOptional() {
      const copied = copyModel(
        this,
      ) as unknown as FileModel<false>
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
