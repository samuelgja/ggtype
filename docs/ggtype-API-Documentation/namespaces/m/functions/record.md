[**ggtype API Documentation v0.4.7**](../../../../README.md)

***

# Function: record()

> **record**\<`M`\>(`item`): [`RecordModel`](../interfaces/RecordModel.md)\<`M`, `false`\>

Defined in: [src/model/record.ts:75](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/record.ts#L75)

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

[`RecordModel`](../interfaces/RecordModel.md)\<`M`, `false`\>

A RecordModel instance for validating record objects

## Example

```ts
import { m } from 'ggtype'

// Record of strings
const metadata = m.record(m.string()).isRequired()
// Valid: { key1: 'value1', key2: 'value2' }

// Record of numbers
const scores = m.record(m.number()).isRequired()
// Valid: { user1: 100, user2: 200 }

// Record of objects
const userData = m.record(
  m.object({ name: m.string().isRequired(), age: m.number() })
).isRequired()
```
