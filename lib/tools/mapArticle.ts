export const mapArticleTool = {
  type: "function",
  function: {
    name: "mapArticle",
    description: "Gibt die korrekte ERP-Artikelnummer und Confidence zurück.",
    parameters: {
      type: "object",
      properties: {
        articleId: { type: "string" },
        matchConfidence: { type: "number" },
        position: { type: "string" }
      },
      required: ["position", "articleId", "matchConfidence"]
    }
  }
} as const
