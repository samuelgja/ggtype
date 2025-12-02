import type {
  FetchOptions,
  ParamsIt,
} from '../router.client.types'
import type { Router } from '../router.type'

export async function handleHttpClient<
  RouterType extends Router,
  Params extends ParamsIt<RouterType>,
>(
  httpURL: string | URL,
  params: Params,
  fetchOptions?: FetchOptions<RouterType>,
) {
  const { files, method = 'GET' } = fetchOptions || {}

  let request: Request | undefined
  switch (method) {
    case 'GET': {
      const url = new URL(httpURL)
      url.searchParams.set('q', JSON.stringify(params))
      request = new Request(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      break
    }
    case 'PUT':
    case 'DELETE':
    case 'PATCH':
    case 'POST': {
      if (files?.length) {
        const formData = new FormData()
        for (const file of files) {
          formData.append('file', file)
        }
        const url = new URL(httpURL)
        url.searchParams.set('q', JSON.stringify(params))
        request = new Request(url, {
          method,
          body: formData,
        })
      } else {
        request = new Request(httpURL, {
          method,
          body: JSON.stringify(params),
        })
      }
      break
    }
  }

  const response = await fetch(request)
  return response
}
