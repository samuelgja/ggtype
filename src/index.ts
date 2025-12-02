export * as m from './model'
export * from './action/action'
export * from './types'
export * from './utils/compile-model'
export * from './utils/errors'
export * from './utils/is'
export * from './utils/handle-error'
/**
 * Extracts the inferred TypeScript type from a model.
 * This utility type extracts the runtime type that a model validates.
 * @group Utils
 * @template T - The model type with an `infer` property
 * @example
 * ```ts
 * import { m, type Infer } from 'ggtype'
 *
 * const userModel = m.object({
 *   id: m.string(),
 *   name: m.string(),
 *   age: m.number().isOptional(),
 * }).isOptional()
 *
 * // Extract the TypeScript type
 * type User = Infer<typeof userModel>
 * // Result: { id: string; name: string; age?: number }
 * ```
 */
export type Infer<T extends { infer: unknown }> = T['infer']
