export async function extractTextFromPdf(file: File): Promise<string> {
  // Dynamisch laden über den Webpack-Entrypoint
  // @ts-expect-error: pdfjs-dist liefert keine Typen für diesen Entry
  const pdfjs = await import("pdfjs-dist/webpack")

  // (Optional) Worker-Skript für später – hier nicht nötig, weil wir nur Text extrahieren:
  // pdfjs.GlobalWorkerOptions.workerSrc = 
  //   new URL("pdfjs-dist/legacy/build/pdf.worker.js", import.meta.url).toString()

  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise

  // Typdefinition für TextItem aus PDF.js
  interface TextItem {
    str: string
    transform: number[]
    // Optional: fontName?: string, width?: number etc.
  }

  let fullText = ""
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const items = content.items as TextItem[]
    const pageText = items
      .map((item) => item.str)
      .join("\n ")
    fullText += pageText + "\n"
  }
  console.log(fullText)
  return fullText
}
