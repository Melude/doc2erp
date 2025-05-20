import { NextRequest, NextResponse } from "next/server"
import { mapAllLines } from "@/lib/validate/validateArticle"

export async function POST(req: NextRequest) {
  const { lines } = await req.json()
  try {
    const mapped = await mapAllLines(lines)
    return NextResponse.json({ mapped })
  } catch (err) {
    console.error("mapLines error", err)
    return NextResponse.json({ error: "Mapping failed" }, { status: 500 })
  }
}
