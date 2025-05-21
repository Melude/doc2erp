export const parseTool = {
  type: "function",
  function: {
    name: "extractOrderLines",
    description: "Extrahiert alle Bestellpositionen aus einem unstrukturierten Dokument.",
    parameters: {
      type: "object",
      properties: {
        positions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              position:    { type: "string", description: "Fortlaufende Nummerierung ab 1" },
              articleRaw:  { type: "string", description: "Artikelnummer oder vermutete Artikelkennung, keine EAN" },
              description: { type: "string" },
              quantity:    { type: "number" },
              unitPrice:   { type: "number" },
              totalPrice:  { type: "number" },
              ean1:        { type: "string", nullable: true, description: "Erste EAN, falls vorhanden" },
              ean2:        { type: "string", nullable: true, description: "Zweite EAN, falls vorhanden" }
            },
            required: ["position", "articleRaw", "description", "quantity", "unitPrice"],
            additionalProperties: false
          }
        }
      },
      required: ["positions"],
      additionalProperties: false
    }
  }
} as const