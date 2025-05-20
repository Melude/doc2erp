import { NextRequest, NextResponse } from "next/server"
import { validateCustomer } from "@/lib/validate/validateCustomer"
import type { OrderMetadata } from "@/lib/extract/extractOrderMetaData"

export async function POST(req: NextRequest) {
  try {
    const { metadata } = await req.json()

    if (!metadata?.customerName || !metadata?.customerStreet || !metadata?.customerCity) {
      return NextResponse.json({ error: "Unvollständige Metadaten für Kunden-Mapping" }, { status: 400 })
    }

    const customer = await validateCustomer({
      customerName: metadata.customerName,
      customerStreet: metadata.customerStreet,
      customerCity: metadata.customerCity
    })

    if (!customer) {
      return NextResponse.json({ error: "Kein passender Kunde gefunden" }, { status: 404 })
    }

    return NextResponse.json({ customer })
  } catch (err) {
    console.error("Fehler beim Kunden-Mapping:", err)
    return NextResponse.json({ error: "Mapping fehlgeschlagen" }, { status: 500 })
  }
}
