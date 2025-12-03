[**ggtype API Documentation v0.5.1**](../README.md)

***

# Type Alias: UnwrapStreamType\<T\>

> **UnwrapStreamType**\<`T`\> = `T` *extends* `void` ? `void` : `T` *extends* `ReadableStream`\<infer U\> ? `U` : `T` *extends* `AsyncStream`\<infer U\> ? `U` : `T` *extends* `AsyncIterable`\<infer U\> ? `U` : `T` *extends* readonly `unknown`[] ? `T` : `T` *extends* `Iterable`\<infer U\> ? `U` : `T`

Defined in: [src/types.ts:138](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L138)

## Type Parameters

### T

`T`
