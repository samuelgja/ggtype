[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: TestRouter\<Actions\>

Defined in: [src/utils/router-test-utils.ts:55](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/utils/router-test-utils.ts#L55)

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`ActionNotGeneric`](../type-aliases/ActionNotGeneric.md)\>

## Properties

### actions

> `readonly` **actions**: `TestRouterActions`\<`Actions`\>

Defined in: [src/utils/router-test-utils.ts:61](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/utils/router-test-utils.ts#L61)

Test actions that can be called directly

***

### cleanup()

> `readonly` **cleanup**: () => `void`

Defined in: [src/utils/router-test-utils.ts:65](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/utils/router-test-utils.ts#L65)

Cleanup function to stop the test server

#### Returns

`void`
