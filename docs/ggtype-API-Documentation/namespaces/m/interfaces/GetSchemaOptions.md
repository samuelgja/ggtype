[**ggtype API Documentation v0.4.7**](../../../../README.md)

***

# Interface: GetSchemaOptions

Defined in: [src/model/model.ts:109](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L109)

## Properties

### justRef?

> `readonly` `optional` **justRef**: `boolean`

Defined in: [src/model/model.ts:113](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L113)

Whether to return just a reference schema (default: false)

***

### usedRefs?

> `readonly` `optional` **usedRefs**: `Set`\<`string`\>

Defined in: [src/model/model.ts:117](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L117)

Set of model IDs that have been referenced (used for tracking dependencies)
