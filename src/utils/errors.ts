import type { ErrorObject } from 'ajv'

export class ErrorWithCode extends Error {
  public readonly code: number
  constructor(message: string, code: number) {
    super(message)
    this.code = code
  }
}

export class ValidationError extends Error {
  constructor(public errors?: ErrorObject[]) {
    super('Validation error')
  }
}
