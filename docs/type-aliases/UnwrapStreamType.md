[**ggtype API Documentation v0.4.8**](../README.md)

***

# Type Alias: UnwrapStreamType\<T\>

> **UnwrapStreamType**\<`T`\> = `T` *extends* `void` ? `void` : `T` *extends* `ReadableStream`\<infer U\> ? `U` : `T` *extends* `AsyncStream`\<infer U\> ? `U` : `T` *extends* `AsyncIterable`\<infer U\> ? `U` : `T` *extends* readonly `unknown`[] ? `T` : `T` *extends* `Iterable`\<infer U\> ? `U` : `T`

Defined in: [src/types.ts:137](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L137)

## Type Parameters

### T

`T`
