export interface Customer {
  customerId: number
  name1: string
  name2: string
  street: string
  city: string
  deliveryAddress: DeliveryAddress | null
}

export interface DeliveryAddress {
  name1: string
  name2: string
  street: string
  city: string
}

export const customers: Customer[] = [
  {
    "customerId": 10001,
    "name1": "Marktkauf EHG Rhein-Ruhr mbH",
    "name2": "Filiale Bielefeld Oldentrup",
    "street": "Oldentruper Str. 236",
    "city": "33719 Bielefeld",
    "deliveryAddress": null
  },
  {
    "customerId": 10002,
    "name1": "Provida",
    "name2": "Produtos Naturais",
    "street": "Rua da Esperança 39",
    "city": "2725-505 Algueirão",
    "deliveryAddress": null
  },
  {
    "customerId": 10003,
    "name1": "GOOD & FOOD SRL",
    "name2": "",
    "street": "Chaussee de la hulpe 150",
    "city": "1170 Watermael-Boitsfort",
    "deliveryAddress": {
      "name1": "Distribution Center Carrefour",
      "name2": "CD KONTICH",
      "street": "Neerveld 1",
      "city": "2550 Kontich"
    }
  },
  {
    "customerId": 10004,
    "name1": "Gourmet Royal International GmbH",
    "name2": "",
    "street": "Eichhaldenweg 5",
    "city": "78333 Stockach",
    "deliveryAddress": {
      "name1": "Gebr. Schoemaker GmbH & Co. KG",
      "name2": "",
      "street": "Bayernstraße 147",
      "city": "28219 Bremen"
    }
  }
]
