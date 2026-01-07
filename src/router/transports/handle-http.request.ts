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
    return { params, files }
  }

  const json = await request.json()
  params = json
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
          // Files cannot be JSON serialized, convert to Blob-like object
          const file = actionResult as File
          result[actionName] = {
            status: 'ok',
            data: new Blob([file], { type: file.type }),
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
