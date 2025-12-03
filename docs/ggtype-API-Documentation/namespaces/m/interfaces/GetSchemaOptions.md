[**ggtype API Documentation v0.5.1**](../../../../README.md)

***

# Interface: GetSchemaOptions

Defined in: [src/model/model.ts:109](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L109)

## Properties

### justRef?

> `readonly` `optional` **justRef**: `boolean`

Defined in: [src/model/model.ts:113](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L113)

Whether to return just a reference schema (default: false)

***

### usedRefs?

> `readonly` `optional` **usedRefs**: `Set`\<`string`\>

Defined in: [src/model/model.ts:117](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L117)

Set of model IDs that have been referenced (used for tracking dependencies)
