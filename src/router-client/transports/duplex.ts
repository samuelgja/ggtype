/* eslint-disable sonarjs/cognitive-complexity */
import type {
  ClientActionsBase,
  Router,
  ServerActionsBase,
  StreamMessage,
} from '../../router/router.type'
import type {
  DuplexOptions,
  ParamsIt,
  ResultForWithActionResult,
  RouterClientState,
} from '../router-client.types'
import { readable } from '../../utils/readable'
import { parseStreamResponse } from '../../router/transports/handle-stream'
import {
  createErrorProcessor,
  handleClientActionCall,
  isAsyncGenerator,
  mergeClientActions,
  sendInitialParams,
  streamMessageToResult,
} from '../router-client.utils'

export function createDuplexHandler<
  RouterType extends Router<
    ServerActionsBase,
    ClientActionsBase
  >,
>(options: {
  halfDuplexUrl?: string | URL
  state: RouterClientState
  defineClientActions?: Record<
    string,
    (params: unknown) => Promise<unknown>
  >
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
      newOptions?: DuplexOptions<RouterType>,
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
  const {
    halfDuplexUrl,
    state,
    defineClientActions,
    onResponse,
  } = options
  const { throwClientError } = createErrorProcessor(
    state.onError,
  )

  type ResultForLocal<Params extends ParamsIt<RouterType>> =
    ResultForWithActionResult<RouterType, Params>

  return async function* <
    Params extends ParamsIt<RouterType>,
  >(
    params: Params,
    fetchOptions?: DuplexOptions<RouterType>,
  ): AsyncGenerator<ResultForLocal<Params>> {
    const {
      defineClientActions: maybeClientActions,
      files = [],
    } = fetchOptions ?? {}
    const clientActions = mergeClientActions(
      defineClientActions,
      maybeClientActions,
    )

    const createHandler = () =>
      createDuplexHandler<RouterType>({
        halfDuplexUrl,
        state,
        defineClientActions,
        onResponse,
      })

    const runAgain = <
      NewParams extends ParamsIt<RouterType> = Params,
    >(
      newParams?: NewParams,
      newOptions?: DuplexOptions<RouterType>,
    ): AsyncGenerator<ResultForLocal<NewParams>> => {
      const handler = createHandler()
      const finalParams =
        newParams === undefined
          ? params
          : (newParams as unknown as Params)
      const finalOptions = newOptions ?? fetchOptions
      return handler(
        finalParams,
        finalOptions,
      ) as AsyncGenerator<ResultForLocal<NewParams>>
    }

    if (!halfDuplexUrl) {
      throwClientError(
        new Error(
          'Missing duplex URL. Please provide `halfDuplexUrl` in routerClient options.',
        ),
      )
    }

    const url = new URL(halfDuplexUrl!)
    const encoder = new TextEncoder()
    let controller:
      | ReadableStreamDefaultController<Uint8Array>
      | undefined = undefined
    const readableStream = readable<Uint8Array>({
      async start(c) {
        controller = c
        await sendInitialParams(
          params,
          files,
          encoder,
          (message) => controller?.enqueue(message),
        )
      },
    })
    const headers = new Headers(state.defaultHeaders)
    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        body: readableStream,
        headers,
        duplex: 'half',
      })
    } catch (error) {
      throwClientError(
        error instanceof Error
          ? error
          : new Error(JSON.stringify(error)),
      )
    }
    // TypeScript: response is definitely assigned because throwClientError never returns
    const finalResponse = response!
    const reader = finalResponse.body?.getReader()
    if (!reader) {
      throwClientError(new Error('Reader is not available'))
    }
    const stream = parseStreamResponse(
      reader as ReadableStreamDefaultReader<Uint8Array>,
    )
    let isControllerClosed = false

    const duplexSendFunction = (message: Uint8Array) => {
      if (!controller || isControllerClosed) {
        throwClientError(
          new Error('Controller is not available'),
        )
      }
      // TypeScript: controller is defined after the check above
      controller!.enqueue(message)
    }

    const processDuplexStreamItem = async (
      item: StreamMessage,
    ): Promise<{
      result: ResultForLocal<Params> | null
      isLast: boolean
    }> => {
      const handled = await handleClientActionCall(
        item,
        clientActions as Record<
          string,
          (params: unknown) => Promise<unknown>
        >,
        encoder,
        duplexSendFunction,
        state.onError,
      )
      if (handled) {
        return { result: null, isLast: false }
      }

      const result = streamMessageToResult<Params>(item)
      if (
        item.isLast &&
        controller &&
        !isControllerClosed
      ) {
        isControllerClosed = true
        ;(controller as { close: () => void }).close()
      }

      return {
        result: result as ResultForLocal<Params> | null,
        isLast: item.isLast ?? false,
      }
    }

    const closeDuplexController = (): void => {
      if (controller && !isControllerClosed) {
        try {
          isControllerClosed = true
          ;(controller as { close: () => void }).close()
        } catch {
          // Controller might already be closed
        }
      }
    }

    const processStreamResult = async (
      result: ResultForLocal<Params>,
      isLast: boolean,
    ): Promise<
      | ResultForLocal<Params>
      | AsyncGenerator<ResultForLocal<Params>>
      | null
    > => {
      if (!onResponse || !isLast) {
        return result
      }

      // For duplex, we can't easily get the status code from individual messages
      // Use 200 as default since errors are in the ActionResult format
      const modifiedResult = await onResponse({
        json: result,
        statusCode: 200,
        runAgain,
      })
      if (modifiedResult === undefined) {
        return result
      }

      if (
        isAsyncGenerator<ResultForLocal<Params>>(
          modifiedResult,
        )
      ) {
        return modifiedResult
      }

      return modifiedResult as ResultForLocal<Params>
    }

    try {
      for await (const item of stream) {
        const { result, isLast } =
          await processDuplexStreamItem(item)
        if (result) {
          const finalResult = await processStreamResult(
            result,
            isLast,
          )
          if (!finalResult) {
            continue
          }

          if (
            isAsyncGenerator<ResultForLocal<Params>>(
              finalResult,
            )
          ) {
            for await (const rerunResult of finalResult) {
              yield rerunResult
            }
            continue
          }

          yield finalResult
        }
      }
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        // Stream was closed, but we might have already processed the error
        // Let the error propagate if we haven't yielded anything
      } else {
        throw error
      }
    } finally {
      closeDuplexController()
    }
  }
}
