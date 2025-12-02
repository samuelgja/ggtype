export const ID_LENGTH = 16 // Length of the id in bytes

type Input = File | Blob

/**
 * Converts a File or Blob to an ArrayBuffer with an embedded ID.
 * Prepends the ID to the data buffer, creating a combined ArrayBuffer.
 * @param id - The ID to embed (must be exactly 16 characters)
 * @param input - The File or Blob to convert
 * @returns A combined ArrayBuffer containing the ID followed by the data
 * @throws {Error} If ID length is invalid or if file reading fails
 */
export async function toArrayBuffer(
  id: string,
  input: Input,
): Promise<ArrayBuffer> {
  if (!id || id.length !== ID_LENGTH) {
    throw new Error(
      `Invalid id length. Expected ${ID_LENGTH} characters.`,
    )
  }
  const encoder = new TextEncoder()
  const idBuffer = encoder.encode(id)

  async function fromFile(
    file: File,
  ): Promise<ArrayBuffer> {
    try {
      return await file.arrayBuffer()
    } catch {
      throw new Error(`Error reading file: ${file.name}`)
    }
  }

  let dataBuffer: ArrayBuffer

  if (input instanceof File) {
    dataBuffer = await fromFile(input)
  } else if (input instanceof Blob) {
    dataBuffer = await input.arrayBuffer()
  } else {
    throw new TypeError(
      'Input must be a File, Blob, or ArrayBuffer',
    )
  }

  const combinedBuffer = new ArrayBuffer(
    idBuffer.length + dataBuffer.byteLength,
  )
  const combinedView = new Uint8Array(combinedBuffer)

  combinedView.set(idBuffer, 0)
  combinedView.set(
    new Uint8Array(dataBuffer),
    idBuffer.length,
  )

  return combinedBuffer
}

interface Result {
  id: string
  input: Input
}

export async function fromArrayBuffer(
  buffer: ArrayBuffer,
): Promise<Result> {
  const decoder = new TextDecoder()
  const idBuffer = buffer.slice(0, ID_LENGTH)
  const dataBuffer = buffer.slice(ID_LENGTH)

  const id = decoder.decode(idBuffer)
  if (id.length !== ID_LENGTH) {
    throw new Error(
      `Invalid id length. Expected ${ID_LENGTH} characters.`,
    )
  }

  const blob = new Blob([dataBuffer])
  const input = await blob.arrayBuffer()
  return { id, input: new Blob([input]) }
}

export function isArrayBuffer(
  input: unknown,
): input is ArrayBuffer {
  return (
    input instanceof ArrayBuffer || input instanceof Buffer
  )
}

export function isFile(input: unknown): input is File {
  return input instanceof File
}

export function isBlob(input: unknown): input is Blob {
  return input instanceof Blob
}

export function isInput(input: unknown): input is Input {
  return isFile(input) || input instanceof Blob
}
