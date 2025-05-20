import type { OrderMetadata } from "@/lib/extract/extractOrderMetaData"
import type { MappedLine } from "../validate/validateArticle"
import type { OrderLine } from "@/lib/extract/extractOrderLines"
import type { ValidatedCustomer } from "@/lib/validate/validateCustomer"

interface ErpPosition {
  position: string
  articleNumber: string
  description: string
  quantity: number
  unitPrice: number
}

interface ErpAddress {
  name: string
  street: string
  city: string
}

export interface ErpPayload {
  customerNumber: number
  externalOrderNumber: string
  orderDate: string
  deliveryDate: string
  deliveryAddress: ErpAddress
  positions: ErpPosition[]
}

export function buildErpPayload(
  metadata: OrderMetadata,
  validatedCustomer: ValidatedCustomer,
  lines: OrderLine[],
  mapped: MappedLine[]
): ErpPayload {
  const delivery = validatedCustomer.deliveryAddress ?? {
    name1: metadata.deliveryName || validatedCustomer.name1,
    name2: metadata.deliveryName2 || validatedCustomer.name2,
    street: metadata.deliveryStreet || validatedCustomer.street,
    city: metadata.deliveryCity || validatedCustomer.city
  }

  return {
    customerNumber: validatedCustomer.customerId,
    externalOrderNumber: metadata.orderNumber ?? "",
    orderDate: metadata.orderDate ?? "",
    deliveryDate: metadata.deliveryDate ?? "",
    deliveryAddress: {
      name: [delivery.name1, delivery.name2].filter(Boolean).join(" "),
      street: delivery.street,
      city: delivery.city
    },
    positions: mapped.map((m, i) => ({
      position: m.position,
      articleNumber: m.articleId,
      description: m.articleName,
      quantity: lines[i]?.quantity ?? 0,
      unitPrice: lines[i]?.unitPrice ?? 0
    }))
  }
}
