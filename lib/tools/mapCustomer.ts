export const mapCustomerTool = {
    type: "function",
        function: {
          name: "mapCustomer",
          description: "Erkennt den zugehörigen Kunden anhand der extrahierten Adresse.",
          parameters: {
            type: "object",
            properties: {
              customerId: { type: "number" },
              matchConfidence: { type: "number" }
            },
            required: ["customerId", "matchConfidence"]
          }
        }
} as const