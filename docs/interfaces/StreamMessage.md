[**ggtype API Documentation v0.6.0**](../README.md)

***

# Interface: StreamMessage

Defined in: [src/router/router.type.ts:471](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L471)

Stream message format for communication between client and server.

## Extends

- [`RouterResultNotGeneric`](RouterResultNotGeneric.md)

## Properties

### action

> `readonly` **action**: `string`

Defined in: [src/router/router.type.ts:475](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L475)

The action name

***

### data?

> `readonly` `optional` **data**: `unknown`

Defined in: [src/types.ts:128](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L128)

Success data (present when status is 'ok')

#### Inherited from

[`RouterResultNotGeneric`](RouterResultNotGeneric.md).[`data`](RouterResultNotGeneric.md#data)

***

### error?

> `readonly` `optional` **error**: [`OutputError`](../type-aliases/OutputError.md)

Defined in: [src/types.ts:132](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L132)

Error information (present when status is 'error')

#### Inherited from

[`RouterResultNotGeneric`](RouterResultNotGeneric.md).[`error`](RouterResultNotGeneric.md#error)

***

### file?

> `readonly` `optional` **file**: `Blob`

Defined in: [src/router/router.type.ts:491](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L491)

Client-side hydrated file/blob

***

### fileSize?

> `readonly` `optional` **fileSize**: `number`

Defined in: [src/router/router.type.ts:487](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L487)

File size in bytes (without the ID prefix)

***

### id

> `readonly` **id**: `string`

Defined in: [src/router/router.type.ts:479](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L479)

Unique message identifier

***

### isLast?

> `readonly` `optional` **isLast**: `boolean`

Defined in: [src/router/router.type.ts:499](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L499)

Whether this is the last message in a stream

***

### status

> `readonly` **status**: [`ResultStatus`](../type-aliases/ResultStatus.md)

Defined in: [src/types.ts:124](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L124)

Result status: 'ok' for success, 'error' for failure

#### Inherited from

[`RouterResultNotGeneric`](RouterResultNotGeneric.md).[`status`](RouterResultNotGeneric.md#status)

***

### type

> `readonly` **type**: [`StreamMessageType`](../enumerations/StreamMessageType.md)

Defined in: [src/router/router.type.ts:495](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L495)

Message type

***

### withFile?

> `readonly` `optional` **withFile**: `boolean`

Defined in: [src/router/router.type.ts:483](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L483)

Whether this message includes a file
