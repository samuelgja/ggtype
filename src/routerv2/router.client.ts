/* eslint-disable sonarjs/no-nested-functions */
/* eslint-disable sonarjs/cognitive-complexity */

import { createId } from '../utils/create-id'
import { hasStreamData } from '../utils/is'
import {
  UPLOAD_FILE,
  type DuplexOptions,
  type FetchOptions,
  type ParamsIt,
  type ResultForWithActionResult,
  type RouterClientOptions,
  type RouterClientState,
  type WebsocketOptions,
} from './router.client.types'
import {
  StreamMessageType,
  type ClientActionsBase,
  type Router,
  type ServerActionsBase,
} from './router.type'
import { handleHttpClient } from './transports/handle-http-client'
import {
  handleStreamResponse,
  Parser,
  parseStreamResponse,
} from './transports/handle-stream'

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
    onResponse,
    responseTimeout,
    streamURL,
    websocketURL,
  } = options

  type ResultForLocal<Params extends ParamsIt<RouterType>> =
    ResultForWithActionResult<RouterType, Params>

  const state: RouterClientState = {
    defaultHeaders: {},
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

      const response = await handleHttpClient(
        httpURL,
        params,
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

      const response = await handleHttpClient(
        streamURL,
        params,
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
        if (!hasStreamData(item)) {
          continue
        }
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
      fetchOptions?: DuplexOptions<RouterType>,
    ): AsyncGenerator<ResultForLocal<Params>> {
      const {
        defineClientActions: maybeClientActions,
        files = [],
      } = fetchOptions ?? {}
      const clientActions = {
        ...defineClientActions,
        ...maybeClientActions,
      }
      if (!halfDuplexUrl) {
        throw new Error('streamURL is required')
      }

      const url = new URL(halfDuplexUrl)

      const encoder = new TextEncoder()
      let controller:
        | ReadableStreamDefaultController<unknown>
        | undefined = undefined
      const readableStream = new ReadableStream({
        async start(c) {
          controller = c
          // Send files first, similar to WebSocket
          for (const file of files) {
            await handleStreamResponse({
              actionName: UPLOAD_FILE,
              actionResult: file,
              encoder,
              send: (message) =>
                controller?.enqueue(message),
              id: createId(),
              type: StreamMessageType.UPLOAD_FILE,
            })
          }

          // Send actions
          for (const actionName in params) {
            const actionParams = params[actionName]
            await handleStreamResponse({
              actionName,
              actionResult: actionParams,
              encoder,
              send: (message) => controller?.enqueue(message),
              id: createId(),
              type: StreamMessageType.WS_SEND_FROM_CLIENT,
            })
          }
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
        if (!hasStreamData(item)) {
          continue
        }
        if (
          item.type === StreamMessageType.CLIENT_ACTION_CALL
        ) {
          const clientAction = clientActions[item.action]
          if (!clientAction) {
            throw new Error(
              `Client action ${item.action} not found`,
            )
          }
          const result = await clientAction(item.data)
          if (!controller) {
            throw new Error('Controller is not available')
          }
          await handleStreamResponse({
            actionName: item.action,
            actionResult: result,
            id: item.id,
            encoder,
            type: StreamMessageType.CLIENT_ACTION_CALL_RESULT,
            send: (message) => controller?.enqueue(message),
          })
          continue
        }
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
        if (controller) {
          ;(controller as { close: () => void }).close()
        }
      }
    },

    async *websocket<Params extends ParamsIt<RouterType>>(
      params: Params,
      websocketOptions?: WebsocketOptions<RouterType>,
    ): AsyncGenerator<ResultForLocal<Params>> {
      const {
        defineClientActions: maybeClientActions,
        files = [],
      } = websocketOptions ?? {}

      const clientActions = {
        ...defineClientActions,
        ...maybeClientActions,
      }
      if (!websocketURL) {
        throw new Error('websocketURL is required')
      }
      const encoder = new TextEncoder()
      const ws = new WebSocket(websocketURL)
      const numberOfActions = Object.keys(params).length
      let actionsResolved = 0

      const parser = new Parser()
      let isControllerClosed = false
      const stream = new ReadableStream({
        async start(controller) {
          ws.addEventListener(
            'message',
            async ({ data }) => {
              if (isControllerClosed) {
                return
              }
              if (!(data instanceof Uint8Array)) {
                return
              }
              const messages = await parser.feed(data)
              for (const item of messages) {
                if (isControllerClosed) {
                  return
                }
                if (!hasStreamData(item)) {
                  continue
                }
                if (
                  item.type ===
                  StreamMessageType.CLIENT_ACTION_CALL
                ) {
                  const clientAction =
                    clientActions[item.action]
                  if (!clientAction) {
                    throw new Error(
                      `Client action ${item.action} not found`,
                    )
                  }
                  const result = await clientAction(
                    item.data,
                  )
                  await handleStreamResponse({
                    actionName: item.action,
                    actionResult: result,
                    id: item.id,
                    encoder,
                    type: StreamMessageType.CLIENT_ACTION_CALL_RESULT,
                    send: (message) => ws.send(message),
                  })
                  continue
                }
                if (
                  item.type ===
                  StreamMessageType.CLIENT_ACTION_CALL_RESULT
                ) {
                  // Client action call results are internal protocol messages,
                  // consumed by the server, not yielded to the user
                  continue
                }
                switch (item.status) {
                  case 'ok': {
                    if (!isControllerClosed) {
                      controller.enqueue({
                        [item.action]: {
                          data: item.file ?? item.data,
                          status: item.status,
                        },
                      } as ResultForWithActionResult<
                        RouterType,
                        Params
                      >)
                      if (item.isLast) {
                        actionsResolved++
                      }
                    }
                    break
                  }
                  case 'error': {
                    if (!isControllerClosed) {
                      controller.enqueue({
                        [item.action]: {
                          error: item.error,
                          status: item.status,
                        },
                      } as ResultForWithActionResult<
                        RouterType,
                        Params
                      >)
                      if (item.isLast) {
                        actionsResolved++
                      }
                    }
                    break
                  }
                }
              }

              if (
                actionsResolved === numberOfActions &&
                !isControllerClosed
              ) {
                isControllerClosed = true
                controller.close()
              }
            },
          )
          ws.addEventListener('open', async () => {
            for (const file of files) {
              await handleStreamResponse({
                actionName: UPLOAD_FILE,
                actionResult: file,
                encoder,
                send: (message) => ws.send(message),
                id: createId(),
                type: StreamMessageType.UPLOAD_FILE,
              })
            }
            for (const actionName in params) {
              const actionParams = params[actionName]
              await handleStreamResponse({
                actionName,
                actionResult: actionParams,
                encoder,
                send: (message) => ws.send(message),
                id: createId(),
                type: StreamMessageType.WS_SEND_FROM_CLIENT,
              })
            }
          })
          ws.addEventListener('close', () => {
            if (isControllerClosed) {
              return
            }
            const tail = parser.finalize({
              allowUploadHeaderWithoutFile: true,
            })
            for (const item of tail) {
              if (isControllerClosed) {
                break
              }
              switch (item.status) {
                case 'ok': {
                  if (!isControllerClosed) {
                    controller.enqueue({
                      [item.action]: {
                        data: item.file ?? item.data,
                        status: item.status,
                      },
                    } as ResultForWithActionResult<
                      RouterType,
                      Params
                    >)
                  }
                  break
                }
                case 'error': {
                  if (!isControllerClosed) {
                    controller.enqueue({
                      [item.action]: {
                        error: item.error,
                        status: item.status,
                      },
                    } as ResultForWithActionResult<
                      RouterType,
                      Params
                    >)
                  }
                  break
                }
              }
            }
            if (!isControllerClosed) {
              isControllerClosed = true
              controller.close()
            }
            ws.close()
          })
          ws.addEventListener('error', (event) => {
            ws.close()
          })
        },
      })
      for await (const item of stream) {
        yield item
      }
    },
  }
}
