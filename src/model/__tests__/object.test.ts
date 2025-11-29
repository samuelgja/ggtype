import { compileTestModel } from '../../utils/compile-model'
import { number } from '../number'
import { object } from '../object'
import { string } from '../string'

describe('object', () => {
  it('should parse object', () => {
    const model = object({
      name: string(),
      age: number(),
    })
    const isValid = compileTestModel(model)({
      age: 2,
      name: 'test',
    })
    expect(isValid).toBe(true)
    expect(model.getSchema()).toMatchSnapshot()
  })
  it('should parse object with maximum and minimum keys', () => {
    const model = object({
      name: string(),
      age: number(),
    })
      .maxKeys(10)
      .minKeys(1)
      
    const isValid = compileTestModel(model)({
      age: 2,
      name: 'test',
    })
    expect(isValid).toBe(true)
    expect(model.getSchema()).toMatchSnapshot()

    type ModelType = typeof model
    const testModel: ModelType['infer'] = {
      age: 2,
      name: 'test',
    }
    // eslint-disable-next-line unicorn/no-immediate-mutation
    testModel.age = 3
  })

  it('should parse nested object models', () => {
    const model = object({
      name: string(),
      age: number(),
    })
    const nestedModel = object({
      name: string(),
      age: number(),
      user: model,
    })

    const nestedModel2 = object({
      value: string(),
      age: number(),
      user: nestedModel,
    })

    const isValid = compileTestModel(nestedModel2)({
      value: 'John',
      age: 30,
      user: {
        name: 'Jane',
        age: 25,
        user: {
          name: 'Doe',
          age: 20,
        },
      },
    })
    expect(isValid).toBe(true)
    expect(nestedModel2.getSchema()).toMatchSnapshot()
  })
  it('should ignore undefined properties', () => {
    const model = object({
      name: string(),
      age: number(),
      undefinedProperty: undefined,
    })

    const isValid = compileTestModel(model)({
      age: 2,
      name: undefined,
    })
    expect(isValid).toBe(true)
    expect(model.getSchema()).toMatchSnapshot()
  })
})
