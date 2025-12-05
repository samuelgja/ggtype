/**
 * Test utility for getting unique ports for test servers.
 * Each call increments the port number to avoid conflicts.
 * @internal
 */
let testPortCounter = 3000

/**
 * Gets a unique port number for test servers.
 * Each call returns the next available port, starting from 3000.
 * @returns A unique port number
 */
export function getTestPort(): number {
  testPortCounter += 1
  return testPortCounter
}
