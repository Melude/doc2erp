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