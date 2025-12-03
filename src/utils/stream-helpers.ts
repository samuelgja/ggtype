export function JSONL(message: unknown) {
  return `${JSON.stringify(message)}\n`
}
