import { compileTestModel } from '../../utils/compile-model'
import { array } from '../array'
import { boolean } from '../boolean'
import { number } from '../number'
import { object } from '../object'
import { string } from '../string'

describe('test model', () => {
  it('should create some object', () => {
    const friendModel = object({
      name: string().isRequired(),
      age: number().isRequired(),
      isAdult: boolean().isRequired(),
    })
    const userModel = object({
      name: string().isRequired(),
      age: number().isRequired(),
      isAdult: boolean().isRequired(),
      friends: array(friendModel),
    })
    const parsed = userModel.onParse({
      age: 20,
      isAdult: true,
      name: 'John',
      friends: [{ age: 20, isAdult: true, name: '' }],
    })
    expect(parsed).toEqual({
      age: 20,
      isAdult: true,
      name: 'John',
      friends: [{ age: 20, isAdult: true, name: '' }],
    })
    const userList = array(userModel)
    const isValid = compileTestModel(userList)([
      { name: 'John', age: 20, isAdult: true },
      { name: 'Jane', age: 18, isAdult: false },
    ])

    expect(isValid).toBe(true)
    const isInvalid = compileTestModel(userList)([
      { name: 'John', age: 20, isAdult: true },
      { name: 'Jane', age: 18 } as never,
    ])
    expect(isInvalid).toBe(false)
    expect(userModel.getSchema()).toMatchSnapshot()
  })
  it('should get references for the model', () => {
    const bigObject = object({
      name: string().isRequired(),
      age: number().isRequired(),
      isAdult: boolean().isRequired(),
      friends: array(
        object({
          name: string().isRequired(),
          age: number().isRequired(),
          isAdult: boolean().isRequired(),
        }),
      ),
    })
    const isValid = compileTestModel(bigObject)({
      name: 'John',
      age: 20,
      isAdult: true,
      friends: [
        { name: 'Jane', age: 18, isAdult: false },
        { name: 'Doe', age: 25, isAdult: true },
      ],
    })
    expect(isValid).toBe(true)
  })
})
