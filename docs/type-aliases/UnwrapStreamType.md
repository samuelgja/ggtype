[**ggtype API Documentation v0.4.7**](../README.md)

***

# Type Alias: UnwrapStreamType\<T\>

> **UnwrapStreamType**\<`T`\> = `T` *extends* `void` ? `void` : `T` *extends* `ReadableStream`\<infer U\> ? `U` : `T` *extends* `AsyncStream`\<infer U\> ? `U` : `T` *extends* `AsyncIterable`\<infer U\> ? `U` : `T` *extends* readonly `unknown`[] ? `T` : `T` *extends* `Iterable`\<infer U\> ? `U` : `T`

Defined in: [src/types.ts:137](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L137)

## Type Parameters

### T

`T`
