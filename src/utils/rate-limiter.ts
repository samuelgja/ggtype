const DEFAULT_MAX_RUN_PER_WINDOW = 10
const DEFAULT_WINDOW_MS = 1000
const DEFAULT_BLOCK_MS = 1000

interface RateLimiterOptions {
  readonly maxRunPerWindow?: number // Maximum runs allowed per window
  readonly blockMs?: number // How long to block after exceeding limit
  readonly windowMs?: number // Window duration in milliseconds
}

interface RateLimiter {
  (): void
  getLength: () => number
  onCleanup: (callback: () => void) => void
}

/**
 * Creates a rate limiter function that enforces maximum execution frequency.
 * Tracks function calls within a time window and blocks execution if the limit is exceeded.
 * When blocked, throws an error and automatically unblocks after the block duration.
 * @param options - Rate limiter configuration options
 * @param options.maxRunPerWindow - Maximum number of calls allowed per window (default: 10)
 * @param options.windowMs - Time window in milliseconds (default: 1000)
 * @param options.blockMs - Block duration in milliseconds when limit exceeded (default: 1000)
 * @returns A rate limiter function that throws if rate limit is exceeded
 */
export function rateLimiter(
  options: RateLimiterOptions,
): RateLimiter {
  const {
    maxRunPerWindow = DEFAULT_MAX_RUN_PER_WINDOW,
    windowMs = DEFAULT_WINDOW_MS,
    blockMs = DEFAULT_BLOCK_MS,
  } = options

  let callTimestamps: number[] = []
  let blockedUntil = 0
  let timeout: ReturnType<typeof setTimeout> | undefined
  const cleanupCallbacks = new Set<() => void>()

  /**
   * Executes the rate-limited function, throwing if the rate limit is exceeded.
   * Tracks call timestamps and blocks execution if the maximum calls per window is reached.
   * @throws {Error} If rate limit is exceeded or if currently blocked
   */
  function run() {
    const now = performance.now()

    if (now < blockedUntil) {
      throw new Error('Rate limiter is temporarily blocked')
    }

    // Keep only recent timestamps within window
    callTimestamps = callTimestamps.filter(
      (ts) => now - ts < windowMs,
    )

    if (callTimestamps.length >= maxRunPerWindow) {
      if (blockedUntil === 0) {
        blockedUntil = now + blockMs
        callTimestamps = []

        clearTimeout(timeout)
        timeout = setTimeout(() => {
          blockedUntil = 0
          callTimestamps = []
          for (const callback of cleanupCallbacks) {
            callback()
            cleanupCallbacks.delete(callback)
          }
        }, blockMs)
      }
      throw new Error(
        'Rate limit exceeded, temporarily blocked',
      )
    }

    clearTimeout(timeout) // Cancel any stale timeout
    callTimestamps.push(now)
  }

  run.getLength = () => callTimestamps.length
  run.onCleanup = (callback: () => void) => {
    cleanupCallbacks.add(callback)
  }
  return run
}

/**
 * Creates a rate limiter that tracks rate limits per unique value.
 * Each unique value gets its own rate limiter instance, allowing different
 * rate limits for different keys/identifiers.
 * @template T - The value type to track rate limits for
 * @param options - Rate limiter configuration options
 * @param options.maxRunPerWindow - Maximum number of calls allowed per window (default: 10)
 * @param options.windowMs - Time window in milliseconds (default: 1000)
 * @param options.blockMs - Block duration in milliseconds when limit exceeded (default: 1000)
 * @returns A function that rate limits based on the provided value
 */
export function rateLimiterWithValue<T>(
  options: RateLimiterOptions,
) {
  const {
    maxRunPerWindow = DEFAULT_MAX_RUN_PER_WINDOW,
    windowMs = DEFAULT_WINDOW_MS,
    blockMs = DEFAULT_BLOCK_MS,
  } = options

  const rateLimiters = new Map<T, RateLimiter>()

  return function run(value: T) {
    if (!rateLimiters.has(value)) {
      const limiter = rateLimiter({
        maxRunPerWindow,
        windowMs,
        blockMs,
      })
      limiter.onCleanup(() => {
        rateLimiters.delete(value)
      })
      rateLimiters.set(value, limiter)
    }
    const limiter = rateLimiters.get(value)!
    limiter()
  }
}
