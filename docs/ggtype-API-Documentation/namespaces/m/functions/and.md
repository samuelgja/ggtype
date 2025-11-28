[**ggtype API Documentation v0.4.7**](../../../../README.md)

***

# Function: and()

> **and**\<`M`\>(...`models`): [`AndModel`](../interfaces/AndModel.md)\<`M`, `false`\>

Defined in: [src/model/and.ts:76](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/and.ts#L76)

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

[`AndModel`](../interfaces/AndModel.md)\<`M`, `false`\>

An AndModel instance representing the intersection of all provided models

## Example

```ts
import { m } from 'ggtype'

// Base user model
const userBase = m.object({
  id: m.string().isRequired(),
  name: m.string().isRequired(),
})

// Role model
const roleModel = m.object({
  role: m.enums('admin', 'user').isRequired(),
  permissions: m.array(m.string()),
})

// Combined user with role
const userWithRole = m.and(userBase, roleModel).isRequired()
// Result: { id: string, name: string, role: 'admin' | 'user', permissions?: string[] }
```
