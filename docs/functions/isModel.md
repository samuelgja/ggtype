[**ggtype API Documentation v0.4.8**](../README.md)

***

# Function: isModel()

> **isModel**(`value`): `value is ModelNotGeneric`

Defined in: [src/utils/is.ts:53](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/utils/is.ts#L53)

Type guard to check if a value is a model instance.
Checks for the presence of $internals with isModel property.

## Parameters

### value

`unknown`

The value to check

## Returns

`value is ModelNotGeneric`

True if the value is a model instance
