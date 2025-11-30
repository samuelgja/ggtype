import { compileTestModel } from '../../utils/compile-model'
import { string } from '../string'

describe('string', () => {
  it('should string parse', () => {
    const model = string()
    const isValid = compileTestModel(model)('222')
    expect(isValid).toBe(true)
    const isInvalid = compileTestModel(model)(
      1 as unknown as string,
    )
    expect(isInvalid).toBe(false)
  })
  it('should parse string with pattern', () => {
    const model = string().regex(/^\d+$/)
    const isValid = compileTestModel(model)('222')
    expect(isValid).toBe(true)
    const isInvalid = compileTestModel(model)('aaa')
    expect(isInvalid).toBe(false)
  })
  it('should parse string with maxLength', () => {
    const model = string().maxLength(3).title('test')

    const isValid = compileTestModel(model)('222')
    expect(isValid).toBe(true)
    const isInvalid = compileTestModel(model)('aaaa')
    expect(isInvalid).toBe(false)
  })
  it('should parse string with minLength', () => {
    const model = string().minLength(3)
    const isValid = compileTestModel(model)('222')
    expect(isValid).toBe(true)
    const isInvalid = compileTestModel(model)('aa')
    expect(isInvalid).toBe(false)
  })
})
