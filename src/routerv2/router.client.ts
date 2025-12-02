import { error } from 'ajv/dist/vocabularies/applicator/dependencies'
import type { ActionResult } from '../types'
import { AsyncStream } from '../utils/async-stream'
import type {
  FetchOptions,
  ParamsIt,
  ResultForWithActionResult,
  RouterClientOptions,
  RouterClientState,
} from './router.client.types'
import type {
  ClientActionsBase,
  Router,
  ServerActionsBase,
} from './router.type'
import { handleHttpClient } from './transports/handle-http-client'
import { parseStreamResponse } from './transports/handle-stream'

export function createRouterClient<
  RouterType extends Router<
    ServerActionsBase,
    ClientActionsBase
  >,
>(options: RouterClientOptions<RouterType>) {
  const {
    defineClientActions,
    halfDuplexUrl,
    httpURL,
    onRequest,
    onResponse,
    responseTimeout,
    streamURL,
    websocketURL,
  } = options

  type ResultForLocal<Params extends ParamsIt<RouterType>> =
    ResultForWithActionResult<RouterType, Params>
  type SingleActionFetchResult<
    ActionName extends
      keyof RouterType['infer']['serverActions'],
  > = ActionResult<
    RouterType['infer']['serverActions'][ActionName]['result']
  >
  type SingleActionStreamResult<
    ActionName extends
      keyof RouterType['infer']['serverActions'],
  > = AsyncStream<{
    [K in ActionName]: ActionResult<
      RouterType['infer']['serverActions'][K]['result']
    >
  }>

  const state: RouterClientState = {
    defaultHeaders: {},
  }

  // HOOKS HANDLERS
  async function onRequestHook<
    Params extends ParamsIt<RouterType>,
  >(onRequestHookOptions: {
    params: Params
    runAgain: () => Promise<
      ResultForWithActionResult<RouterType, Params>
    >
  }): Promise<Params> {
    const { params, runAgain } = onRequestHookOptions
    if (onRequest) {
      const modifiedParams = await onRequest({
        params,
        runAgain,
      })
      if (modifiedParams !== undefined) {
        return modifiedParams
      }
    }
    return params
  }

  async function onResponseHook<
    Params extends ParamsIt<RouterType>,
  >(onResponseHookOptions: {
    json: ResultForWithActionResult<RouterType, Params>
    runAgain: () => Promise<
      ResultForWithActionResult<RouterType, Params>
    >
  }): Promise<
    ResultForWithActionResult<RouterType, Params>
  > {
    const { json, runAgain } = onResponseHookOptions
    if (onResponse) {
      const modifiedJson = await onResponse({
        json,
        runAgain,
      })
      if (modifiedJson !== undefined) {
        return modifiedJson
      }
    }
    return json
  }

  return {
    /**
     * Sets headers to be included in all requests.
     * Call with an object to set headers, or with no arguments to reset headers.
     * @param newHeaders - Optional headers object. If not provided, headers are reset.
     */
    setHeaders(newHeaders?: Record<string, string>): void {
      state.defaultHeaders = {
        ...state.defaultHeaders,
        ...newHeaders,
      }
    },

    async fetch<Params extends ParamsIt<RouterType>>(
      params: Params,
      fetchOptions?: FetchOptions<RouterType>,
    ): Promise<ResultForLocal<Params>> {
      if (!httpURL) {
        throw new Error('httpURL is required')
      }
      // Create runAgain function for onRequest hook
      const runAgain = async (): Promise<
        ResultForWithActionResult<RouterType, Params>
      > => {
        return this.fetch(params, fetchOptions)
      }
      const requestParams = await onRequestHook({
        params,
        runAgain,
      })

      const response = await handleHttpClient(
        httpURL,
        requestParams,
        fetchOptions,
      )
      if (!response.ok) {
        throw new Error(
          `HTTP request failed: ${response.status} ${response.statusText}`,
        )
      }
      const json = await response.json()
      const modifiedJson = await onResponseHook({
        json,
        runAgain,
      })
      return modifiedJson
    },
    async *stream<Params extends ParamsIt<RouterType>>(
      params: Params,
      fetchOptions?: FetchOptions<RouterType>,
    ): AsyncGenerator<ResultForLocal<Params>> {
      if (!streamURL) {
        throw new Error('streamURL is required')
      }
      // Create runAgain function for onRequest hook
      const runAgain = async (): Promise<
        ResultForWithActionResult<RouterType, Params>
      > => {
        return this.fetch(params, fetchOptions)
      }
      const requestParams = await onRequestHook({
        params,
        runAgain,
      })

      const response = await handleHttpClient(
        streamURL,
        requestParams,
        fetchOptions,
      )
      if (!response.ok) {
        throw new Error(
          `HTTP request failed: ${response.status} ${response.statusText}`,
        )
      }
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Reader is not available')
      }
      const stream = parseStreamResponse(reader)
      for await (const item of stream) {
        switch (item.status) {
          case 'ok': {
            yield {
              [item.action]: {
                data: item.file ?? item.data,
                status: item.status,
              },
            } as ResultForWithActionResult<
              RouterType,
              Params
            >
            break
          }
          case 'error': {
            yield {
              [item.action]: {
                error: item.error,
                status: item.status,
              },
            } as ResultForWithActionResult<
              RouterType,
              Params
            >
            break
          }
        }
      }
    },
    async *duplex<Params extends ParamsIt<RouterType>>(
      params: Params,
      fetchOptions?: FetchOptions<RouterType>,
    ): AsyncGenerator<ResultForLocal<Params>> {
      if (!halfDuplexUrl) {
        throw new Error('streamURL is required')
      }
      // Create runAgain function for onRequest hook
      const runAgain = async (): Promise<
        ResultForWithActionResult<RouterType, Params>
      > => {
        return this.fetch(params, fetchOptions)
      }
      const requestParams = await onRequestHook({
        params,
        runAgain,
      })

      const url = new URL(halfDuplexUrl)
      url.searchParams.set(
        'q',
        JSON.stringify(requestParams),
      )

      const readableStream = new ReadableStream({
        async start(controller) {
          controller.close()
        },
      })
      const response = await fetch(url, {
        method: 'POST',
        body: readableStream,
      })

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Reader is not available')
      }
      const stream = parseStreamResponse(reader)
      for await (const item of stream) {
        switch (item.status) {
          case 'ok': {
            yield {
              [item.action]: {
                data: item.file ?? item.data,
                status: item.status,
              },
            } as ResultForWithActionResult<
              RouterType,
              Params
            >
            break
          }
          case 'error': {
            yield {
              [item.action]: {
                error: item.error,
                status: item.status,
              },
            } as ResultForWithActionResult<
              RouterType,
              Params
            >
            break
          }
        }
      }
    },
  }
}
