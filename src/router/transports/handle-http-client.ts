import { QUERY_PARAM_NAME } from '../../consts'
import type {
  FetchOptions,
  ParamsIt,
} from '../../router-client/router-client.types'
import { getHeaders } from '../../utils/get-headers'
import type { Router } from '../router.type'

function stringifyParams(params: unknown): string {
  // Convert undefined to null for optional params
  const serialized = JSON.stringify(
    params,
    (_key, value) => {
      if (value === undefined) {
        return null
      }
      return value
    },
  )
  return serialized ?? 'null'
}

export async function handleHttpClient<
  RouterType extends Router,
  Params extends ParamsIt<RouterType>,
>(
  httpURL: string | URL,
  params: Params,
  fetchOptions?: FetchOptions<RouterType>,
  defaultHeaders?: Headers,
) {
  const { files, method } = fetchOptions ?? {}
  const hasFiles = Boolean(files?.length)
  const resolvedMethod =
    method ?? (hasFiles ? 'POST' : 'GET')
  const serializedParams = stringifyParams(params)

  const buildHeaders = (
    shouldSetJsonContentType: boolean,
    request?: Request,
  ): Headers => {
    const headers = request
      ? getHeaders(request, defaultHeaders)
      : new Headers(defaultHeaders)
    if (
      shouldSetJsonContentType &&
      !headers.has('Content-Type')
    ) {
      headers.set('Content-Type', 'application/json')
    }
    return headers
  }

  let request: Request | undefined
  switch (resolvedMethod) {
    case 'GET': {
      if (hasFiles) {
        throw new Error(
          'GET requests cannot include files. Use POST instead.',
        )
      }
      const url = new URL(httpURL)
      url.searchParams.set(
        QUERY_PARAM_NAME,
        serializedParams,
      )
      request = new Request(url, {
        method: resolvedMethod,
        headers: buildHeaders(true),
      })
      break
    }
    case 'PUT':
    case 'DELETE':
    case 'PATCH':
    case 'POST': {
      if (hasFiles) {
        const formData = new FormData()
        for (const file of files ?? []) {
          formData.append('file', file)
        }
        const url = new URL(httpURL)
        url.searchParams.set(
          QUERY_PARAM_NAME,
          serializedParams,
        )
        request = new Request(url, {
          method: resolvedMethod,
          body: formData,
          headers: buildHeaders(false),
        })
      } else {
        const headers = buildHeaders(true)
        request = new Request(httpURL, {
          method: resolvedMethod,
          body: serializedParams,
          headers,
        })
      }
      break
    }
    default: {
      throw new Error(
        `Unsupported HTTP method: ${resolvedMethod}`,
      )
    }
  }

  const response = await fetch(request)
  return response
}
