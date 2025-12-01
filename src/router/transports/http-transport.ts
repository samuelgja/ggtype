import type { ActionNotGeneric } from '../../action/action'
import type { ActionResult, Router } from '../../types'
import type { ClientAction } from '../router-client.types-shared'
import type { ParamsIt } from '../router-client.types'
import { AsyncStream } from '../../utils/async-stream'
import { createController } from '../../utils/stream-helpers'
import type { HttpTransportOptions } from './transport-options'

/**
 * Handles plain HTTP transport for router client communication.
 * Sends an HTTP request (default GET with query params, or POST/PUT/PATCH/DELETE with JSON body) and returns a single JSON response.
 * @internal
 * @template R - The router type
 * @template Params - The parameters type
 * @param options - HTTP transport options
 * @returns An AsyncStream that yields the result once and closes
 */
export async function handleHttpTransport<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
  Params extends ParamsIt<R>,
>(
  options: HttpTransportOptions<R, Params>,
): Promise<
  AsyncStream<{
    [P in keyof Params &
      keyof R['infer']['serverActions']]: ActionResult<
      R['infer']['serverActions'][P]['result']
    >
  }>
> {
  const {
    url,
    params,
    headers,
    method = 'GET',
    keepAlive = false,
  } = options

  type Result = {
    [P in keyof Params &
      keyof R['infer']['serverActions']]: ActionResult<
      R['infer']['serverActions'][P]['result']
    >
  }

  return new AsyncStream<Result>({
    async start(control) {
      const controller = createController<Result>(control)
      try {
        // Prepare URL and request configuration
        const urlObject =
          typeof url === 'string' ? new URL(url) : url
        const isGet = method === 'GET'

        // For GET requests, encode params as query parameter
        // For POST/PUT/PATCH/DELETE, params go in the request body
        if (isGet) {
          urlObject.searchParams.set(
            'q',
            JSON.stringify(params),
          )
        }

        // Prepare request headers
        const requestHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...headers,
        }
        if (keepAlive) {
          requestHeaders['Connection'] = 'keep-alive'
        }

        // Send HTTP request
        const response = await fetch(urlObject, {
          method,
          headers: requestHeaders,
          body: isGet ? undefined : JSON.stringify(params),
        })

        // Check response status
        if (!response.ok) {
          throw new Error(
            `HTTP request failed: ${response.status} ${response.statusText}`,
          )
        }

        // Parse and return result
        const result = (await response.json()) as Result
        controller.enqueue(result)
        controller.close()
      } catch (error) {
        // Error occurred - throw it naturally
        const httpError =
          error instanceof Error
            ? error
            : new Error('HTTP request error')
        controller.error(httpError)
      }
    },
  })
}
