import { clearMap } from '../clear-map'

describe('clear-map', () => {
  it('should test clear map', async () => {
    const wait = 10
    const call = jest.fn()
    const map = clearMap({
      checkIntervalMs: wait / 2,
      expiresMs: wait,
    })
    map.add('a', 1, () => {
      call('a')
    })
    map.add('b', 2, () => {
      call('b')
    })
    map.add('c', 3, () => {
      // this should not be called, because, we are going to clear it with overwrite
      call('c')
    })
    map.add('c', 3, () => {
      call('x')
    })

    map.add('d', 4, () => {
      // this should not be called, because, we are going to clear it with delete
      call('d')
    })
    map.delete('d')

    await new Promise((resolve) =>
      setTimeout(resolve, wait + 10),
    )
    expect(call).toHaveBeenCalledTimes(3)
    expect(call).toHaveBeenCalledWith('a')
    expect(call).toHaveBeenCalledWith('b')
    expect(call).toHaveBeenCalledWith('x')
  })
})
