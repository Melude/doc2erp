import { NextRequest, NextResponse } from "next/server"
import { mapAllLines } from "@/lib/validate/validateArticle"
import type { OrderLine } from "@/lib/extract/extractOrderLines"

export async function POST(req: NextRequest) {
  try {
    const { lines } = await req.json()
    const mapped = await mapAllLines(lines as OrderLine[])
    return NextResponse.json({ mapped })
  } catch (err) {
    console.error("Fehler im Mapping:", err)
    return NextResponse.json({ error: "Mapping fehlgeschlagen" }, { status: 500 })
  }
}
