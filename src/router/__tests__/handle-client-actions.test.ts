import { handleClientActions } from '../handle-client-actions'
import type { RouterMessage } from '../router-message'
import { createId } from '../../utils/create-id'

describe('handle-client-actions', () => {
  it('should preserve original action field in error responses', async () => {
    const clientActions = {
      testAction: async () => {
        throw new Error('Test error')
      },
      anotherAction: async () => {
        throw new Error('Another error')
      },
    }

    const handler = handleClientActions(clientActions)

    // Test first action
    const message1: RouterMessage = {
      id: createId(),
      action: 'testAction',
      status: 'ok',
      data: {},
    }

    const result1 = await handler(JSON.stringify(message1))
    const parsed1 = JSON.parse(result1) as RouterMessage

    expect(parsed1.action).toBe('testAction')
    expect(parsed1.status).toBe('error')
    expect(parsed1.error).toBeDefined()
    expect(parsed1.id).toBe(message1.id)

    // Test second action to ensure it's not hardcoded
    const message2: RouterMessage = {
      id: createId(),
      action: 'anotherAction',
      status: 'ok',
      data: {},
    }

    const result2 = await handler(JSON.stringify(message2))
    const parsed2 = JSON.parse(result2) as RouterMessage

    expect(parsed2.action).toBe('anotherAction')
    expect(parsed2.status).toBe('error')
    expect(parsed2.error).toBeDefined()
    expect(parsed2.id).toBe(message2.id)
  })

  it('should preserve action field even when action name contains special characters', async () => {
    const clientActions = {
      'action-with-dashes': async () => {
        throw new Error('Error with dashes')
      },
    }

    const handler = handleClientActions(clientActions)

    const message: RouterMessage = {
      id: createId(),
      action: 'action-with-dashes',
      status: 'ok',
      data: {},
    }

    const result = await handler(JSON.stringify(message))
    const parsed = JSON.parse(result) as RouterMessage

    expect(parsed.action).toBe('action-with-dashes')
    expect(parsed.status).toBe('error')
  })

  it('should preserve clientId in error responses', async () => {
    const clientActions = {
      testAction: async () => {
        throw new Error('Test error')
      },
    }

    const handler = handleClientActions(clientActions)

    const message: RouterMessage = {
      id: createId(),
      action: 'testAction',
      status: 'ok',
      data: {},
      clientId: 'test-client-id',
    }

    const result = await handler(JSON.stringify(message))
    const parsed = JSON.parse(result) as RouterMessage

    expect(parsed.action).toBe('testAction')
    expect(parsed.clientId).toBe('test-client-id')
    expect(parsed.status).toBe('error')
  })
})
