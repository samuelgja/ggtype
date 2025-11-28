[**ggtype API Documentation v0.4.5**](../README.md)

***

# Type Alias: ParamsInfer\<T, K\>

> **ParamsInfer**\<`T`, `K`\> = `T` *extends* `object` ? `K` *extends* keyof `SA` ? `SA`\[`K`\] *extends* `object` ? `P` : `never` : `never` : `K` *extends* keyof `T` ? `T`\[`K`\] *extends* `object` ? `P` : `never` : `never`

Defined in: [src/types.ts:392](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L392)

## Type Parameters

### T

`T` *extends* `RouterInferLike`

### K

`K` *extends* keyof `T` \| keyof `T` *extends* `object` ? `SA` : `never`
