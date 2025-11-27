import { compileTestModel } from '../../utils/compile-model'
import { boolean } from '../boolean'

describe('boolean', () => {
  it('should boolean parse', () => {
    const model = boolean()
    const isValid = compileTestModel(model)(true)
    expect(isValid).toBe(true)
    const isInvalid = compileTestModel(model)(
      '' as unknown as boolean,
    )
    expect(isInvalid).toBe(false)
    expect(model.getSchema()).toMatchSnapshot()
  })
})
