import OpenAI from "openai"
import type { ChatCompletionMessageToolCall } from "openai/resources/chat/completions"
import type { OrderLine } from "./parseWithLLM"

export interface MappedLine {
  position:        string
  articleId:       string
  matchConfidence: number
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const mapTool = {
  type: "function",
  function: {
    name: "mapArticle",
    description: "Gibt die korrekte ERP-Artikelnummer und Confidence zurück.",
    parameters: {
      type: "object",
      properties: {
        input: {
          type: "object",
          description: "Der ausgelesene OrderLine-Block",
          properties: {
            position:    { type: "string" },
            articleRaw:  { type: "string" },
            description: { type: "string" },
            quantity:    { type: "number" },
            unitPrice:   { type: "number" },
            totalPrice:  { type: "number" }
          },
          required: ["position", "articleRaw", "description", "quantity", "unitPrice"]
        }
      },
      required: ["input"]
    }
  }
} as const

export async function mapAllLines(lines: OrderLine[]): Promise<MappedLine[]> {
  const out: MappedLine[] = []

  for (const [idx, line] of lines.entries()) {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Mappe eine Bestellposition auf die passende ERP-Artikelnummer."
        },
        {
          role: "user",
          content: JSON.stringify(line)
        }
      ],
      tools: [mapTool],
      tool_choice: { type: "function", function: { name: "mapArticle" } }
    })

    const toolCall = res.choices[0].message.tool_calls?.[0] as ChatCompletionMessageToolCall

    if (!toolCall || !toolCall.function?.arguments) {
      console.warn(`Keine tool_calls für Line #${idx + 1}`)
      continue
    }

    try {
      const parsed = JSON.parse(toolCall.function.arguments) as MappedLine
      parsed.position ||= line.position
      out.push(parsed)
    } catch (err) {
      console.error(`Fehler beim Parsen der Mapping-Antwort für Line #${idx + 1}`, err)
      console.debug("toolCall.function.arguments:", toolCall.function.arguments)
    }
  }

  return out
}
