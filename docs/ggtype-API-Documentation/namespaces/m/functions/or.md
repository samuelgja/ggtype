[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: or()

> **or**\<`M`\>(...`models`): [`OrModel`](../interfaces/OrModel.md)\<`M`, `false`\>

Defined in: [src/model/or.ts:71](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/or.ts#L71)

Creates a union model that accepts any of the provided models.
Validates data against each model in sequence, returning the first successful match.
Creates a union type where the value can be any of the provided model types.

## Type Parameters

### M

`M` *extends* [`ModelNotGeneric`](../interfaces/ModelNotGeneric.md)[]

Array of model types to union

## Parameters

### models

...`M`

Variable number of models to create a union from

## Returns

[`OrModel`](../interfaces/OrModel.md)\<`M`, `false`\>

An OrModel instance representing the union of all provided models

## Example

```ts
import { m } from 'ggtype'

// Union of string or number
const idOrName = m.or(m.string(), m.number()).isRequired()

// Union of different object types
const userOrAdmin = m.or(
  m.object({ type: m.enums('user').isRequired(), name: m.string().isRequired() }),
  m.object({ type: m.enums('admin').isRequired(), role: m.string().isRequired() })
).isRequired()
```
