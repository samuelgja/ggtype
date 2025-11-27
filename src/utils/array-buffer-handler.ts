type Input = File | Blob
const ID_LENGTH = 16 // Length of the id in bytes

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
  // Convert the id to a Uint8Array
  const encoder = new TextEncoder()
  const idBuffer = encoder.encode(id) // Convert the id to a Uint8Array

  /**
   * Reads a File as an ArrayBuffer.
   * @param file - The File to read
   * @returns The file contents as an ArrayBuffer
   * @throws {Error} If file reading fails
   */
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

  // Create a new ArrayBuffer that combines the id and the data
  const combinedBuffer = new ArrayBuffer(
    idBuffer.length + dataBuffer.byteLength,
  )
  const combinedView = new Uint8Array(combinedBuffer)

  // Copy the id into the combined buffer
  combinedView.set(idBuffer, 0)

  // Copy the data into the combined buffer
  combinedView.set(
    new Uint8Array(dataBuffer),
    idBuffer.length,
  )

  return combinedBuffer // Return the combined buffer containing both id and data
}

interface Result {
  id: string // id is required for encoding/decoding
  input: Input // input can be a File, Blob, or ArrayBuffer
}
/**
 * Extracts an ID and data from a combined ArrayBuffer.
 * Separates the first 16 bytes (ID) from the remaining data and returns both.
 * @param buffer - The combined ArrayBuffer containing ID and data
 * @returns An object with the extracted ID and a Blob containing the data
 * @throws {Error} If ID length is invalid
 */
export async function fromArrayBuffer(
  buffer: ArrayBuffer,
): Promise<Result> {
  const decoder = new TextDecoder()
  const idLength = ID_LENGTH // Assuming the id is 16 bytes long
  const idBuffer = buffer.slice(0, idLength) // Extract the id part
  const dataBuffer = buffer.slice(idLength) // Extract the data part

  const id = decoder.decode(idBuffer) // Decode the id
  if (id.length !== ID_LENGTH) {
    throw new Error(
      `Invalid id length. Expected ${ID_LENGTH} characters.`,
    )
  }

  const blob = new Blob([dataBuffer])
  const input = await blob.arrayBuffer() // Create a Blob from the ArrayBuffer
  return { id, input: new Blob([input]) } // Return the id and the Blob
}

/**
 * Type guard to check if a value is an ArrayBuffer or Buffer.
 * @param input - The value to check
 * @returns True if the value is an ArrayBuffer or Buffer
 */
export function isArrayBuffer(
  input: unknown,
): input is ArrayBuffer {
  return (
    input instanceof ArrayBuffer || input instanceof Buffer
  )
}

/**
 * Type guard to check if a value is a File.
 * @param input - The value to check
 * @returns True if the value is a File
 */
export function isFile(input: unknown): input is File {
  return input instanceof File
}
/**
 * Type guard to check if a value is a Blob.
 * @param input - The value to check
 * @returns True if the value is a Blob
 */
export function isBlob(input: unknown): input is Blob {
  return input instanceof Blob
}

/**
 * Type guard to check if a value is a File or Blob (Input type).
 * @param input - The value to check
 * @returns True if the value is a File or Blob
 */
export function isInput(input: unknown): input is Input {
  return isFile(input) || input instanceof Blob
}
