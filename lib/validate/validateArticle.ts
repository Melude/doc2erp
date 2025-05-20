import OpenAI from "openai"
import type { ChatCompletionMessageToolCall } from "openai/resources/chat/completions"
import type { OrderLine } from "@/lib/extract/extractOrderLines"
import { articleData } from "../data/articleData"

export interface MappedLine {
  position:        string
  articleId:       string
  articleName:     string
  matchConfidence: number
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function mapAllLines(lines: OrderLine[]): Promise<MappedLine[]> {
  const mapped: MappedLine[] = []

  const articleList = articleData.map((a) => ({
    id: a.id.toString(),
    name: a.name,
    ean: a.ean
  }))

  for (const [idx, line] of lines.entries()) {
     
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `Du bist ein ERP-Mapping-Experte. Ziel ist es, eine Bestellposition einem Artikel aus dem folgenden ERP-Stammdatenbestand zuzuordnen:

                    Artikelstamm:
                    ${articleList.map(a => `- ${a.id}: ${a.name} (EAN: ${a.ean})`).join("\n")}

                    Berücksichtige Beschreibung, Verpackungseinheit, EAN und Artikelname.
                    Wähle **nur exakt einen passenden Artikel** aus und gib seine ID und eine Confidence (zwischen 0 und 1) zurück.`
        },
        { 
          role: "user", 
          content: `Bestellposition:\n${JSON.stringify(line, null, 2)}` 
        }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "mapArticle",
            description: "Gibt die korrekte ERP-Artikelnummer und Confidence zurück.",
            parameters: {
              type: "object",
              properties: {
                position: { type: "string" },
                articleId: { type: "string" },
                matchConfidence: { type: "number" }
              },
              required: ["position", "articleId", "matchConfidence"]
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "mapArticle" } }
    })

    const toolCall = res.choices[0].message.tool_calls?.[0] as ChatCompletionMessageToolCall

    if (!toolCall || !toolCall.function?.arguments) {
      console.warn(`Kein ToolCall für Position ${line.position}`)
      continue
    }

    try {
      const parsed = JSON.parse(toolCall.function.arguments) as MappedLine
      parsed.position ||= line.position

      const matchedArticle = articleData.find(a => a.id.toString() === parsed.articleId)
      parsed.articleName = matchedArticle?.name ?? "Unbekannter Artikel"

      mapped.push(parsed)
    } catch (err) {
      console.error(`Fehler beim Parsen der Mapping-Antwort für Position ${line.position}`, err)
    }
  }

  return mapped
}
