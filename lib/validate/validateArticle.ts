import OpenAI from "openai"
import type { ChatCompletionMessageToolCall } from "openai/resources/chat/completions"
import type { OrderLine } from "../types/order"
import { articleData } from "../data/articleData"
import { mapArticleTool } from "../tools/mapArticle"
import type { MappedLine } from "../types/article"

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

                    Vorgehen:
                    1. Falls im Feld "articleRaw" eine ERP-Artikelnummer enthalten ist (z.B. "TCI4544" → 4544), hat diese **oberste Priorität**.
                    2. Danach nutze die Beschreibung zur Plausibilitätsprüfung (z.B. "Chocolate Muffin").
                    3. Stimmen Nummer und Beschreibung **nicht** überein, **gewinnt die Artikelnummer**, außer der Textinhalt spricht eindeutig dagegen (z.B. "Vanille" vs. "Chocolate").
                    4. Wenn eine EAN angegeben ist, ist dies ein **sicherer Match**.
                    5. Wähle nur **einen** Artikel und gib dessen ID und eine Confidence (0–1) zurück.

                    Gib nur ID und Confidence zurück.`

        },
        {
          role: "user",
          content: `Bestellposition:\n${JSON.stringify(line, null, 2)}`
        }
      ],
      tools: [mapArticleTool],
      tool_choice: { type: "function", function: { name: "mapArticle" } }
    })

    const toolCall = res.choices[0].message.tool_calls?.[0] as ChatCompletionMessageToolCall

    if (!toolCall?.function?.arguments) {
      console.warn(`Kein ToolCall oder Argumente für Position ${line.position}`)
      continue
    }

    try {
      const parsed = JSON.parse(toolCall.function.arguments) as Omit<MappedLine, "position" | "articleName">
      const articleMatch = articleData.find(a => a.id.toString() === parsed.articleId)

    mapped.push({
      position: line.position, 
      articleId: parsed.articleId,
      matchConfidence: parsed.matchConfidence,
      articleName: articleMatch?.name ?? "Unbekannter Artikel"
    })

    } catch (err) {
      console.error(`Fehler beim Parsen der Mapping-Antwort für Position ${line.position}`, err)
      console.debug("ToolCall-Rohdaten:", toolCall.function.arguments)
    }
  }

  return mapped
}
