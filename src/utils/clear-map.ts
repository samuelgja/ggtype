interface Options<K> {
  /**
   * Time in milliseconds before entries expire
   */
  expiresMs: number
  /**
   * Interval in milliseconds to check for expired entries
   */
  checkIntervalMs: number
  /**
   * Optional function to convert keys to strings (default: converts to string)
   */
  getKey?: (key: K) => string
}
export interface ClearMap<K, V> {
  /**
   * Adds a value to the map with optional expiration callback
   * @param key - The key to store the value under
   * @param value - The value to store
   * @param clearCallback - Optional callback to execute when the entry expires
   */
  add: (
    key: K,
    value: V,
    clearCallback?: () => void,
  ) => void
  /**
   * Gets a value from the map, optionally resetting its expiration time
   * @param key - The key to look up
   * @param reset - Whether to reset the expiration time (default: false)
   * @returns The value if found, undefined otherwise
   */
  get: (key: K, reset?: boolean) => V | undefined
  /**
   * Gets and removes a value from the map
   * @param key - The key to look up
   * @returns The value if found, undefined otherwise
   */
  take: (key: K) => V | undefined
  /**
   * Deletes a value from the map
   * @param key - The key to delete
   */
  delete: (key: K) => void
  /**
   * Disposes of the map and stops the expiration checking interval
   */
  dispose: () => void
  /**
   * Gets the number of entries in the map
   * @returns The number of entries
   */
  length: () => number
  /**
   * Iterator for iterating over map entries
   */
  [Symbol.iterator]: () => IterableIterator<
    [
      string,
      { value: V; expires: number; clear?: () => void },
    ]
  >
}

/**
 * Creates a map-like data structure that automatically expires entries after a specified time.
 * Entries are checked and removed periodically based on the checkIntervalMs setting.
 * Supports optional cleanup callbacks when entries expire.
 * @template K - The key type
 * @template V - The value type
 * @param options - Configuration options for the clear map
 * @param options.expiresMs - Time in milliseconds before entries expire
 * @param options.checkIntervalMs - Interval in milliseconds to check for expired entries
 * @param options.getKey - Optional function to convert keys to strings (default: converts to string)
 * @returns A ClearMap instance with add, get, take, delete, dispose, and length methods
 */
export function clearMap<K, V>(
  options: Options<K>,
): ClearMap<K, V> {
  const {
    expiresMs,
    checkIntervalMs,
    getKey = (key) => `${key}`,
  } = options
  const map = new Map<
    string,
    { value: V; expires: number; clear?: () => void }
  >()
  const interval = setInterval(() => {
    const now = Date.now()
    for (const [key, value] of map) {
      if (value.expires <= now) {
        map.delete(key)
        if (value.clear) {
          value.clear()
        }
      }
    }
  }, checkIntervalMs)

  return {
    add(key: K, value: V, clearCallback?: () => void) {
      map.set(getKey(key), {
        value,
        expires: Date.now() + expiresMs,
        clear: clearCallback,
      })
    },
    get(key: K, reset = false) {
      const item = map.get(getKey(key))
      if (item) {
        if (reset) {
          item.expires = Date.now() + expiresMs
        }
        return item.value
      }
      return
    },
    take(key: K) {
      const entry = map.get(getKey(key))
      if (entry) {
        map.delete(getKey(key))
        return entry.value
      }
      return
    },
    delete(key: K) {
      map.delete(getKey(key))
    },
    dispose() {
      clearInterval(interval)
    },
    [Symbol.iterator]() {
      return map.entries()
    },
    length() {
      return map.size
    },
  }
}
