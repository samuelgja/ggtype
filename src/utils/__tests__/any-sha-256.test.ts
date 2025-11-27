import { anySha256 } from '../any-sha-256'

describe('any-sha-256', () => {
  it('should create sha256 from any', () => {
    const data = {
      name: 'John',
    }
    const sha256 = anySha256(data)
    expect(sha256).toMatchSnapshot()
  })
})
