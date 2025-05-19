import OpenAI from "openai"
import type { ChatCompletionMessageToolCall } from "openai/resources/chat/completions"

export interface OrderMetadata {
  orderNumber?:     string
  customerName?:    string
  deliveryAddress?: string
  orderDate?:       string  // ISO-Format empfohlen
  deliveryDate?:    string  // ISO-Format empfohlen
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
        customerName:    { type: "string", description: "Name des Kunden oder Bestellers" },
        deliveryAddress: { type: "string", description: "Lieferadresse, falls eindeutig im Dokument erkennbar" },
        orderDate:       { type: "string", description: "Datum der Bestellung im Format YYYY-MM-DD, falls erkennbar" },
        deliveryDate:    { type: "string", description: "Geplantes oder tatsächliches Lieferdatum im Format YYYY-MM-DD, falls erkennbar" }
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
                  - Name des Kunden oder Bestellers
                  - Lieferadresse (z.B. bei "Lieferadresse" oder "Local de Entrega" aufgeführt)
                  - Bestelldatum (im Format YYYY-MM-DD)
                  - Lieferdatum (im Format YYYY-MM-DD)

                  Hinweis: Die folgende Adresse ist die Standardanschrift unseres Kunden und darf **nicht** als Kunden- oder Lieferadresse extrahiert werden:

                  Schnitzer GmbH & Co. KG  
                  Marlener Str. 9  
                  77656 Offenburg

                  Falls dieselbe Adresse im Dokument erscheint, ignoriere sie bitte vollständig.

                  Bevorzuge bei der Lieferadresse explizite Angaben wie "Lieferadresse", "Local de Entrega" oder ähnliche Formulierungen. Gib nur Werte zurück, wenn sie eindeutig im Text enthalten sind.`

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
