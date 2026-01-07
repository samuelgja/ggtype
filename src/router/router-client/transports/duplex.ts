import type {
  ClientActionsBase,
  Router,
  ServerActionsBase,
  StreamMessage,
} from '../../router.type'
import type {
  DuplexOptions,
  ParamsIt,
  ResultForWithActionResult,
  RouterClientState,
} from '../router-client.types'
import { parseStreamResponse } from '../../transports/handle-stream'
import {
  createErrorProcessor,
  handleClientActionCall,
  mergeClientActions,
  sendInitialParams,
  streamMessageToResult,
} from '../router-client.utils'
import { readable } from '../../../utils/readable'

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
}) {
  const { halfDuplexUrl, state, defineClientActions } =
    options
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

    if (!halfDuplexUrl) {
      throwClientError(
        new Error('halfDuplexUrl is required'),
      )
    }

    const url = new URL(halfDuplexUrl!)
    const encoder = new TextEncoder()
    let controller:
      | ReadableStreamDefaultController<unknown>
      | undefined = undefined
    const readableStream = readable({
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
      throwClientError(error)
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
    ): Promise<ResultForLocal<Params> | null> => {
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
        return null
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

      return result as ResultForLocal<Params> | null
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

    try {
      for await (const item of stream) {
        const result = await processDuplexStreamItem(item)
        if (result) {
          yield result
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
