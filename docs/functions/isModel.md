[**ggtype API Documentation v0.4.5**](../README.md)

***

# Function: isModel()

> **isModel**(`value`): `value is ModelNotGeneric`

Defined in: [src/utils/is.ts:49](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/utils/is.ts#L49)

Type guard to check if a value is a model instance.
Checks for the presence of $internals with isModel property.

## Parameters

### value

`unknown`

The value to check

## Returns

`value is ModelNotGeneric`

True if the value is a model instance
