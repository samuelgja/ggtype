import { m } from '../..'
import { compileTestModel } from '../../utils/compile-model'
import { number } from '../number'
import { object } from '../object'
import { record } from '../record'
import { string } from '../string'

describe('record as objects', () => {
  it('should test record', () => {
    const user = object({
      name: string(),
      age: number(),
    })
    const model = record(user)
    const isValid = model.onParse({
      john: { name: 'John', age: 20 },
      jane: { name: 'Jane', age: 18 },
    })
    expect(isValid).toEqual({
      john: { name: 'John', age: 20 },
      jane: { name: 'Jane', age: 18 },
    })

    const isParsed = compileTestModel(model)({
      john: { name: 'John', age: 20 },
      jane: { name: 'Jane', age: 18 },
    })
    expect(isParsed).toBe(true)

    const isInvalid = compileTestModel(model)({
      john: { name: 'John', age: 20 },
      jane: { name: 'Jane', age: 18 },
      invalid: { s: 'Invalid' },
    } as never)
    expect(isInvalid).toBe(false)
  })

  it('should test record parse inside another object model', () => {
    const user = object({
      name: string(),
      age: number(),
    })
    const model = object({
      users: record(user),
    })
    const isValid = compileTestModel(model)({
      users: {
        john: { name: 'John', age: 20 },
        jane: { name: 'Jane', age: 18 },
      },
    })
    expect(isValid).toBe(true)

    const isInvalid = compileTestModel(model)({
      users: {
        john: { name: 'John', age: 20 },
        jane: { name: 'Jane', age: 18 },
        invalid: { s: 'Invalid' },
      } as never,
    })
    expect(isInvalid).toBe(false)
  })
  it('should test record nested with object', () => {
    const nestedUser = m
      .object({
        omg: m.boolean(),
      })
      
    const omg = m
      .record(
        m
          .object({
            user: m.string(),
            nestedUser,
          })
          ,
      )
      
    const isValid = compileTestModel(omg)({
      john: { user: '2' },
    })
    expect(isValid).toBe(true)
  })
  it('should validate not based object record', () => {
    const idType = m.string()
    const nameModel = m.string()
    const nodeTypeEnum = m.enums('llm', 'text')
    const provider = m.object({
      model: m.string(),
    })
    const systemPromptModel = m.string()
    const jsonSchema = m.string()
    const llmNode = m
      .object({
        id: idType,
        name: nameModel,
        type: nodeTypeEnum.only('llm'),
        provider,
        system: systemPromptModel,
        // settings: llmNodeSettings,
        nextId: idType,
        parametersJsonSchema: jsonSchema,
      })
      

    const isValid = compileTestModel(llmNode)({
      id: '1',
      name: 'Ask LLM',
      type: 'llm',
      provider: {
        model: 'gpt-4o',
      },
      system: 'You are a helpful assistant.',

      nextId: '2',
      parametersJsonSchema: '{}',
    })
    expect(isValid).toBe(true)

    const recordModel = m.record(llmNode)
    const isRecordValid = compileTestModel(recordModel)({
      '1': {
        id: '1',
        name: 'Ask LLM',
        type: 'llm',
        provider: {
          model: 'gpt-4o',
        },
        system: 'You are a helpful assistant.',

        nextId: '2',
        parametersJsonSchema: '{}',
      },
    })
    expect(isRecordValid).toBe(true)
  })
})
