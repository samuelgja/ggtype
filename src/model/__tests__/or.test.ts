import { m, type Infer } from '../..'
import { compileTestModel } from '../../utils/compile-model'
import { boolean } from '../boolean'
import { number } from '../number'
import { object } from '../object'
import { or } from '../or'
import { string } from '../string'

describe('or', () => {
  it('should validate oneOf type', () => {
    const model = or(boolean(), number())
    const isValidBoolean = compileTestModel(model)(true)
    expect(isValidBoolean).toBe(true)

    const isValidNumber = compileTestModel(model)(42)
    expect(isValidNumber).toBe(true)

    const isInvalid = compileTestModel(model)(
      'string' as unknown as boolean | number,
    )
    expect(isInvalid).toBe(false)
    expect(model.getSchema()).toMatchSnapshot()
  })

  it('should validate or type', () => {
    const model = or(boolean(), number())
    const isValidBoolean = compileTestModel(model)(true)
    expect(isValidBoolean).toBe(true)

    const isValidNumber = compileTestModel(model)(42)
    expect(isValidNumber).toBe(true)

    const isInvalid = compileTestModel(model)(
      'string' as unknown as boolean | number,
    )
    expect(isInvalid).toBe(false)
    expect(model.getSchema()).toMatchSnapshot()
  })
  it('should validate or for 3 models', () => {
    const model = or(
      boolean(),
      number(),
      object({ name: string() }),
    )

    const isValidBoolean = compileTestModel(model)(true)
    expect(isValidBoolean).toBe(true)

    const isValidNumber = compileTestModel(model)(42)
    expect(isValidNumber).toBe(true)

    const isValidObject = compileTestModel(model)({
      name: 'John',
    })
    expect(isValidObject).toEqual(true)

    const isInvalid = compileTestModel(model)('asd')
    expect(isInvalid).toBe(false)
    // TS checking
    // eslint-disable-next-line sonarjs/no-dead-store
    let value: Infer<typeof model> = 2
    // eslint-disable-next-line sonarjs/no-dead-store
    value = { name: 'John' }
    value = new Date()
    expect(value).toEqual(value)
    expect(model.getSchema()).toMatchSnapshot()
  })

  it('should parse and stringify', () => {
    const model = or(boolean(), number())
    const parsedBool = model.onParse(true)
    expect(parsedBool).toBe(true)

    const parsedNumber = model.onParse(42)
    expect(parsedNumber).toBe(42)
    const parsedString = model.onParse(
      'string' as unknown as boolean | number,
    )
    expect(parsedString).toBe('string')
    expect(model.getSchema()).toMatchSnapshot()
  })

  it('should parse json schema', () => {
    const model1 = object({
      date: string(),
    })

    const model2 = object({
      age: number(),
    })
    const dateVale = new Date()
    const allModel = or(model1, model2)
    const parsed = allModel.onParse({ date: dateVale })
    expect(parsed).toEqual({ date: dateVale })
    const compiled = compileTestModel(allModel)({
      date: 'dateVale',
    })
    expect(compiled).toBe(true)
    expect(model2.getSchema()).toMatchSnapshot()
    expect(model1.getSchema()).toMatchSnapshot()
  })
  it('should parse or for two object models with shared type', () => {
    const type = m.enums('a', 'b', 'c')

    const model1 = object({
      type: type.only('a'),
      name: string(),
    })

    const model2 = object({
      type: type.only('b'),
      age: number(),
    })

    const orModel = m.or(model1, model2) // Combine the models with OR

    const isValidModel12 = compileTestModel(orModel)({
      type: 'a',
      name: 'John',
    })
    expect(isValidModel12).toEqual(true)

    const isValidModel22 = compileTestModel(orModel)({
      type: 'b',
      age: 20,
    })
    expect(isValidModel22).toEqual(true)
    expect(model2.getSchema()).toMatchSnapshot()
    expect(model1.getSchema()).toMatchSnapshot()
  })
})
