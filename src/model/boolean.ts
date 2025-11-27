import {
  copyModel,
  getBaseModel,
  getSchemaBase,
  type GetSchemaOptions,
  type Model,
} from './model'
import type { JSONSchema7 } from 'json-schema'
import { setModelState } from './model-state'

export interface BooleanModel<
  R extends boolean = false,
> extends Model<boolean, R> {
  /**
   * Marks the boolean model as required
   * @returns A new BooleanModel instance marked as required
   */
  readonly isRequired: () => BooleanModel<true>
  /**
   * Inferred TypeScript type for the boolean model (always boolean)
   */
  readonly infer: boolean
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new BooleanModel instance with the updated title
   */
  readonly title: (name: string) => BooleanModel<R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new BooleanModel instance with the updated description
   */
  readonly description: (
    description: string,
  ) => BooleanModel<R>
}

/**
 * Creates a boolean model for validation and type inference.
 * Returns a model that validates boolean values with optional required constraint.
 * @returns A BooleanModel instance for validating boolean values
 */
export function boolean(): BooleanModel<false> {
  const baseModel = getBaseModel<BooleanModel<false>>()
  const model: BooleanModel<false> = {
    ...baseModel,
    onParse: (data: unknown) => data as boolean,
    isRequired() {
      const copied = copyModel(
        this,
      ) as unknown as BooleanModel<true>
      copied.$internals.isRequired = true
      return copied
    },
    getSchema(options?: GetSchemaOptions) {
      const schema: JSONSchema7 = {
        type: 'boolean',
        ...getSchemaBase(this),
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
