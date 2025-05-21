import type { OrderMetadata } from "../types/order"
import type { MappedLine } from "../types/article"
import type { OrderLine } from "../types/order"
import type { ValidatedCustomer } from "../types/customer"
import type { ErpPayload } from "../types/erp"

export function buildErpPayload(
  metadata: OrderMetadata,
  validatedCustomer: ValidatedCustomer,
  lines: OrderLine[],
  mapped: MappedLine[]
): ErpPayload {
  const delivery = validatedCustomer.deliveryAddress ?? {
    name1: validatedCustomer.name1,
    name2: validatedCustomer.name2,
    street: validatedCustomer.street,
    city: validatedCustomer.city
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
      position: String(i + 1),
      articleNumber: m.articleId,
      description: m.articleName,
      quantity: lines[i]?.quantity ?? 0,
      unitPrice: lines[i]?.unitPrice ?? 0
    }))
  }
}
