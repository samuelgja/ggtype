import type {
  ClientActionsBase,
  Router,
  ServerActionsBase,
} from '../../router.type'
import type {
  DuplexActionsProxyType,
  DuplexOptions,
  FetchActionsProxyType,
  FetchOptions,
  ParamsIt,
  ResultForWithActionResult,
  StreamActionsProxyType,
} from '../router-client.types'

export function createFetchActionsProxy<
  RouterType extends Router<
    ServerActionsBase,
    ClientActionsBase
  >,
>(
  executeFetch: <Params extends ParamsIt<RouterType>>(
    params: Params,
    fetchOptions?: FetchOptions<RouterType>,
  ) => Promise<
    ResultForWithActionResult<RouterType, Params>
  >,
): FetchActionsProxyType<RouterType> {
  return new Proxy(
    {} as FetchActionsProxyType<RouterType>,
    {
      get(_target, actionName: string | symbol) {
        if (typeof actionName !== 'string') {
          return
        }
        return async (
          params: unknown,
          options?: FetchOptions<RouterType>,
        ) => {
          const result = await executeFetch(
            {
              [actionName]: params,
            } as unknown as ParamsIt<RouterType>,
            options,
          )
          return result[actionName as keyof typeof result]
        }
      },
    },
  ) as FetchActionsProxyType<RouterType>
}

export function createStreamActionsProxy<
  RouterType extends Router<
    ServerActionsBase,
    ClientActionsBase
  >,
>(
  streamFn: <Params extends ParamsIt<RouterType>>(
    params: Params,
    options?: FetchOptions<RouterType>,
  ) => AsyncGenerator<
    ResultForWithActionResult<RouterType, Params>
  >,
): StreamActionsProxyType<RouterType> {
  return new Proxy(
    {} as StreamActionsProxyType<RouterType>,
    {
      get(_target, actionName: string | symbol) {
        if (typeof actionName !== 'string') {
          return
        }
        return async function* (
          params: unknown,
          options?: FetchOptions<RouterType>,
        ) {
          for await (const result of streamFn(
            {
              [actionName]: params,
            } as unknown as ParamsIt<RouterType>,
            options,
          )) {
            const actionResult =
              result[actionName as keyof typeof result]
            if (actionResult != undefined) {
              yield actionResult
            }
          }
        }
      },
    },
  ) as StreamActionsProxyType<RouterType>
}

export function createDuplexActionsProxy<
  RouterType extends Router<
    ServerActionsBase,
    ClientActionsBase
  >,
>(
  duplexFn: <Params extends ParamsIt<RouterType>>(
    params: Params,
    options?: DuplexOptions<RouterType>,
  ) => AsyncGenerator<
    ResultForWithActionResult<RouterType, Params>
  >,
): DuplexActionsProxyType<RouterType> {
  return new Proxy(
    {} as DuplexActionsProxyType<RouterType>,
    {
      get(_target, actionName: string | symbol) {
        if (typeof actionName !== 'string') {
          return
        }
        return async function* (
          params: unknown,
          options?: DuplexOptions<RouterType>,
        ) {
          for await (const result of duplexFn(
            {
              [actionName]: params,
            } as unknown as ParamsIt<RouterType>,
            options,
          )) {
            const actionResult =
              result[actionName as keyof typeof result]
            if (actionResult != undefined) {
              yield actionResult
            }
          }
        }
      },
    },
  ) as DuplexActionsProxyType<RouterType>
}
