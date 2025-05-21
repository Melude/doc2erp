export interface ExtractedCustomer {
  customerName: string
  customerStreet: string
  customerCity: string
}

export interface DeliveryAddress {
  name1: string
  name2: string
  street: string
  city: string
}

export interface ValidatedCustomer {
  customerId: number
  name1: string
  name2: string
  street: string
  city: string
  deliveryAddress: DeliveryAddress | null
  matchConfidence: number
}