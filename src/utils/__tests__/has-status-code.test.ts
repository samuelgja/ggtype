import { describe, expect, it } from 'vitest'
import { hasStatusCode } from '../is'
import type { RouterResultNotGeneric } from '../../types'

describe('hasStatusCode', () => {
  it('should return true when any action result has the specified status code', () => {
    const json: Record<string, RouterResultNotGeneric> = {
      getUser: {
        status: 'error',
        error: {
          type: 'generic',
          code: 401,
          message: 'Unauthorized',
        },
      },
      getPosts: {
        status: 'ok',
        data: [],
      },
    }

    expect(hasStatusCode(json, 401)).toBe(true)
  })

  it('should return false when no action result has the specified status code', () => {
    const json: Record<string, RouterResultNotGeneric> = {
      getUser: {
        status: 'error',
        error: {
          type: 'generic',
          code: 403,
          message: 'Forbidden',
        },
      },
      getPosts: {
        status: 'ok',
        data: [],
      },
    }

    expect(hasStatusCode(json, 401)).toBe(false)
  })

  it('should return false when all actions are successful', () => {
    const json: Record<string, RouterResultNotGeneric> = {
      getUser: {
        status: 'ok',
        data: { id: '1', name: 'John' },
      },
      getPosts: {
        status: 'ok',
        data: [],
      },
    }

    expect(hasStatusCode(json, 401)).toBe(false)
  })

  it('should return true for validation errors with the specified code', () => {
    const json: Record<string, RouterResultNotGeneric> = {
      createUser: {
        status: 'error',
        error: {
          type: 'validation',
          code: 400,
          message: 'Validation error',
          errors: [],
        },
      },
    }

    expect(hasStatusCode(json, 400)).toBe(true)
  })

  it('should return false for empty object', () => {
    const json: Record<string, RouterResultNotGeneric> = {}

    expect(hasStatusCode(json, 401)).toBe(false)
  })

  it('should return false for non-object input', () => {
    expect(hasStatusCode(null as never, 401)).toBe(false)
    expect(hasStatusCode(undefined as never, 401)).toBe(false)
    expect(hasStatusCode('string' as never, 401)).toBe(false)
    expect(hasStatusCode(123 as never, 401)).toBe(false)
  })

  it('should return true when multiple actions have errors but one matches', () => {
    const json: Record<string, RouterResultNotGeneric> = {
      getUser: {
        status: 'error',
        error: {
          type: 'generic',
          code: 404,
          message: 'Not found',
        },
      },
      getPosts: {
        status: 'error',
        error: {
          type: 'generic',
          code: 401,
          message: 'Unauthorized',
        },
      },
    }

    expect(hasStatusCode(json, 401)).toBe(true)
    expect(hasStatusCode(json, 404)).toBe(true)
    expect(hasStatusCode(json, 403)).toBe(false)
  })

  it('should handle error without code property gracefully', () => {
    const json: Record<string, RouterResultNotGeneric> = {
      getUser: {
        status: 'error',
        error: {
          type: 'generic',
          code: 401,
          message: 'Unauthorized',
        },
      },
    }

    // Should still work correctly
    expect(hasStatusCode(json, 401)).toBe(true)
  })
})
