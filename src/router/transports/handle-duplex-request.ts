/* eslint-disable sonarjs/no-nested-functions */
import {
  NOOP_ON_ERROR,
  type RouterResultNotGeneric,
} from '../../types'
import { createId } from '../../utils/create-id'
import { handleError } from '../../utils/handle-error'
import { readable } from '../../utils/readable'
import { JSONL } from '../../utils/stream-helpers'
import {
  StreamMessageType,
  type OnRequestInternal,
  type StreamMessage,
} from '../router.type'
import {
  handleStreamResponse,
  parseStreamResponse,
} from './handle-stream'
import { reconstructFileFromStreamMessage } from '../router.utils'

export async function handleDuplexRequest(
  options: OnRequestInternal,
): Promise<Response> {
  const {
    request,
    callableActions,
    onError = NOOP_ON_ERROR,
    ctx,
    encoder,
    pendingClientActionCalls,
  } = options

  const stream = readable({
    async start(controller) {
      const files = new Map<string, File>()
      const promises: Promise<void>[] = []

      // Read from the client stream
      const processStream = async () => {
        const clientStream = request.body?.getReader()
        if (!clientStream) {
          return
        }
        const iterable = parseStreamResponse(clientStream)

        for await (const item of iterable) {
          if (
            item.type === StreamMessageType.UPLOAD_FILE &&
            item.file
          ) {
            files.set(
              item.id,
              new File([item.file], item.id),
            )
            continue
          }

          if (
            item.type ===
            StreamMessageType.WS_SEND_FROM_CLIENT
          ) {
            // Process action call
            const actionName = item.action
            const actionParams = item.file ?? item.data

            const run = async () => {
              const id = createId()
              try {
                const actionResult = await callableActions({
                  actionName,
                  params: actionParams,
                  ctx,
                  files,
                  onClientActionCall: async (
                    clientActionOptions,
                  ) => {
                    const clientActionId = createId()
                    await handleStreamResponse({
                      actionResult:
                        clientActionOptions.params,
                      send: (message) =>
                        controller.enqueue(message),
                      actionName:
                        clientActionOptions.actionName,
                      id: clientActionId,
                      encoder,
                      type: StreamMessageType.CLIENT_ACTION_CALL,
                    })
                    return new Promise<RouterResultNotGeneric>(
                      (resolve, reject) => {
                        pendingClientActionCalls.add(
                          clientActionId,
                          {
                            resolve: resolve as (
                              value: unknown,
                            ) => void,
                            reject,
                          },
                          () => {
                            reject(
                              new Error(
                                'Client action call expired',
                              ),
                            )
                          },
                        )
                      },
                    )
                  },
                })

                await handleStreamResponse({
                  actionResult,
                  send: (message) =>
                    controller.enqueue(message),
                  actionName,
                  id,
                  encoder,
                  type: StreamMessageType.RESPONSE,
                })
              } catch (rawError) {
                const error = handleError(onError, rawError)
                if (error) {
                  const message: StreamMessage = {
                    action: actionName,
                    id,
                    status: 'error',
                    error: error.error,
                    type: StreamMessageType.RESPONSE,
                    isLast: true,
                  }
                  const rawMessage = JSONL(message)
                  const encodedMessage =
                    encoder.encode(rawMessage)
                  controller.enqueue(encodedMessage)
                }
                // Don't close immediately - let it close naturally after all responses
              }
            }
            promises.push(run())
            continue
          }

          if (
            item.type ===
            StreamMessageType.CLIENT_ACTION_CALL_RESULT
          ) {
            const pending = pendingClientActionCalls.take(
              item.id,
            )
            if (!pending) {
              throw new Error(
                'Client action call result not found',
              )
            }
            const resultPayload: RouterResultNotGeneric =
              item.status === 'ok'
                ? {
                    status: 'ok',
                    data: reconstructFileFromStreamMessage(
                      item,
                    ),
                  }
                : {
                    status: 'error',
                    error: item.error,
                  }
            pending.resolve(resultPayload)
            continue
          }
        }
      }

      await processStream()
      await Promise.all(promises)
      controller.close()
    },
  })

  return new Response(stream)
}
