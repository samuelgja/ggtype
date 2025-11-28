[**ggtype API Documentation v0.4.5**](../README.md)

***

# Function: compileModelAndCheck()

> **compileModelAndCheck**\<`T`\>(`model`): (`data`) => `ErrorObject`\<`string`, `Record`\<`string`, `any`\>, `unknown`\>[] \| `null`

Defined in: [src/utils/compile-model.ts:95](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/utils/compile-model.ts#L95)

Compiles a model into a validation function that checks data against the model's schema.
Uses AJV to compile the model's schema reference and returns a function that validates data.
Returns validation errors if the data doesn't match the schema, or null if valid.

## Type Parameters

### T

`T` *extends* [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md)

The model type

## Parameters

### model

`T`

The model to compile

## Returns

A validation function that returns validation errors or null

> (`data`): `ErrorObject`\<`string`, `Record`\<`string`, `any`\>, `unknown`\>[] \| `null`

### Parameters

#### data

`T`\[`"infer"`\]

### Returns

`ErrorObject`\<`string`, `Record`\<`string`, `any`\>, `unknown`\>[] \| `null`
