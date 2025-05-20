import { parseFullDocument } from "./extractOrderLines"
import { parseOrderMetadata } from "./extractOrderMetaData"
import type { OrderLine } from "./extractOrderLines"
import type { OrderMetadata } from "./extractOrderMetaData"

export interface ParsedOrderDocument {
  metadata: OrderMetadata
  positions: OrderLine[]
}

export async function parseOrderDocument(text: string): Promise<ParsedOrderDocument> {
  const [metadata, positions] = await Promise.all([
    parseOrderMetadata(text),
    parseFullDocument(text)
  ])

  return { metadata, positions }
}
