import { NextResponse } from "next/server"
import { readFileSync, writeFileSync } from "fs"
import { join } from "path"

export const dynamic = "force-dynamic"

const DATA_PATH = join(process.cwd(), "data", "affiliate-links.json")

function readLinks(): Record<string, string> {
  try {
    return JSON.parse(readFileSync(DATA_PATH, "utf-8"))
  } catch {
    return {}
  }
}

export async function GET() {
  return NextResponse.json(readLinks())
}

export async function POST(req: Request) {
  try {
    const { productId, url } = await req.json()
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 })

    const links = readLinks()
    if (url && url.trim()) {
      links[String(productId)] = url.trim()
    } else {
      delete links[String(productId)]
    }
    writeFileSync(DATA_PATH, JSON.stringify(links, null, 2))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error saving" }, { status: 500 })
  }
}
