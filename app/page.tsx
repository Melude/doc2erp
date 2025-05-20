"use client"

import { useState } from "react"
import { extractTextFromPdf } from "@/lib/extract/extractTextFromPdf"
import type { OrderLine } from "@/lib/extract/extractOrderLines"
import type { MappedLine } from "@/lib/validate/validateArticle"
import { buildErpPayload } from "@/lib/tools/buildErpPayload"
import type { ErpPayload } from "@/lib/tools/buildErpPayload"

export default function HomePage() {
  const [file, setFile]       = useState<File|null>(null)
  const [lines, setLines]     = useState<OrderLine[]>([])
  const [metadata, setMetadata] = useState<any>(null)
  const [mapped, setMapped]   = useState<MappedLine[]>([])
  const [loading, setLoading] = useState(false)
  const [erpPayload, setErpPayload] = useState<ErpPayload | null>(null)

  const handleProcess = async () => {
    if (!file) return
    setLoading(true)
    try {
      const rawText = await extractTextFromPdf(file)

      const response = await fetch("/api/parseLines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText })
      })

      const { positions, metadata } = await response.json()

      setLines(positions)
      setMetadata(metadata)
      const mappedLines = await fetch("/api/mapLines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: positions })
      }).then(r => r.json()).then(res => res.mapped)

      const customerRes = await fetch("/api/mapCustomer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata })
      }).then(r => r.json())

      const customerInfo = customerRes.customer

      if (!customerInfo) {
        console.error("Kein passender Kunde gefunden")
        return
      }

      const payload = buildErpPayload(metadata, customerInfo, positions, mappedLines)

      setMapped(mappedLines)
      setErpPayload(payload)

      console.log("Extrahierte OrderLines:", positions)
      console.log("Extrahierte Metadaten:", metadata)
      console.log("Gemappte Artikel:", mappedLines)
      console.log("ERP-Payload:", payload)

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
