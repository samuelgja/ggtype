/**
 * Gets headers from a request and optionally merges with additional headers.
 * Additional headers take precedence over request headers.
 * @param request - The request object to extract headers from
 * @param additionalHeaders - Optional headers to merge with request headers
 * @returns A new Headers object with merged headers
 */
export function getHeaders(
  request: Request,
  additionalHeaders?: Headers | HeadersInit,
): Headers {
  const headers = new Headers(request.headers)
  if (additionalHeaders) {
    const additional = new Headers(additionalHeaders)
    // Headers.entries() exists at runtime but TypeScript types may not include it
    // Use type assertion to access the entries iterator
    const entries = (
      additional as unknown as {
        entries: () => IterableIterator<[string, string]>
      }
    ).entries()
    for (const [key, value] of entries) {
      headers.set(key, value)
    }
  }
  return headers
}
