[**ggtype API Documentation v0.4.8**](../../../../README.md)

***

# Interface: GetSchemaOptions

Defined in: [src/model/model.ts:109](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L109)

## Properties

### justRef?

> `readonly` `optional` **justRef**: `boolean`

Defined in: [src/model/model.ts:113](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L113)

Whether to return just a reference schema (default: false)

***

### usedRefs?

> `readonly` `optional` **usedRefs**: `Set`\<`string`\>

Defined in: [src/model/model.ts:117](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L117)

Set of model IDs that have been referenced (used for tracking dependencies)
