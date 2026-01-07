import { describe, expect, it } from 'vitest'
import { action, m, ValidationError } from '../..'

describe('action', () => {
  it('should execute action with valid parameters', async () => {
    const testAction = action(
      m.object({
        name: m.string(),
        age: m.number(),
      }),
      async ({ params }) => {
        return {
          message: `Hello ${params.name}, you are ${params.age} years old`,
        }
      },
    )

    const result = await testAction.run({
      params: { name: 'John', age: 30 },
    })

    expect(result).toEqual({
      message: 'Hello John, you are 30 years old',
    })
  })

  it('should throw ValidationError for invalid parameters', async () => {
    const testAction = action(
      m.object({
        name: m.string(),
        age: m.number(),
      }),
      async ({ params }) => {
        return { name: params.name, age: params.age }
      },
    )

    let hasThrown = false
    try {
      await testAction.run({
        params: {
          name: 'John',
          age: 'not-a-number' as never,
        },
      })
    } catch (error) {
      hasThrown = true
      expect(error).toBeInstanceOf(ValidationError)
    }

    expect(hasThrown).toBe(true)
  })

  it('should handle optional parameters', async () => {
    const testAction = action(
      m.object({
        name: m.string(),
        age: m.number().isOptional(),
      }),
      async ({ params }) => {
        return {
          name: params.name,
          age: params.age ?? null,
        }
      },
    )

    const result = await testAction.run({
      params: { name: 'John' },
    })

    expect(result).toEqual({
      name: 'John',
      age: null,
    })
  })

  it('should pass context to run function', async () => {
    interface TestContext {
      userId: string
    }

    const testAction = action(
      m.object({
        name: m.string(),
      }),
      async ({ params, ctx }) => {
        const context = ctx as TestContext
        return {
          name: params.name,
          userId: context.userId,
        }
      },
    )

    const result = await testAction.run({
      params: { name: 'John' },
      ctx: { userId: '123' },
    })

    expect(result).toEqual({
      name: 'John',
      userId: '123',
    })
  })

  it('should handle void return value', async () => {
    const testAction = action(
      m.object({
        name: m.string(),
      }),
      async ({ params }) => {
        // eslint-disable-next-line no-console
        console.log(`Processing ${params.name}`)
        // No return value
      },
    )

    const result = await testAction.run({
      params: { name: 'John' },
    })

    expect(result).toBeUndefined()
  })

  it('should provide clientActions function that can be called inside action', async () => {
    const testAction = action(
      m.object({
        name: m.string(),
      }),
      async ({ params, clientActions }) => {
        // clientActions should always be available and callable
        const actions = clientActions()
        expect(actions).toBeDefined()
        expect(typeof actions).toBe('object')
        // Should return empty object when no client actions defined
        expect(Object.keys(actions)).toHaveLength(0)
        return {
          name: params.name,
          hasClientActions: true,
        }
      },
    )

    const result = await testAction.run({
      params: { name: 'John' },
    })

    expect(result).toEqual({
      name: 'John',
      hasClientActions: true,
    })
  })
})
