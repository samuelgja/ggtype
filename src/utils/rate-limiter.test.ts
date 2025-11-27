import {
  rateLimiter,
  rateLimiterWithValue,
} from './rate-limiter'

describe('rateLimiter', () => {
  it('should allow calls within the rate limit', () => {
    const limiter = rateLimiter({
      maxRunPerWindow: 3,
      windowMs: 10,
    })

    expect(() => {
      limiter()
      limiter()
      limiter()
    }).not.toThrow()
  })

  it('should throw an error when exceeding the rate limit', () => {
    const limiter = rateLimiter({
      maxRunPerWindow: 2,
      windowMs: 1000,
    })

    limiter()
    limiter()
    expect(() => limiter()).toThrow(
      'Rate limit exceeded, temporarily blocked',
    )
  })

  it('should reset the rate limit after the window time has passed', (done) => {
    const limiter = rateLimiter({
      maxRunPerWindow: 2,
      windowMs: 10,
      blockMs: 20,
    })

    limiter()
    limiter()
    expect(() => limiter()).toThrow(
      'Rate limit exceeded, temporarily blocked',
    )

    setTimeout(() => {
      expect(() => {
        limiter()
        limiter()
      }).not.toThrow()
      done()
    }, 25) // Wait for the window to pass
  })

  it('should use default values when no options are provided', () => {
    const limiter = rateLimiter({})

    for (let index = 0; index < 10; index++) {
      expect(() => limiter()).not.toThrow()
    }
    expect(() => limiter()).toThrow(
      'Rate limit exceeded, temporarily blocked',
    )
  })

  it('should throw an error if called during the block period', (done) => {
    const limiter = rateLimiter({
      maxRunPerWindow: 2,
      windowMs: 20,
      blockMs: 25,
    })

    limiter()
    limiter()
    expect(() => limiter()).toThrow(
      'Rate limit exceeded, temporarily blocked',
    )

    setTimeout(() => {
      expect(() => limiter()).toThrow(
        'Rate limiter is temporarily blocked',
      )
      done()
    }, 20) // Within block period
  })
  it('should automatically unblock and clear internal state after blockMs timeout', (done) => {
    const limiter = rateLimiter({
      maxRunPerWindow: 2,
      windowMs: 20,
      blockMs: 30,
    })

    limiter() // 1st call
    limiter() // 2nd call

    expect(() => limiter()).toThrow(
      'Rate limit exceeded, temporarily blocked',
    )

    // Wait until block should be cleared
    setTimeout(() => {
      // Should now be allowed again
      expect(() => {
        limiter()
        limiter()
      }).not.toThrow()

      // This next call should now trigger another block again
      expect(() => limiter()).toThrow(
        'Rate limit exceeded, temporarily blocked',
      )
      done()
    }, 35) // must be > blockMs
  })
})

describe('rateLimiterWithValue', () => {
  it('should allow calls within the rate limit for different values', () => {
    const limiter = rateLimiterWithValue<string>({
      maxRunPerWindow: 2,
      windowMs: 100,
    })

    expect(() => {
      limiter('A')
      limiter('A')
      limiter('B')
      limiter('B')
    }).not.toThrow()
  })

  it('should throw an error when exceeding the rate limit for a specific value', () => {
    const limiter = rateLimiterWithValue<string>({
      maxRunPerWindow: 2,
      windowMs: 100,
    })

    limiter('A')
    limiter('A')
    expect(() => limiter('A')).toThrow(
      'Rate limit exceeded, temporarily blocked',
    )
    expect(() => limiter('B')).not.toThrow() // 'B' should not be affected
  })

  it('should reset the rate limit for a value after the window time has passed', (done) => {
    const limiter = rateLimiterWithValue<string>({
      maxRunPerWindow: 2,
      windowMs: 50,
      blockMs: 50,
    })

    limiter('A')
    limiter('A')
    expect(() => limiter('A')).toThrow(
      'Rate limit exceeded, temporarily blocked',
    )

    setTimeout(() => {
      expect(() => {
        limiter('A')
        limiter('A')
      }).not.toThrow()
      done()
    }, 60) // Wait for the window to pass
  })

  it('should automatically unblock and clear internal state for a value after blockMs timeout', (done) => {
    const limiter = rateLimiterWithValue<string>({
      maxRunPerWindow: 2,
      windowMs: 50,
      blockMs: 100,
    })

    limiter('A')
    limiter('A')
    expect(() => limiter('A')).toThrow(
      'Rate limit exceeded, temporarily blocked',
    )

    setTimeout(() => {
      expect(() => {
        limiter('A')
        limiter('A')
      }).not.toThrow()
      done()
    }, 110) // Wait for blockMs to pass
  })

  it('should clean up unused rate limiters after blockMs timeout', (done) => {
    const limiter = rateLimiterWithValue<string>({
      maxRunPerWindow: 1,
      windowMs: 50,
      blockMs: 100,
    })

    limiter('A')
    expect(() => limiter('A')).toThrow(
      'Rate limit exceeded, temporarily blocked',
    )

    setTimeout(() => {
      expect(() => limiter('A')).not.toThrow()
      done()
    }, 110) // Wait for blockMs to pass
  })

  it('should handle multiple values independently', () => {
    const limiter = rateLimiterWithValue<string>({
      maxRunPerWindow: 2,
      windowMs: 100,
    })

    limiter('A')
    limiter('A')
    expect(() => limiter('A')).toThrow(
      'Rate limit exceeded, temporarily blocked',
    )

    limiter('B')
    limiter('B')
    expect(() => limiter('B')).toThrow(
      'Rate limit exceeded, temporarily blocked',
    )
  })
})
