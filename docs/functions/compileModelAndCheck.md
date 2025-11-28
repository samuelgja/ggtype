[**ggtype API Documentation v0.4.7**](../README.md)

***

# Function: compileModelAndCheck()

> **compileModelAndCheck**\<`T`\>(`model`): (`data`) => `ErrorObject`\<`string`, `Record`\<`string`, `any`\>, `unknown`\>[] \| `null`

Defined in: [src/utils/compile-model.ts:97](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/utils/compile-model.ts#L97)

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
