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

export async function parseOrderMetadata(text: string): Promise<OrderMetadata> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Extrahiere, falls möglich, die folgenden Metadaten aus dem OCR-Text:

                  - Bestellnummer (z.B. Auftragsnummer, Referenznummer, Encomenda, Numéro de commande)

                  - Kundenadresse:
                    - customerName (z.B. Firmenname)
                    - customerName2 (z.B. Abteilung oder Zusatz, optional)
                    - customerStreet (mit Hausnummer)
                    - customerCity (bestehend aus PLZ und Ort)

                  - Lieferadresse (nur wenn explizit angegeben):
                    - deliveryName
                    - deliveryName2 (optional)
                    - deliveryStreet
                    - deliveryCity

                  - Bestelldatum (im Format YYYY-MM-DD)
                  - Lieferdatum (im Format YYYY-MM-DD)

                  WICHTIG:
                  1. **Nur** dann Lieferadresse ausfüllen, wenn im Dokument klar als solche gekennzeichnet.
                  2. **Blacklist**: Die folgende Adresse darf **unter keinen Umständen** extrahiert werden – selbst bei Schreibvarianten, Teiladressen oder minimalen Tippfehlern. 
                
                  Schnitzer GmbH & Co. KG
                  Marlener Str. 9
                  77656 Offenburg

                  3. Felder zur Lieferadresse **leer lassen**, wenn keine eindeutige Kennzeichnung vorliegt.

                  Wenn im OCR-Text keine oder nur unvollständige Einträge gefunden werden oder die Adresse auf der Blacklist landet, gib einfach ein leeres JSON-Objekt zurück.`
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
