import { compileTestModel } from '../../utils/compile-model'
import { date } from '../date'

describe('date', () => {
  it('should date parse date time', () => {
    const model = date()
    const isValid = compileTestModel(model)(new Date())
    expect(isValid).toBe(true)
    expect(model.getSchema()).toMatchSnapshot()
  })
  it('should date parse date', () => {
    const model = date().isDate()
    const isValid = compileTestModel(model)(new Date())
    expect(isValid).toBe(true)
    expect(model.getSchema()).toMatchSnapshot()
  })
  it('should date parse time', () => {
    const model = date().isTime()
    const isValid = compileTestModel(model)(new Date())
    expect(isValid).toBe(true)
    expect(model.getSchema()).toMatchSnapshot()
  })
  it('should test date with minim and maximum', () => {
    const model = date()
      .minimum(new Date('2020-01-01'))
      .maximum(new Date('2021-01-01'))
    const isValid = compileTestModel(model)(
      new Date('2020-06-01'),
    )
    expect(isValid).toBe(true)
    const isInvalid = compileTestModel(model)(
      new Date('2019-06-01'),
    )
    expect(isInvalid).toBe(false)
    const isInvalid2 = compileTestModel(model)(
      new Date('2022-06-01'),
    )
    expect(isInvalid2).toBe(false)
    expect(model.getSchema()).toMatchSnapshot()
  })
})
