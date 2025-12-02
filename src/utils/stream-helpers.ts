import type { StreamMessage } from '../routerv2/router.type'

export function JSONL(message: StreamMessage) {
  return `${JSON.stringify(message)}\n`
}
