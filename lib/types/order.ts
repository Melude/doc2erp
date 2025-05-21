export interface OrderLine {
  position:    string
  articleRaw:  string
  description: string
  quantity:    number
  unitPrice:   number
  totalPrice?: number
  ean1?:       string | null
  ean2?:       string | null
}

export interface OrderMetadata {
  orderNumber?:     string
  customerName?:    string
  customerName2?:   string
  customerStreet?:  string
  customerCity?:    string
  deliveryName?:    string
  deliveryName2?:   string
  deliveryStreet?:  string
  deliveryCity?:    string
  orderDate?:       string
  deliveryDate?:    string
}