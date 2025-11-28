[**ggtype API Documentation v0.4.5**](../README.md)

***

# Type Alias: UnwrapStreamType\<T\>

> **UnwrapStreamType**\<`T`\> = `T` *extends* `void` ? `void` : `T` *extends* `ReadableStream`\<infer U\> ? `U` : `T` *extends* `AsyncStream`\<infer U\> ? `U` : `T` *extends* `AsyncIterable`\<infer U\> ? `U` : `T` *extends* readonly `unknown`[] ? `T` : `T` *extends* `Iterable`\<infer U\> ? `U` : `T`

Defined in: [src/types.ts:137](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L137)

## Type Parameters

### T

`T`
