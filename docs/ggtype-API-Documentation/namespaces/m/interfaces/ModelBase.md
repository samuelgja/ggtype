[**ggtype API Documentation v0.5.1**](../../../../README.md)

***

# Interface: ModelBase

Defined in: [src/model/model.ts:120](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L120)

## Extended by

- [`ModelNotGeneric`](ModelNotGeneric.md)

## Properties

### $internals

> **$internals**: [`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md)

Defined in: [src/model/model.ts:128](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L128)

Internal model configuration and metadata

***

### description()

> **description**: (`description`) => [`ModelNotGeneric`](ModelNotGeneric.md)

Defined in: [src/model/model.ts:140](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L140)

Sets a human-readable description for the model

#### Parameters

##### description

`string`

The description to set

#### Returns

[`ModelNotGeneric`](ModelNotGeneric.md)

A new model instance with the updated description

***

### getSchema()

> **getSchema**: (`options?`) => `JSONSchema7`

Defined in: [src/model/model.ts:146](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L146)

Gets the JSON Schema representation of the model

#### Parameters

##### options?

[`GetSchemaOptions`](GetSchemaOptions.md)

Optional schema generation options

#### Returns

`JSONSchema7`

The JSON Schema object

***

### getSchemaRef()

> **getSchemaRef**: () => `JSONSchema7`

Defined in: [src/model/model.ts:151](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L151)

Gets the JSON Schema with references (compact form)

#### Returns

`JSONSchema7`

The JSON Schema object with $defs for referenced models

***

### infer

> **infer**: `unknown`

Defined in: [src/model/model.ts:124](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L124)

Inferred TypeScript type for the model

***

### title()

> **title**: (`name`) => [`ModelNotGeneric`](ModelNotGeneric.md)

Defined in: [src/model/model.ts:134](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L134)

Sets a human-readable title for the model

#### Parameters

##### name

`string`

The title to set

#### Returns

[`ModelNotGeneric`](ModelNotGeneric.md)

A new model instance with the updated title
