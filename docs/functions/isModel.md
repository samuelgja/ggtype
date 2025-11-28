[**ggtype API Documentation v0.4.5**](../README.md)

***

# Function: isModel()

> **isModel**(`value`): `value is ModelNotGeneric`

Defined in: [src/utils/is.ts:53](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/utils/is.ts#L53)

Type guard to check if a value is a model instance.
Checks for the presence of $internals with isModel property.

## Parameters

### value

`unknown`

The value to check

## Returns

`value is ModelNotGeneric`

True if the value is a model instance
