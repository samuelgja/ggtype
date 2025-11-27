import { compileTestModel } from '../../utils/compile-model'
import { array } from '../array'
import { boolean } from '../boolean'

describe('array', () => {
  it('should boolean array', () => {
    const boolModel = boolean()
    const model = array(boolModel)
    const isValid = compileTestModel(model)([true, false])
    expect(isValid).toBe(true)
    const isInvalid = compileTestModel(model)(
      '' as unknown as boolean[],
    )
    expect(isInvalid).toBe(false)
    expect(model.getSchema()).toMatchSnapshot()
  })
  it('should mixed array', () => {
    const boolModel = boolean()
    const model = array(boolModel)
    const isValid = compileTestModel(model)([true, false])
    expect(isValid).toBe(true)
    const isInvalid = compileTestModel(model)(
      '' as unknown as boolean[],
    )
    expect(isInvalid).toBe(false)
    expect(model.getSchema()).toMatchSnapshot()
  })
})
