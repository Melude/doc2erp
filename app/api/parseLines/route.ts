import { NextRequest, NextResponse } from "next/server"
import { parseOrderDocument } from "@/lib/parseOrderDocument"

export async function POST(req: NextRequest) {
  const { rawText } = await req.json()

  try {
    const result = await parseOrderDocument(rawText)
    return NextResponse.json(result) // ← gibt { metadata, positions } zurück
  } catch (err) {
    console.error("parseOrderDocument error", err)
    return NextResponse.json({ error: "Parsing failed" }, { status: 500 })
  }
}
