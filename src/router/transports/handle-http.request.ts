import { QUERY_PARAM_NAME } from '../../consts'
import {
  NOOP_ON_ERROR,
  type RouterResultNotGeneric,
} from '../../types'
import { isFile } from '../../utils/array-buffer-handler'
import { getHeaders } from '../../utils/get-headers'
import { handleError } from '../../utils/handle-error'
import { isStream } from '../../utils/is'
import type { OnRequestInternal } from '../router.type'

export function getParamsFromQuery(
  request: Request,
  strict: boolean = false,
) {
  const url = new URL(request.url)
  const query = url.searchParams.get(QUERY_PARAM_NAME)
  const hasQuery = query && query.length > 0
  let params: Record<string, unknown> = {}
  if (hasQuery) {
    const json = query ? JSON.parse(query) : {}
    params = json
  }
  if (strict && !hasQuery) {
    throw new Error(
      `Query param "${QUERY_PARAM_NAME}" is required`,
    )
  }
  return params
}

async function parseFormData(
  request: Request,
): Promise<Map<string, File>> {
  try {
    const formData = await request.formData()
    const files: Map<string, File> = new Map()

    // Convert FormData to a Map, handling multiple files with same key
    let fileIndex = 0
    for (const [key, v] of formData.entries()) {
      const value = v as unknown
      if (value instanceof File) {
        const fileKey = files.has(key)
          ? `file-${fileIndex}`
          : key
        files.set(fileKey, value)
        fileIndex++
      }
    }
    return files
  } catch {
    // If FormData parsing fails, return empty map
    // This prevents falling through to JSON parsing which would fail
    return new Map()
  }
}

async function parseJsonBody(
  request: Request,
): Promise<Record<string, unknown>> {
  try {
    return await request.json()
  } catch {
    // If JSON parsing fails, return empty object
    // Params from query are already set, so this is just a fallback
    return {}
  }
}

export async function getParams(request: Request) {
  let params = getParamsFromQuery(request)
  const { body } = request
  const headers = getHeaders(request)
  if (!(body instanceof ReadableStream)) {
    return { params, files: new Map() }
  }

  // we must detect if the body is a JSON object or a file or multipart form data
  const contentType = headers.get('Content-Type')

  if (contentType?.includes('multipart/form-data')) {
    const files = await parseFormData(request)
    return { params, files }
  }

  // Only try to parse as JSON if Content-Type suggests it's JSON
  // or if there's no Content-Type (might be empty body)
  const shouldParseAsJson =
    !contentType ||
    contentType.includes('application/json') ||
    contentType.includes('text/json')

  if (shouldParseAsJson) {
    const jsonParams = await parseJsonBody(request)
    params = { ...params, ...jsonParams }
  }

  return { params }
}

export async function handleHttpRequest(
  options: OnRequestInternal,
): Promise<Response> {
  const {
    request,
    callableActions,
    onError = NOOP_ON_ERROR,
    ctx,
  } = options

  const { params, files } = await getParams(request)
  const result: Record<string, RouterResultNotGeneric> = {}
  const promises: Promise<void>[] = []
  let maxStatusCode = 200

  for (const actionName in params) {
    const actionParams = params[actionName]
    const run = async () => {
      try {
        const actionResult = await callableActions({
          actionName,
          params: actionParams,
          ctx,
          files,
        })
        if (isStream(actionResult)) {
          throw new Error(
            'Stream results are not supported for HTTP transport',
          )
        }

        if (isFile(actionResult)) {
          // Files cannot be JSON serialized via HTTP transport
          // Return empty object {} to maintain backward compatibility
          // Files should be returned via stream/websocket transports
          result[actionName] = {
            status: 'ok',
            data: {},
          }
          return
        }

        result[actionName] = {
          status: 'ok',
          data: actionResult,
        }
      } catch (rawError) {
        const actionError = handleError(onError, rawError)
        if (actionError) {
          result[actionName] = actionError
          // Use the error code as the HTTP status code if available
          if (
            actionError.status === 'error' &&
            actionError.error?.code
          ) {
            const errorCode = actionError.error.code
            // Use the highest error code if multiple actions have errors
            if (errorCode > maxStatusCode) {
              maxStatusCode = errorCode
            }
          }
        }
      }
    }
    const promise = run()
    promises.push(promise)
  }
  await Promise.all(promises)
  return Response.json(result, { status: maxStatusCode })
}
