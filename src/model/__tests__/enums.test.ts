import { compileTestModel } from '../../utils/compile-model'
import { enums } from '../enums'

describe('enum', () => {
  it('should enum parse', () => {
    const model = enums('admin', 'user')

    const isValid = compileTestModel(model)('admin')
    expect(isValid).toBe(true)
    const isInvalid = compileTestModel(model)(
      '' as unknown as 'admin',
    )
    expect(isInvalid).toBe(false)
    expect(model.getSchema()).toMatchSnapshot()
  })

  it('should test enum only', () => {
    const model = enums('admin', 'user', 'book')
      .only('admin', 'user')
      

    const isValid = compileTestModel(model)('admin')
    expect(isValid).toBe(true)
    const isInvalid = compileTestModel(model)(
      '' as unknown as 'admin',
    )
    expect(isInvalid).toBe(false)
    expect(model.getSchema()).toMatchSnapshot()
  })
})
