export const metadataTool = {
  type: "function",
  function: {
    name: "extractOrderMetadata",
    description: "Extrahiert Bestellinformationen aus einem unstrukturierten Dokument wie z.B. Bestellnummer, Kunde, Adressen und relevante Datumsangaben.",
    parameters: {
      type: "object",
      properties: {
        orderNumber:     { type: "string", description: "Bestellnummer oder Referenznummer, falls vorhanden" },
        customerName:    { type: "string", description: "Name der Kundenfirma" },
        customerName2:   { type: "string", description: "Zweiter Namenszusatz, z.B. Abteilung (optional)" },
        customerStreet:  { type: "string", description: "Straße und Hausnummer der Kundenadresse" },
        customerCity:    { type: "string", description: "PLZ und Ort der Kundenadresse, können auch ausländische Formate der PLZ sein" },
        deliveryName:    { type: "string", description: "Name der Lieferadresse (Firma oder Empfänger), falls abweichend" },
        deliveryName2:   { type: "string", description: "Zweiter Namenszusatz der Lieferadresse (optional)" },
        deliveryStreet:  { type: "string", description: "Straße und Hausnummer der Lieferadresse" },
        deliveryCity:    { type: "string", description: "PLZ und Ort der Lieferadresse, können auch ausländische Formate der PLZ sein" },
        orderDate:       { type: "string", description: "Datum der Bestellung im Format YYYY-MM-DD" },
        deliveryDate:    { type: "string", description: "Lieferdatum im Format YYYY-MM-DD" }
      },
      required: [],
      additionalProperties: false
    }
  }
} as const