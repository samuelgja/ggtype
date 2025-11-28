[**ggtype API Documentation v0.4.5**](../README.md)

***

# Type Alias: UnwrapStreamType\<T\>

> **UnwrapStreamType**\<`T`\> = `T` *extends* `void` ? `void` : `T` *extends* `ReadableStream`\<infer U\> ? `U` : `T` *extends* `AsyncStream`\<infer U\> ? `U` : `T` *extends* `AsyncIterable`\<infer U\> ? `U` : `T` *extends* readonly `unknown`[] ? `T` : `T` *extends* `Iterable`\<infer U\> ? `U` : `T`

Defined in: [src/types.ts:92](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L92)

## Type Parameters

### T

`T`
