"use client"

import { useState } from "react"
import { extractTextFromPdf } from "@/lib/extractTextFromPdf"
import type { OrderLine } from "@/lib/parseWithLLM"
import type { MappedLine } from "@/lib/mapWithLLM"

export default function HomePage() {
  const [file, setFile]       = useState<File|null>(null)
  const [lines, setLines]     = useState<OrderLine[]>([])
  const [mapped, setMapped]   = useState<MappedLine[]>([])
  const [loading, setLoading] = useState(false)

  const handleProcess = async () => {
    if (!file) return
    setLoading(true)
    try {
      const rawText = await extractTextFromPdf(file)

      const { lines: parsed } = await fetch("/api/parseLines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText })
      }).then(r => r.json())

      setLines(parsed)
      console.log("Extrahierte OrderLines:", parsed)

      //const { mapped: mappedRes } = await fetch("/api/mapLines", {
        //method: "POST",
        //headers: { "Content-Type": "application/json" },
        //body: JSON.stringify({ lines: parsed })
      //}).then(r => r.json())

      //setMapped(mappedRes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Bestellung verarbeiten</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mb-4"
      />

      <button
        onClick={handleProcess}
        disabled={!file || loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Verarbeite…" : "Bestellung verarbeiten"}
      </button>

      {mapped.length > 0 && (
        <pre className="mt-6 p-4 bg-gray-100 text-sm whitespace-pre-wrap">
          {JSON.stringify(mapped, null, 2)}
        </pre>
      )}
    </main>
  )
}
