import { m } from '../..'
import { compileTestModel } from '../../utils/compile-model'
import { and } from '../and'
import { object } from '../object'

import { string } from '../string'

describe('and', () => {
  it('should validate and type', () => {
    const user = object({
      name: string(),
    })
    const book = object({
      title: string(),
    })
    const model = and(user, book)
    const isValidUser = compileTestModel(model)({
      name: 'John',
      title: 'Book Title',
    })

    expect(isValidUser).toEqual(true)

    const isInvalid = compileTestModel(model)({
      name: 'John',
      title: 42,
    } as never)
    expect(isInvalid).toBe(false)

    const inferred: (typeof model)['infer'] = {
      name: 'John',
      title: 'Book Title',
    }
    expect(inferred).toEqual({
      name: 'John',
      title: 'Book Title',
    })
    expect(model.getSchema()).toMatchSnapshot()
  })
  it('should validate and type with 3 models', () => {
    const user = object({
      name: string(),
    })
    const book = object({
      title: string(),
    })
    const model = and(
      user,
      book,
      object({
        author: string(),
      }),
    )
    const isValidUser = compileTestModel(model)({
      name: 'John',
      title: 'Book Title',
    })
    expect(isValidUser).toEqual(true)

    const isValidFull = compileTestModel(model)({
      name: 'John',
      title: 'Book Title',
      author: 'Author Name',
    })
    expect(isValidFull).toEqual(true)
    expect(model.getSchema()).toMatchSnapshot()
  })
  it('should merge two models', () => {
    const availableToolTypes = m.enums('text', 'math')
    const objectParameter = m
      .object({
        required: m.array(m.string()),
      })
      

    const toolNode = m
      .object({
        id: m.string(),
        type: availableToolTypes,
      })
      

    const merged = and(
      toolNode,
      objectParameter,
    )
    const isValid = compileTestModel(merged)({
      type: 'math',
      id: '123',
      required: ['a', 'b'],
    })
    expect(isValid).toEqual(true)
    expect(merged.getSchema()).toMatchSnapshot()
  })
})
