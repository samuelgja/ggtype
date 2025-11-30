import { compileTestModel } from '../../utils/compile-model'
import { number } from '../number'

describe('number', () => {
  it('should number parse', () => {
    const model = number()
    const isValid = compileTestModel(model)(2)
    expect(isValid).toBe(true)
    const isInvalid = compileTestModel(model)(
      '' as unknown as number,
    )
    expect(isInvalid).toBe(false)
    expect(model.getSchema()).toMatchSnapshot()
  })
  it('should number maximum and minimum', () => {
    const model = number().maximum(10).minimum(5)

    const isValid = compileTestModel(model)(7)
    expect(isValid).toBe(true)
    const isInvalid = compileTestModel(model)(11)
    expect(isInvalid).toBe(false)
    const isInvalid2 = compileTestModel(model)(4)
    expect(isInvalid2).toBe(false)
    expect(model.getSchema()).toMatchSnapshot()
  })
})
