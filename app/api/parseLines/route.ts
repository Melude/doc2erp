// app/api/parseLines/route.ts
import { NextRequest, NextResponse } from "next/server"
import { parseFullDocument } from "@/lib/parseWithLLM"

export async function POST(req: NextRequest) {
  const { rawText } = await req.json()

  try {
    const lines = await parseFullDocument(rawText)
    return NextResponse.json({ lines })
  } catch (err) {
    console.error("parseLines error", err)
    return NextResponse.json({ error: "Parsing failed" }, { status: 500 })
  }
}
