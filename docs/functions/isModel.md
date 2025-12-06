[**ggtype API Documentation v0.6.0**](../README.md)

***

# Function: isModel()

> **isModel**(`value`): `value is ModelNotGeneric`

Defined in: [src/utils/is.ts:53](https://github.com/samuelgja/ggtype/blob/main/src/utils/is.ts#L53)

Type guard to check if a value is a model instance.
Checks for the presence of $internals with isModel property.

## Parameters

### value

`unknown`

The value to check

## Returns

`value is ModelNotGeneric`

True if the value is a model instance
