import type {
  ClientActionsBase,
  Router,
  ServerActionsBase,
} from '../../router.type'
import type {
  FetchOptions,
  ParamsIt,
  ResultForWithActionResult,
  RouterClientState,
} from '../router-client.types'
import { handleHttpClient } from '../../transports/handle-http-client'
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
      throwClientError(new Error('httpURL is required'))
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
      if (!response.ok) {
        throw new Error(
          `HTTP request failed: ${response.status} ${response.statusText}`,
        )
      }
      const json = await response.json()
      return await onResponseHook({
        json,
        statusCode: response.status,
        runAgain,
      })
    } catch (error) {
      throwClientError(error)
      // This line is never reached, but TypeScript needs it for type checking
      throw new Error('Unreachable')
    }
  }

  return executeFetch
}
