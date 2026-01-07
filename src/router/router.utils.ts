import { ValidationError } from 'ajv'
import {
  compileModelAndCheck,
  type ValidationResult,
} from '../utils/compile-model'
import type { ClientCallableActions } from '../router-client/router-client.types'
import type {
  ClientActionsBase,
  ServerActionsBase,
  StreamMessage,
} from './router.type'
import {
  isAsyncIterable,
  isAsyncStream,
  isIterable,
} from '../utils/is'
import type { RouterResultNotGeneric } from '../types'

/**
 * Options for client action requests.
 * @group Router
 * @internal
 */
interface OnClientRequest {
  readonly params: unknown
  readonly actionName: string
}

/**
 * Options for calling actions.
 * @group Router
 * @internal
 */
interface CallOptions {
  readonly params: unknown
  readonly ctx?: unknown
  readonly actionName: string
  readonly files?: ReadonlyMap<string, File>
  readonly onClientActionCall?: (
    options: OnClientRequest,
  ) => Promise<RouterResultNotGeneric>
}

/**
 * Type for callable actions function.
 * @group Router
 * @internal
 */
export type CallableActions = (
  callOptions: CallOptions,
) => Promise<unknown>

/**
 * Creates a callable actions function that handles action execution.
 * @group Router
 * @internal
 * @template ServerActions - The server actions type
 * @template ClientActions - The client actions type
 * @param options - Options with serverActions and optional clientActions
 * @returns A callable actions function
 */
export function createCallableActions<
  ServerActions extends ServerActionsBase,
  ClientActions extends ClientActionsBase,
>(options: {
  readonly serverActions: ServerActions
  readonly clientActions?: ClientActions
}): CallableActions {
  const { serverActions, clientActions } = options

  const mappedClientActions = new Map<
    string,
    ValidationResult
  >()
  for (const actionName in clientActions) {
    const { return: returnModel } =
      clientActions[actionName]
    const validate = compileModelAndCheck(returnModel)
    mappedClientActions.set(actionName, validate)
  }

  return async function (callOptions: CallOptions) {
    const {
      params,
      ctx,
      actionName,
      onClientActionCall,
      files,
    } = callOptions
    const action = serverActions[actionName]
    if (!action) {
      throw new Error(`Action ${actionName} not found`)
    }

    const { run } = action

    const callableClientActions: ClientCallableActions<ClientActions> =
      {} as ClientCallableActions<ClientActions>

    for (const [
      clientActionName,
      validateResult,
    ] of mappedClientActions) {
      const clientActionFn = async (
        clientActionParams: unknown,
      ) => {
        if (!onClientActionCall) {
          throw new Error(
            `Client action ${clientActionName} is not available for this transport`,
          )
        }
        const result = await onClientActionCall({
          params: clientActionParams,
          actionName: clientActionName,
        })
        if (result.status === 'ok') {
          const errorResult = validateResult(result.data)
          if (errorResult) {
            throw new ValidationError(errorResult)
          }
        }
        return result
      }
      // Use type assertion with unknown cast trick to avoid erroneous generic indexer error from TypeScript,
      // while still enforcing correct structure.
      ;(callableClientActions as Record<string, unknown>)[
        clientActionName
      ] = clientActionFn
    }
    return run({
      params,
      ctx,
      clientActions() {
        return callableClientActions
      },
      files,
    })
  }
}

/**
 * Collects all values from a stream/iterable into an array.
 * Used for HTTP transport where we need to send all stream values in a single response.
 * @param actionResult - The action result which may be a stream/iterable
 * @returns An array of all collected values, or the original value if not a stream
 */
export async function collectStreamValues(
  actionResult: unknown,
): Promise<Array<unknown>> {
  if (
    !isAsyncStream(actionResult) &&
    !isAsyncIterable(actionResult) &&
    !isIterable(actionResult)
  ) {
    return [actionResult]
  }

  const collectedValues: unknown[] = []
  const iterable = actionResult as
    | AsyncIterable<unknown>
    | Iterable<unknown>

  // Handle async iterables
  if (
    isAsyncStream(actionResult) ||
    isAsyncIterable(actionResult)
  ) {
    for await (const value of iterable as AsyncIterable<unknown>) {
      collectedValues.push(value)
    }
  } else {
    // Handle sync iterables
    for (const value of iterable as Iterable<unknown>) {
      collectedValues.push(value)
    }
  }

  return collectedValues
}

/**
 * Reconstructs a File from a Blob when fileName is present in the stream message.
 * If fileName is not present, returns the original file/blob or data.
 * @group Router
 * @internal
 * @param item - The stream message containing file/blob and optional fileName
 * @returns The reconstructed File, original Blob, or data
 */
export function reconstructFileFromStreamMessage(
  item: StreamMessage,
): File | Blob | unknown {
  if (item.file && item.fileName) {
    return new File([item.file], item.fileName, {
      type: item.file.type,
    })
  }
  return item.file ?? item.data
}
