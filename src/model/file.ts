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
  R extends boolean = false,
> extends Model<File, R> {
  /**
   * Marks the file model as required
   * @returns A new FileModel instance marked as required
   */
  readonly isRequired: () => FileModel<true>
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
 */
export function file(): FileModel<false> {
  const baseModel = getBaseModel<FileModel<false>>()
  const model: FileModel<false> = {
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
    isRequired() {
      const copied = copyModel(
        this,
      ) as unknown as FileModel<true>
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
