[**ggtype API Documentation v0.4.8**](../README.md)

***

# Interface: TestRouter\<Actions\>

Defined in: [src/utils/router-test-utils.ts:61](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/utils/router-test-utils.ts#L61)

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`ActionNotGeneric`](../type-aliases/ActionNotGeneric.md)\>

## Properties

### actions

> `readonly` **actions**: `TestRouterActions`\<`Actions`\>

Defined in: [src/utils/router-test-utils.ts:67](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/utils/router-test-utils.ts#L67)

Test actions that can be called directly

***

### cleanup()

> `readonly` **cleanup**: () => `void`

Defined in: [src/utils/router-test-utils.ts:71](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/utils/router-test-utils.ts#L71)

Cleanup function to stop the test server

#### Returns

`void`
