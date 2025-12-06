import type {
  ClientActionsBase,
  Router,
  ServerActionsBase,
} from '../../router.type'
import type {
  FetchOptions,
  ParamsIt,
  ResultForWithActionResult,
  RouterClientState,
} from '../router-client.types'
import { handleHttpClient } from '../../transports/handle-http-client'
import { parseStreamResponse } from '../../transports/handle-stream'
import {
  createErrorProcessor,
  streamMessageToResult,
} from '../router-client.utils'

export function createStreamHandler<
  RouterType extends Router<
    ServerActionsBase,
    ClientActionsBase
  >,
>(options: {
  streamURL?: string | URL
  state: RouterClientState
}) {
  const { streamURL, state } = options
  const { throwClientError } = createErrorProcessor(
    state.onError,
  )

  type ResultForLocal<Params extends ParamsIt<RouterType>> =
    ResultForWithActionResult<RouterType, Params>

  return async function* <
    Params extends ParamsIt<RouterType>,
  >(
    params: Params,
    fetchOptions?: FetchOptions<RouterType>,
  ): AsyncGenerator<ResultForLocal<Params>> {
    if (!streamURL) {
      throwClientError(new Error('streamURL is required'))
    }

    let response: Response
    try {
      response = await handleHttpClient(
        streamURL!,
        params,
        fetchOptions,
        state.defaultHeaders,
      )
    } catch (error) {
      throwClientError(error)
    }
    // TypeScript control flow: response is definitely assigned here
    // because throwClientError never returns
    const finalResponse = response!
    if (!finalResponse.ok) {
      throwClientError(
        `HTTP request failed: ${finalResponse.status} ${finalResponse.statusText}`,
      )
    }
    const reader = finalResponse.body?.getReader()
    if (!reader) {
      throwClientError(new Error('Reader is not available'))
    }
    const stream = parseStreamResponse(
      reader as ReadableStreamDefaultReader<Uint8Array>,
    )
    for await (const item of stream) {
      const result = streamMessageToResult<Params>(item)
      if (result) {
        yield result as ResultForLocal<Params>
      }
    }
  }
}
