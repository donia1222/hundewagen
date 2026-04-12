export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}

const API_BASE_URL = process.env.API_BASE_URL || "https://web.lweb.ch/shop"
const AFFILIATE_TAG = "hundezonen-20"

function extractAsins(html: string): string[] {
  const asins = new Set<string>()
  // data-asin attribute
  const re1 = /data-asin="([A-Z0-9]{10})"/g
  let m
  while ((m = re1.exec(html)) !== null) asins.add(m[1])
  // /dp/ASIN pattern
  const re2 = /\/dp\/([A-Z0-9]{10})[/"?]/g
  while ((m = re2.exec(html)) !== null) asins.add(m[1])
  return [...asins].slice(0, 20) // max 20 products
}

function getMeta(html: string, prop: string): string {
  const m =
    html.match(new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i")) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, "i"))
  return m ? m[1].trim() : ""
}

function getMetaName(html: string, name: string): string {
  const m =
    html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i")) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"))
  return m ? m[1].trim() : ""
}

function extractPrice(html: string): number | null {
  const patterns = [
    /"priceAmount":"?([0-9]+[.,][0-9]{2})/,
    /class="a-price-whole">([0-9.]+)</,
    /"price":"?([0-9]+[.,][0-9]{2})/,
    /itemprop="price"[^>]+content="([0-9]+[.,][0-9]{2})"/,
    /priceblock_ourprice[^>]*>[\s€]*([0-9]+[.,][0-9]{2})/,
    /class="[^"]*a-color-price[^"]*"[^>]*>[\s€]*([0-9]+[.,][0-9]{2})/,
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m) {
      const val = parseFloat(m[1].replace(",", "."))
      if (!isNaN(val) && val > 0 && val < 10000) return val
    }
  }
  return null
}

function extractImage(html: string): string {
  const og = getMeta(html, "og:image")
  if (og && og.includes("amazon")) return og.replace(/\._[A-Z0-9_,]+_\./, "._SL500_.")
  const anyImg = html.match(/"(https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9_%-]+)\._[^"]*\.(jpg|jpeg|png|webp)"/i)
  if (anyImg) return `${anyImg[1]}._SL500_.${anyImg[2]}`
  return ""
}

async function fetchProductByAsin(asin: string): Promise<{ title: string; description: string; price: number | null; image: string; asin: string } | null> {
  try {
    const res = await fetch(`https://www.amazon.de/dp/${asin}`, {
      redirect: "follow",
      headers: HEADERS,
    })
    if (!res.ok) return null
    const html = await res.text()

    const rawTitle = getMeta(html, "og:title") || getMetaName(html, "title") || ""
    const title = rawTitle
      .replace(/^Amazon\.[a-z.]+[:\s]+/i, "")
      .replace(/\s*[:|]\s*Amazon\.[a-z.]+$/i, "")
      .trim()

    if (!title) return null

    const rawDesc = getMeta(html, "og:description") || getMetaName(html, "description") || ""
    const description = rawDesc.replace(/^Amazon\.[a-z.]+[:\s]+/i, "").trim()
    const price = extractPrice(html)
    const image = extractImage(html) || `https://m.media-amazon.com/images/I/${asin}._SL500_.jpg`

    return { title, description, price, image, asin }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchUrl, categoryId, categoryName } = await req.json()
    if (!searchUrl) return NextResponse.json({ error: "searchUrl required" }, { status: 400 })

    // 1. Fetch search page
    const searchRes = await fetch(searchUrl, { redirect: "follow", headers: HEADERS })
    const searchHtml = await searchRes.text()

    // 2. Extract ASINs
    const asins = extractAsins(searchHtml)
    if (asins.length === 0) {
      return NextResponse.json({ error: "Keine Produkte gefunden. Amazon blockiert möglicherweise den Zugriff.", found: 0 }, { status: 200 })
    }

    // 3. Fetch each product (max 10 parallel)
    const productResults = await Promise.all(
      asins.slice(0, 15).map(asin => fetchProductByAsin(asin))
    )
    const products = productResults.filter(Boolean) as { title: string; description: string; price: number | null; image: string; asin: string }[]

    if (products.length === 0) {
      return NextResponse.json({ error: "Produkte gefunden aber Details konnten nicht geladen werden.", found: asins.length }, { status: 200 })
    }

    // 4. Save each product to PHP backend
    const saved: string[] = []
    const failed: string[] = []

    for (const p of products) {
      try {
        const affiliateUrl = `https://www.amazon.de/dp/${p.asin}?tag=${AFFILIATE_TAG}`
        const formData = new FormData()
        formData.append("name", p.title)
        formData.append("description", p.description || p.title)
        formData.append("price", String(p.price ?? 0))
        formData.append("image_url", p.image)
        formData.append("category_id", String(categoryId || ""))
        formData.append("category_name", categoryName || "")
        formData.append("stock", "99")
        formData.append("badge", "Amazon")
        formData.append("affiliate_url", affiliateUrl)

        const saveRes = await fetch(`${API_BASE_URL}/add_product.php`, {
          method: "POST",
          body: formData,
        })
        const saveData = await saveRes.json()
        if (saveData.success) {
          // Save affiliate link
          saved.push(p.asin)
          // Store affiliate URL mapping
          if (saveData.product_id) {
            await fetch(`${req.nextUrl.origin}/api/affiliate-links`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: saveData.product_id, affiliateUrl }),
            }).catch(() => {})
          }
        } else {
          failed.push(p.title)
        }
      } catch {
        failed.push(p.title)
      }
    }

    return NextResponse.json({
      success: true,
      saved: saved.length,
      failed: failed.length,
      total: products.length,
      asinsFound: asins.length,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
