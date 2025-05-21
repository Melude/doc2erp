import OpenAI from "openai"
import type { ChatCompletionMessageToolCall } from "openai/resources/chat/completions"
import { customers } from "@/lib/data/customerData"
import { mapCustomerTool } from "../tools/mapCustomer"
import type { ExtractedCustomer } from "../types/customer"
import type { ValidatedCustomer } from "../types/customer"
import type { DeliveryAddress } from "../types/customer"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function validateCustomer(input: ExtractedCustomer): Promise<ValidatedCustomer | null> {
  const customerList = customers.map(c => ({
    customerId: c.customerId,
    name: [c.name1, c.name2].filter(Boolean).join(" "),
    street: c.street,
    city: c.city
  }))

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { 
        role: "system", 
        content: `Du erhältst eine aus einem Dokument extrahierte Kundenadresse. 
                    Deine Aufgabe ist es, den am besten passenden Kunden aus folgender Liste zuzuordnen:

                    ${customerList.map(c =>
                    `- ${c.customerId}: ${c.name}, ${c.street}, ${c.city}`
                    ).join("\n")}

                    Wähle den Kunden, dessen Name und Adresse am besten mit der Eingabe übereinstimmen. Gib nur die Kundennummer und einen 
                    Confidence-Wert zwischen 0 und 1 zurück.` 
    },
      { 
        role: "user", 
        content: `Extrahierte Kundendaten:
                    Name: ${input.customerName}
                    Straße: ${input.customerStreet}
                    Ort: ${input.customerCity}` 
    }
    ],
    tools: [mapCustomerTool],
    tool_choice: { type: "function", function: { name: "mapCustomer" } }
  })

  const toolCall = res.choices[0].message.tool_calls?.[0] as ChatCompletionMessageToolCall

  if (!toolCall || !toolCall.function?.arguments) {
    console.warn("Keine ToolCall-Antwort beim Kundenmapping")
    return null
  }

  try {
    const { customerId, matchConfidence } = JSON.parse(toolCall.function.arguments)

    const matched = customers.find(c => c.customerId === customerId)
    if (!matched) return null

    return {
      customerId: matched.customerId,
      name1: matched.name1,
      name2: matched.name2,
      street: matched.street,
      city: matched.city,
      deliveryAddress: matched.deliveryAddress,
      matchConfidence
    }
  } catch (err) {
    console.error("Fehler beim Parsen der Kunden-Mapping-Antwort:", err)
    return null
  }
}
