import { NOOP_ON_ERROR } from '../../types'
import { createId } from '../../utils/create-id'
import { handleError } from '../../utils/handle-error'
import { JSONL } from '../../utils/stream-helpers'
import type {
  OnRequestInternal,
  StreamMessage,
} from '../router.type'
import { getParams } from './handle-http.request'
import { handleStreamResponse } from './handle-stream'

export async function handleStreamRequest(
  options: OnRequestInternal,
): Promise<Response> {
  const {
    request,
    callableActions,
    onError = NOOP_ON_ERROR,
    ctx,
  } = options

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const { params, files } = await getParams(request)
      const promises: Promise<void>[] = []
      for (const actionName in params) {
        const actionParams = params[actionName]
        const run = async () => {
          const id = createId()
          try {
            const actionResult = await callableActions({
              actionName,
              params: actionParams,
              files,
              ctx,
            })

            await handleStreamResponse({
              actionResult,
              controller,
              actionName,
              id,
              encoder,
            })
          } catch (rawError) {
            const error = handleError(onError, rawError)
            const message: StreamMessage = {
              action: actionName,
              id,
              status: 'error',
              error: error?.error,
            }
            const rawMessage = JSONL(message)
            const encodedMessage =
              encoder.encode(rawMessage)
            controller.enqueue(encodedMessage)
          }
        }
        const promise = run()
        promises.push(promise)
      }
      await Promise.all(promises)
      controller.close()
    },
  })

  return new Response(stream)
}
