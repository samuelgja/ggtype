[**ggtype API Documentation v0.6.0**](../../../../README.md)

***

# Function: or()

> **or**\<`M`\>(...`models`): [`Or`](../interfaces/Or.md)\<`M`, `true`\>

Defined in: [src/model/or.ts:72](https://github.com/samuelgja/ggtype/blob/main/src/model/or.ts#L72)

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

[`Or`](../interfaces/Or.md)\<`M`, `true`\>

An Or instance representing the union of all provided models

## Example

```ts
import { m } from 'ggtype'

// Union of string or number (required by default)
const idOrName = m.or(m.string(), m.number())

// Optional union
const optionalId = m.or(m.string(), m.number())

// Union of different object types
const userOrAdmin = m.or(
  m.object({ type: m.enums('user'), name: m.string() }),
  m.object({ type: m.enums('admin'), role: m.string() })
)
```
