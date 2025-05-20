export const buildPayloadTool = {
  type: "function",
  function: {
    name: "buildErpPayload",
    description: "Erzeugt aus extrahierten Metadaten, Artikel-Mapping und Kundeninfo das finale ERP-Datenobjekt.",
    parameters: {
      type: "object",
      properties: {
        customerName:     { type: "string" },
        customerStreet:   { type: "string" },
        customerCity:     { type: "string" },
        orderNumber:      { type: "string" },
        orderDate:        { type: "string" },
        deliveryDate:     { type: "string" },
        deliveryAddress: {
          type: "object",
          properties: {
            name:   { type: "string" },
            street: { type: "string" },
            city:   { type: "string" }
          },
          required: ["name", "street", "city"]
        },
        positions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              position:     { type: "string" },
              articleId:    { type: "string" },
              quantity:     { type: "number" },
              unitPrice:    { type: "number" },
              description:  { type: "string" }
            },
            required: ["position", "articleId", "quantity", "unitPrice"]
          }
        }
      },
      required: ["customerName", "customerStreet", "customerCity", "orderNumber", "orderDate", "positions", "deliveryAddress"]
    }
  }
} as const
