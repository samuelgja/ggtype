/* eslint-disable no-console */
import {
  action,
  m,
  NOOP_CLIENT_ACTIONS,
  type Infer,
  type ParamsInfer,
  type ResultInfer,
} from '../..'
import { createRouter } from '../router'

describe('router infer - just ts checks', () => {
  it('should infer the router', async () => {
    const item = m.object({ id: m.string().isRequired() })
    const actionItem = action(item, ({ params }) => {
      return params.id
    })

    const TEST = 'HELLO'
    const actionResult = actionItem.run({
      params: { id: '123' },
      clientActions: NOOP_CLIENT_ACTIONS,
    })
    if (TEST === actionResult) {
      console.log('test is equal to res')
    }

    const routerSeparate = createRouter({
      serverActions: {
        getUser: actionItem,
      },
    })

    const routerInline = createRouter({
      serverActions: {
        getUser: action(
          m.object({ id: m.string().isRequired() }),
          ({ params }) => {
            return params.id
          },
        ),
        setUser: action(
          m.object({ id: m.string().isRequired() }),
          ({ params }) => {
            return params.id
          },
        ),
        getManyItems: action(
          m.object({ id: m.string().isRequired() }),
          ({ params }) => {
            return {
              name: 'item',
              other: params.id,
            }
          },
        ),
      },
    })

    const actionTest = action(
      m.object({ id: m.string().isRequired() }),
      ({ params }) => {
        return {
          name: 'item',
          id: params.id,
        }
      },
    )
    const actionTestResult = actionTest.run({
      params: { id: '123' },
      clientActions: NOOP_CLIENT_ACTIONS,
    })
    console.log(actionTestResult.id)
    console.log(actionTestResult.name)

    type RouterSeparate = Infer<typeof routerSeparate>
    type GetUserSeparateParams = ParamsInfer<
      RouterSeparate,
      'getUser'
    >
    type GetUserSeparateResult = ResultInfer<
      RouterSeparate,
      'getUser'
    >
    const valueSeparate: GetUserSeparateResult = 'hello'
    const separateParams: GetUserSeparateParams = {
      id: '123',
    }
    console.log(separateParams)
    console.log(valueSeparate)

    console.log(routerSeparate.infer)
    console.log(routerInline.infer)

    type RouterInline = Infer<typeof routerInline>
    type GetUserInlineParams = ParamsInfer<
      RouterInline,
      'getUser'
    >
    type GetUserInlineResult = ResultInfer<
      RouterInline,
      'getUser'
    >
    type GetManyItemsInlineParams = ParamsInfer<
      RouterInline,
      'getManyItems'
    >
    type GetManyItemsInlineResult = ResultInfer<
      RouterInline,
      'getManyItems'
    >

    const valueInline: GetUserInlineResult = 'hello'
    console.log(valueInline)
    const inlineParams: GetUserInlineParams = { id: '123' }
    const inlineResult: GetUserInlineResult = 'hello'
    console.log(inlineParams)
    console.log(inlineResult)
    const manyItemsParams: GetManyItemsInlineParams = {
      id: '123',
    }
    console.log(manyItemsParams)
    const manyItemsResult: GetManyItemsInlineResult = {
      name: 'item',
      other: '123',
    }
    console.log(manyItemsResult)
  })
})
