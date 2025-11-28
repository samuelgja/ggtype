[**ggtype API Documentation v0.4.5**](../README.md)

***

# Class: ErrorWithCode

Defined in: [src/utils/errors.ts:3](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/utils/errors.ts#L3)

## Extends

- `Error`

## Constructors

### Constructor

> **new ErrorWithCode**(`message`, `code`): `ErrorWithCode`

Defined in: [src/utils/errors.ts:5](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/utils/errors.ts#L5)

#### Parameters

##### message

`string`

##### code

`number`

#### Returns

`ErrorWithCode`

#### Overrides

`Error.constructor`

## Methods

### captureStackTrace()

#### Call Signature

> `static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Defined in: node\_modules/bun-types/globals.d.ts:1043

Create .stack property on a target object

##### Parameters

###### targetObject

`object`

###### constructorOpt?

`Function`

##### Returns

`void`

##### Inherited from

`Error.captureStackTrace`

#### Call Signature

> `static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Defined in: node\_modules/@types/node/globals.d.ts:136

Create .stack property on a target object

##### Parameters

###### targetObject

`object`

###### constructorOpt?

`Function`

##### Returns

`void`

##### Inherited from

`Error.captureStackTrace`

***

### isError()

#### Call Signature

> `static` **isError**(`error`): `error is Error`

Defined in: node\_modules/typescript/lib/lib.esnext.error.d.ts:23

Indicates whether the argument provided is a built-in Error instance or not.

##### Parameters

###### error

`unknown`

##### Returns

`error is Error`

##### Inherited from

`Error.isError`

#### Call Signature

> `static` **isError**(`value`): `value is Error`

Defined in: node\_modules/bun-types/globals.d.ts:1038

Check if a value is an instance of Error

##### Parameters

###### value

`unknown`

The value to check

##### Returns

`value is Error`

True if the value is an instance of Error, false otherwise

##### Inherited from

`Error.isError`

## Properties

### cause?

> `optional` **cause**: `unknown`

Defined in: node\_modules/typescript/lib/lib.es2022.error.d.ts:26

The cause of the error.

#### Inherited from

`Error.cause`

***

### code

> `readonly` **code**: `number`

Defined in: [src/utils/errors.ts:4](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/utils/errors.ts#L4)

***

### message

> **message**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1077

#### Inherited from

`Error.message`

***

### name

> **name**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

`Error.name`

***

### stack?

> `optional` **stack**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1078

#### Inherited from

`Error.stack`

***

### prepareStackTrace()?

> `static` `optional` **prepareStackTrace**: (`err`, `stackTraces`) => `any`

Defined in: node\_modules/@types/node/globals.d.ts:143

Optional override for formatting stack traces

#### Parameters

##### err

`Error`

##### stackTraces

`CallSite`[]

#### Returns

`any`

#### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Inherited from

`Error.prepareStackTrace`

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

Defined in: node\_modules/bun-types/globals.d.ts:1048

The maximum number of stack frames to capture.

#### Inherited from

`Error.stackTraceLimit`
