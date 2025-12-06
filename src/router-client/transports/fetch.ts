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
import { createErrorProcessor } from '../router-client.utils'

export function createFetchHandler<
  RouterType extends Router<
    ServerActionsBase,
    ClientActionsBase
  >,
>(options: {
  httpURL?: string | URL
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
    ) => Promise<
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
  const { httpURL, state, onResponse } = options
  const { throwClientError } = createErrorProcessor(
    state.onError,
  )

  type ResultForLocal<Params extends ParamsIt<RouterType>> =
    ResultForWithActionResult<RouterType, Params>

  async function onResponseHook<
    Params extends ParamsIt<RouterType>,
  >(onResponseHookOptions: {
    json: ResultForWithActionResult<RouterType, Params>
    statusCode: number
    runAgain: <
      NewParams extends ParamsIt<RouterType> = Params,
    >(
      newParams?: NewParams,
      newOptions?: FetchOptions<RouterType>,
    ) => Promise<
      ResultForWithActionResult<RouterType, NewParams>
    >
  }): Promise<
    ResultForWithActionResult<
      RouterType,
      ParamsIt<RouterType>
    >
  > {
    const { json, statusCode, runAgain } =
      onResponseHookOptions
    if (onResponse) {
      const modifiedJson = await onResponse({
        json,
        statusCode,
        runAgain,
      })
      if (modifiedJson !== undefined) {
        return modifiedJson
      }
    }
    return json
  }

  const executeFetch = async <
    Params extends ParamsIt<RouterType>,
  >(
    params: Params,
    fetchOptions?: FetchOptions<RouterType>,
  ): Promise<ResultForLocal<Params>> => {
    if (!httpURL) {
      throwClientError(
        new Error(
          'Missing HTTP URL. Please provide `httpURL` in routerClient options.',
        ),
      )
    }

    const runAgain = <
      NewParams extends ParamsIt<RouterType> = Params,
    >(
      newParams?: NewParams,
      newOptions?: FetchOptions<RouterType>,
    ): Promise<ResultForLocal<NewParams>> => {
      if (newParams !== undefined) {
        return executeFetch(
          newParams as unknown as Params,
          newOptions ?? fetchOptions,
        ) as Promise<ResultForLocal<NewParams>>
      }
      if (newOptions !== undefined) {
        return executeFetch(params, newOptions) as Promise<
          ResultForLocal<NewParams>
        >
      }
      return executeFetch(params, fetchOptions) as Promise<
        ResultForLocal<NewParams>
      >
    }

    try {
      const response = await handleHttpClient(
        httpURL!,
        params,
        fetchOptions,
        state.defaultHeaders,
      )
      const json = await response.json()
      // Always call onResponse hook to allow it to handle non-ok responses
      // The JSON response already contains errors in ActionResult format,
      // so we return it even if response.ok is false
      const result = await onResponseHook({
        json,
        statusCode: response.status,
        runAgain,
      })
      return result
    } catch (error) {
      throwClientError(error)
      // This line is never reached, but TypeScript needs it for type checking
      throw new Error('Unreachable')
    }
  }

  return executeFetch
}
