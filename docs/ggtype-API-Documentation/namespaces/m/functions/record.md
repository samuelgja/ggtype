[**ggtype API Documentation v0.4.8**](../../../../README.md)

***

# Function: record()

> **record**\<`M`\>(`item`): [`RecordModel`](../interfaces/RecordModel.md)\<`M`, `true`\>

Defined in: [src/model/record.ts:78](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/record.ts#L78)

Creates a record model for validating objects with dynamic keys.
Returns a model that validates objects where all values match the provided item model,
regardless of the keys. Useful for dictionaries and key-value stores.

## Type Parameters

### M

`M` *extends* [`ModelNotGeneric`](../interfaces/ModelNotGeneric.md)

The model type for record values

## Parameters

### item

`M`

The model to validate each value in the record against

## Returns

[`RecordModel`](../interfaces/RecordModel.md)\<`M`, `true`\>

A RecordModel instance for validating record objects

## Example

```ts
import { m } from 'ggtype'

// Record of strings (required by default)
const metadata = m.record(m.string())
// Valid: { key1: 'value1', key2: 'value2' }

// Record of numbers
const scores = m.record(m.number())
// Valid: { user1: 100, user2: 200 }

// Optional record
const optionalScores = m.record(m.number())

// Record of objects
const userData = m.record(
  m.object({ name: m.string(), age: m.number() })
)
```
