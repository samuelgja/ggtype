import { debounce } from '../debounce'

describe('debounce', () => {
  it('should test debounce works', async () => {
    let calledCount = 0
    const wait = 10
    const call = debounce((a: number, b: number) => {
      expect(a).toBe(1)
      expect(b).toBe(2)
      calledCount++
    }, wait)

    call(1, 2)
    call(1, 2)
    call(1, 2)
    expect(calledCount).toBe(0)
    await new Promise((resolve) =>
      setTimeout(resolve, wait + 10),
    )
    expect(calledCount).toBe(1)
    call(1, 2)
    expect(calledCount).toBe(1)
    await new Promise((resolve) =>
      setTimeout(resolve, wait + 10),
    )
    expect(calledCount).toBe(2)
  })
})
