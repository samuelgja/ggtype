import { NOOP_ON_ERROR } from '../../types'
import { createId } from '../../utils/create-id'
import { handleError } from '../../utils/handle-error'
import { readable } from '../../utils/readable'
import { JSONL } from '../../utils/stream-helpers'
import {
  StreamMessageType,
  type OnRequestInternal,
  type StreamMessage,
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
    encoder,
  } = options

  const stream = readable({
    async start(controller) {
      let isControllerClosed = false
      const closeController = () => {
        if (isControllerClosed) {
          return
        }
        isControllerClosed = true
        controller.close()
      }
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
              send: (message) =>
                controller.enqueue(message),
              actionName,
              id,
              encoder,
              type: StreamMessageType.SERVER_ACTION_RESULT,
            })
          } catch (rawError) {
            const error = handleError(onError, rawError)
            if (error) {
              const message: StreamMessage = {
                action: actionName,
                id,
                status: 'error',
                error: error.error,
                type: StreamMessageType.SERVER_ACTION_RESULT,
                isLast: true,
              }
              const rawMessage = JSONL(message)
              const encodedMessage =
                encoder.encode(rawMessage)
              controller.enqueue(encodedMessage)
            }
            closeController()
          }
        }
        const promise = run()
        promises.push(promise)
      }
      await Promise.all(promises)
      closeController()
    },
  })

  return new Response(stream)
}
