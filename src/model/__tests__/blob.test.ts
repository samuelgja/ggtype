import { compileTestModel } from '../../utils/compile-model'
import { blob } from '../blob'

describe('blob', () => {
  it('should validate a valid blob object fake blob', async () => {
    const model = blob()
    const fakeFile = new File(['foo'], 'example.txt', {
      type: 'text/plain',
    })
    const blobData = new Blob([fakeFile])
    const arrayBuffer = await blobData.arrayBuffer()

    const isValid = compileTestModel(model)(
      arrayBuffer as unknown as File,
    )
    expect(isValid).toBe(true)
    expect(model.getSchema()).toMatchSnapshot()
  })
})
