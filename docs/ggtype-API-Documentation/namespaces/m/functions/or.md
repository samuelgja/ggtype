[**ggtype API Documentation v0.4.8**](../../../../README.md)

***

# Function: or()

> **or**\<`M`\>(...`models`): [`OrModel`](../interfaces/OrModel.md)\<`M`, `true`\>

Defined in: [src/model/or.ts:74](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/or.ts#L74)

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

[`OrModel`](../interfaces/OrModel.md)\<`M`, `true`\>

An OrModel instance representing the union of all provided models

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
