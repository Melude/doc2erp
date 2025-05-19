import OpenAI from "openai"
import type { ChatCompletionMessageToolCall } from "openai/resources/chat/completions"

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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const metadataTool = {
  type: "function",
  function: {
    name: "extractOrderMetadata",
    description: "Extrahiert Bestellinformationen aus einem unstrukturierten Dokument wie z. B. Bestellnummer, Kunde, Adressen und relevante Datumsangaben.",
    parameters: {
      type: "object",
      properties: {
        orderNumber:     { type: "string", description: "Bestellnummer oder Referenznummer, falls vorhanden" },
        customerName:    { type: "string", description: "Name der Kundenfirma" },
        customerName2:   { type: "string", description: "Zweiter Namenszusatz, z. B. Abteilung (optional)" },
        customerStreet:  { type: "string", description: "Straße und Hausnummer der Kundenadresse" },
        customerCity:    { type: "string", description: "PLZ und Ort der Kundenadresse" },
        deliveryName:    { type: "string", description: "Name der Lieferadresse (Firma oder Empfänger), falls abweichend" },
        deliveryName2:   { type: "string", description: "Zweiter Namenszusatz der Lieferadresse (optional)" },
        deliveryStreet:  { type: "string", description: "Straße und Hausnummer der Lieferadresse" },
        deliveryCity:    { type: "string", description: "PLZ und Ort der Lieferadresse" },
        orderDate:       { type: "string", description: "Datum der Bestellung im Format YYYY-MM-DD" },
        deliveryDate:    { type: "string", description: "Lieferdatum im Format YYYY-MM-DD" }
      },
      required: [],
      additionalProperties: false
    }
  }
} as const

export async function parseOrderMetadata(text: string): Promise<OrderMetadata> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Extrahiere, falls möglich, die folgenden Metadaten aus dem OCR-Text:

- Bestellnummer (z.B. Auftragsnummer, Referenznummer)

- Kundenadresse:
  - customerName (z.B. Firmenname)
  - customerName2 (z.B. Abteilung oder Zusatz, optional)
  - customerStreet (mit Hausnummer)
  - customerCity (bestehend aus PLZ und Ort)

- Lieferadresse (falls explizit angegeben):
  - deliveryName
  - deliveryName2 (optional)
  - deliveryStreet
  - deliveryCity

- Bestelldatum (im Format YYYY-MM-DD)
- Lieferdatum (im Format YYYY-MM-DD)

Wichtig:
Eine Lieferadresse soll **nur dann ausgefüllt werden**, wenn im Dokument klar erkennbar ist, dass es sich um eine Lieferadresse handelt (z.B. durch Begriffe wie "Lieferadresse", "Local de Entrega", "Lieferung an", "Versand an", o.ä.).

Falls keine eindeutige Kennzeichnung vorhanden ist, lasse die Felder zur Lieferadresse bitte vollständig leer – auch wenn eine Adresse unterhalb des Kunden steht.

Die folgende Kundenadresse darf **niemals** als Kunden- oder Lieferadresse extrahiert werden – selbst wenn sie im Dokument erscheint:

- customerName: Schnitzer GmbH & Co. KG
- customerStreet: Marlener Str. 9
- customerCity: 77656 Offenburg

Dies gilt auch bei Schreibvariationen wie „Schnitzer Gmbh“, „Marlener Straße“, „77656 Offnburg“ usw. Bitte ignoriere die komplette Adresse, wenn sie nur ähnlich aussieht oder unvollständig ist.`

      },
      {
        role: "user",
        content: text
      }
    ],
    tools: [metadataTool],
    tool_choice: { type: "function", function: { name: "extractOrderMetadata" } }
  })

  try {
    const toolCall = res.choices[0].message.tool_calls?.[0] as ChatCompletionMessageToolCall
    if (!toolCall || !toolCall.function?.arguments) {
      console.warn("Keine tool_calls empfangen.")
      return {}
    }

    const metadata = JSON.parse(toolCall.function.arguments)
    return metadata as OrderMetadata
  } catch (err) {
    console.error("Fehler beim Parsen der LLM-Antwort (Metadaten):", err)
    return {}
  }
}
