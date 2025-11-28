[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: TestRouter\<Actions\>

Defined in: [src/utils/router-test-utils.ts:61](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/utils/router-test-utils.ts#L61)

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`ActionNotGeneric`](../type-aliases/ActionNotGeneric.md)\>

## Properties

### actions

> `readonly` **actions**: `TestRouterActions`\<`Actions`\>

Defined in: [src/utils/router-test-utils.ts:67](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/utils/router-test-utils.ts#L67)

Test actions that can be called directly

***

### cleanup()

> `readonly` **cleanup**: () => `void`

Defined in: [src/utils/router-test-utils.ts:71](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/utils/router-test-utils.ts#L71)

Cleanup function to stop the test server

#### Returns

`void`
