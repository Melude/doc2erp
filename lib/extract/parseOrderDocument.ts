import { parseFullDocument } from "./extractOrderLines"
import { parseOrderMetadata } from "./extractOrderMetaData"
import type { OrderLine } from "../types/order"
import type { OrderMetadata } from "../types/order"

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
