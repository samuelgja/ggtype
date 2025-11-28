/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Creates a debounced version of a function that delays execution until after wait milliseconds
 * have elapsed since the last time it was invoked. Useful for limiting the rate of function calls,
 * such as for search inputs or resize handlers.
 * @group Utils
 * @internal
 * @template T - The function type
 * @param function_ - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  function_: T,
  wait: number,
): T {
  let timeout: NodeJS.Timeout | null = null
  /**
   * The debounced function that delays execution.
   * @param args - Arguments to pass to the original function
   */
  return function (...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      function_(...args)
    }, wait)
  } as T
}
