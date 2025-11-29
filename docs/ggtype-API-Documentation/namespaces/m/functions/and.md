[**ggtype API Documentation v0.4.8**](../../../../README.md)

***

# Function: and()

> **and**\<`M`\>(...`models`): [`AndModel`](../interfaces/AndModel.md)\<`M`, `true`\>

Defined in: [src/model/and.ts:77](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/and.ts#L77)

Creates an intersection model that combines multiple object models.
Merges all properties from the provided models into a single object model,
creating an intersection type. Useful for composing complex object structures.

## Type Parameters

### M

`M` *extends* [`ModelNotGeneric`](../interfaces/ModelNotGeneric.md)[]

Array of model types to intersect

## Parameters

### models

...`M`

Variable number of models to combine

## Returns

[`AndModel`](../interfaces/AndModel.md)\<`M`, `true`\>

An AndModel instance representing the intersection of all provided models

## Example

```ts
import { m } from 'ggtype'

// Base user model
const userBase = m.object({
  id: m.string(),
  name: m.string(),
})

// Role model
const roleModel = m.object({
  role: m.enums('admin', 'user'),
  permissions: m.array(m.string()),
})

// Combined user with role (required by default)
const userWithRole = m.and(userBase, roleModel)
// Result: { id: string, name: string, role: 'admin' | 'user', permissions?: string[] }
```
