import OpenAI from "openai"
import type { ChatCompletionMessageToolCall } from "openai/resources/chat/completions"

export interface OrderLine {
  position:    string
  articleRaw:  string
  description: string
  quantity:    number
  unitPrice:   number
  totalPrice?: number
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const parseTool = {
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
              position:    { type: "string" },
              articleRaw:  { type: "string" },
              description: { type: "string" },
              quantity:    { type: "number" },
              unitPrice:   { type: "number" },
              totalPrice:  { type: "number" }
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

export async function parseFullDocument(text: string): Promise<OrderLine[]> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Extrahiere alle Bestellpositionen aus dem folgenden OCR-Text."
      },
      {
        role: "user",
        content: text
      }
    ],
    tools: [parseTool],
    tool_choice: { type: "function", function: { name: "extractOrderLines" } }
  })

  try {
    const toolCall = res.choices[0].message.tool_calls?.[0] as ChatCompletionMessageToolCall
    if (!toolCall || !toolCall.function?.arguments) {
      console.warn("Keine tool_calls empfangen.")
      return []
    }

    const { positions } = JSON.parse(toolCall.function.arguments)
    return positions as OrderLine[]
  } catch (err) {
    console.error("Fehler beim Parsen der LLM-Antwort:", err)
    return []
  }
}
