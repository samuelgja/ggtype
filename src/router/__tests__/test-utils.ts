/**
 * Test utility for getting unique ports for test servers.
 * @internal
 */

/**
 * Gets a unique port number for test servers.
 * Returns a random port between 20000 and 50000 to minimize collisions.
 * @returns A unique port number
 */
export function getTestPort(): number {
  // eslint-disable-next-line sonarjs/pseudo-random
  const random = Math.random()
  return Math.floor(random * (50_000 - 20_000) + 20_000)
}
