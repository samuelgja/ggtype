import type { ActionNotGeneric } from '../action/action'
import type { ModelNotGeneric } from '../model'
import type { JSONSchema7 } from 'json-schema'
import { AJV } from './compile-model'
import Standalone from 'ajv/dist/standalone'
import * as fs from 'node:fs'

/**
 * Options for schema compilation.
 * @group Utils
 * @internal
 */
interface CompileOptions {
  /**
   * Optional file path to write standalone validation code
   */
  readonly compilePath?: string
}

/**
 * Compiles a JSON schema into a validation function and optionally writes standalone code.
 * Uses AJV to compile the schema and can generate standalone validation code for use without AJV.
 * @param schema - The JSON schema to compile
 * @param options - Optional compilation options
 * @param options.compilePath - Optional file path to write standalone validation code
 * @returns The compiled AJV validation function
 */
function compileSchemaAndCheck(
  schema: JSONSchema7,
  options?: CompileOptions,
) {
  const { compilePath } = options || {}
  const validate = AJV.compile(schema)
  if (compilePath) {
    const code = Standalone(AJV, validate)
    fs.writeFileSync(compilePath, code)
  }
  return validate
}

/**
 * Compiles a set of actions into a JSON schema and generates standalone validation code.
 * Creates a schema from all action models and compiles it, optionally writing the standalone
 * validation code to a file for use without AJV dependency.
 * @group Utils
 * @internal
 * @template A - The actions record type
 * @param compilePath - File path to write the standalone validation code
 * @param actions - Record of actions to compile
 * @throws {Error} If an action is not found
 */
export function compileActions<
  A extends Record<string, ActionNotGeneric>,
>(compilePath: string, actions: A) {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {},
    additionalProperties: false,
  }
  for (const key in actions) {
    const action = actions[key]
    const model = action?.model as ModelNotGeneric
    if (!model) {
      throw new Error(`Action ${key} not found.`)
    }
    if (!schema.properties) {
      schema.properties = {}
    }
    schema.properties[key as string] = model.getSchema()
  }
  compileSchemaAndCheck(schema, { compilePath })
}
