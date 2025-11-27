import { compileTestModel } from '../../utils/compile-model'
import { file } from '../file'

describe('file', () => {
  it('should validate a valid file object fake file', async () => {
    const model = file()
    const fakeFile = new File(['foo'], 'example.txt', {
      type: 'text/plain',
    })
    const arrayBuffer = await fakeFile.arrayBuffer()

    const isValid = compileTestModel(model)(
      arrayBuffer as unknown as File,
    )
    expect(isValid).toBe(true)
    expect(model.getSchema()).toMatchSnapshot()
  })
})
