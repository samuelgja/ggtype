import type {
  ClientActionsBase,
  Router,
  ServerActionsBase,
} from '../../router/router.type'
import type {
  FetchOptions,
  ParamsIt,
  ResultForWithActionResult,
  RouterClientState,
} from '../router-client.types'
import { handleHttpClient } from '../../router/transports/handle-http-client'
import { parseStreamResponse } from '../../router/transports/handle-stream'
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
  onResponse?: <
    Params extends ParamsIt<RouterType>,
  >(options: {
    readonly json: ResultForWithActionResult<
      RouterType,
      Params
    >
    readonly statusCode: number
    readonly runAgain: <
      NewParams extends ParamsIt<RouterType> = Params,
    >(
      newParams?: NewParams,
      newOptions?: FetchOptions<RouterType>,
    ) => AsyncGenerator<
      ResultForWithActionResult<RouterType, NewParams>
    >
  }) =>
    | ResultForWithActionResult<
        RouterType,
        ParamsIt<RouterType>
      >
    | void
    | Promise<ResultForWithActionResult<
        RouterType,
        ParamsIt<RouterType>
      > | void>
}) {
  const { streamURL, state, onResponse } = options
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
      throwClientError(
        new Error(
          'Missing stream URL. Please provide `streamURL` in routerClient options.',
        ),
      )
    }

    const runAgain = <
      NewParams extends ParamsIt<RouterType> = Params,
    >(
      newParams?: NewParams,
      newOptions?: FetchOptions<RouterType>,
    ): AsyncGenerator<ResultForLocal<NewParams>> => {
      if (newParams !== undefined) {
        return createStreamHandler<RouterType>({
          streamURL,
          state,
          onResponse,
        })(
          newParams as unknown as Params,
          newOptions ?? fetchOptions,
        ) as AsyncGenerator<ResultForLocal<NewParams>>
      }
      if (newOptions !== undefined) {
        return createStreamHandler<RouterType>({
          streamURL,
          state,
          onResponse,
        })(params, newOptions) as AsyncGenerator<
          ResultForLocal<NewParams>
        >
      }
      return createStreamHandler<RouterType>({
        streamURL,
        state,
        onResponse,
      })(params, fetchOptions) as AsyncGenerator<
        ResultForLocal<NewParams>
      >
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
    // Don't throw on non-ok responses - errors are in the stream
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
        const resultTyped = result as ResultForLocal<Params>
        // Only call onResponse for final results (when isLast is true)
        if (onResponse && item.isLast) {
          const modifiedResult = await onResponse({
            json: resultTyped,
            statusCode: finalResponse.status,
            runAgain,
          })
          if (modifiedResult !== undefined) {
            yield modifiedResult as ResultForLocal<Params>
            continue
          }
        }
        yield resultTyped
      }
    }
  }
}
