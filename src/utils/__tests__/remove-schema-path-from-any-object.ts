/**
 * Recursively removes 'schemaPath' properties from an object.
 * Traverses objects and arrays, removing any 'schemaPath' keys found.
 * @template T - The object type
 * @param object - The object to remove schema paths from
 * @returns A new object with all 'schemaPath' properties removed
 */
export function removeSchemaPath<T>(object: T): T {
  if (object == null || typeof object !== 'object') {
    return object
  }

  if (Array.isArray(object)) {
    return object.map((element) =>
      removeSchemaPath(element),
    ) as unknown as T
  }

  const newObject: Partial<T> = {}
  for (const key in object) {
    if (key === 'schemaPath') {
      continue
    }
    newObject[key] = removeSchemaPath(
      (object as never)[key],
    )
  }
  return newObject as T
}
