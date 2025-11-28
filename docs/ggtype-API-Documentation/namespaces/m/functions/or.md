[**ggtype API Documentation v0.4.7**](../../../../README.md)

***

# Function: or()

> **or**\<`M`\>(...`models`): [`OrModel`](../interfaces/OrModel.md)\<`M`, `false`\>

Defined in: [src/model/or.ts:71](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/or.ts#L71)

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
