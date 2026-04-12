import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
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
  // Try multiple patterns for Amazon price extraction
  const patterns = [
    /"priceAmount":"?([0-9]+[.,][0-9]{2})/,
    /class="a-price-whole">([0-9.]+)</,
    /"price":"?([0-9]+[.,][0-9]{2})/,
    /itemprop="price"[^>]+content="([0-9]+[.,][0-9]{2})"/,
    /"buyingPrice":([0-9]+[.,][0-9]{2})/,
    /priceblock_ourprice[^>]*>[\s€]*([0-9]+[.,][0-9]{2})/,
    /apex_desktop[^>]*>[\s€]*([0-9]+[.,][0-9]{2})/,
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
  // Try og:image first
  const og = getMeta(html, "og:image")
  if (og && og.includes("amazon")) return og.replace(/\._[A-Z0-9_,]+_\./, "._SL500_.")

  // Find any Amazon CDN image and upgrade to SL500
  const anyImg = html.match(/"(https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9_%-]+)\._[^"]*\.(jpg|jpeg|png|webp)"/i)
  if (anyImg) return `${anyImg[1]}._SL500_.${anyImg[2]}`

  return ""
}

function extractFirstAsinFromSearch(html: string): string | null {
  // data-asin attribute (most reliable in search pages)
  const m1 = html.match(/data-asin="([A-Z0-9]{10})"/)
  if (m1) return m1[1]
  // /dp/ASIN in href
  const m2 = html.match(/\/dp\/([A-Z0-9]{10})[/"?]/)
  if (m2) return m2[1]
  return null
}

function getAmazonDomain(url: string): string {
  const m = url.match(/https?:\/\/(www\.)?amazon\.([a-z.]+)/)
  return m ? `amazon.${m[2]}` : "amazon.de"
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 })

  try {
    // Step 1: Follow the link
    const res = await fetch(url, { redirect: "follow", headers: HEADERS })
    const html = await res.text()

    // Detect Amazon domain from original URL (amazon.de, amazon.es, amazon.com...)
    const amazonDomain = getAmazonDomain(url) || getAmazonDomain(res.url)

    // Detect if it's a search results page
    const isSearchPage = res.url.includes("/s?") || res.url.includes("/s?k=") || !!res.url.match(/\/s[?&]/)
    let workingHtml = html
    let workingUrl = res.url

    let asinFromUrl = res.url.match(/\/dp\/([A-Z0-9]{10})/)?.[1] || res.url.match(/\/gp\/product\/([A-Z0-9]{10})/)?.[1] || null

    if (!asinFromUrl && isSearchPage) {
      const firstAsin = extractFirstAsinFromSearch(html)
      if (firstAsin) {
        try {
          // Use same domain as original URL
          const prodRes = await fetch(`https://www.${amazonDomain}/dp/${firstAsin}`, { redirect: "follow", headers: HEADERS })
          workingHtml = await prodRes.text()
          workingUrl = prodRes.url
          asinFromUrl = firstAsin
        } catch {}
      }
    }

    // Extract ASIN from final URL
    const asinMatch = workingUrl.match(/\/dp\/([A-Z0-9]{10})/) || workingUrl.match(/\/gp\/product\/([A-Z0-9]{10})/)
    const asin = asinMatch ? asinMatch[1] : asinFromUrl

    // Step 2: Try Amazon.de for EUR price (preferred), fall back to original domain
    let priceEur: number | null = null
    let deHtml = ""
    if (asin) {
      try {
        const deRes = await fetch(`https://www.amazon.de/dp/${asin}`, {
          redirect: "follow",
          headers: { ...HEADERS, "Accept-Language": "de-DE,de;q=0.9" },
        })
        // Only use if amazon.de actually has the product (not redirected to search)
        if (!deRes.url.includes("/s?")) {
          deHtml = await deRes.text()
          priceEur = extractPrice(deHtml)
        }
      } catch {}
    }

    // Step 3: Try price from working page if DE failed
    if (!priceEur) priceEur = extractPrice(workingHtml)

    // Extract image (try DE page first, then working page)
    let image = extractImage(deHtml) || extractImage(workingHtml)
    if (!image && asin) {
      image = `https://m.media-amazon.com/images/I/${asin}._SL500_.jpg`
    }

    // Title & description from working page
    const rawTitle = getMeta(workingHtml, "og:title") || getMetaName(workingHtml, "title") || ""
    const cleanTitle = rawTitle
      .replace(/^Amazon\.[a-z.]+[:\s]+/i, "")
      .replace(/\s*[:|]\s*Amazon\.[a-z.]+$/i, "")
      .replace(/\s*:\s*Productos para Animales\s*$/i, "")
      .replace(/\s*:\s*Tienda para Mascotas\s*$/i, "")
      .replace(/\s*:\s*Amazon\.(es|com|de)\s*$/i, "")
      .trim()

    const rawDesc = getMeta(workingHtml, "og:description") || getMetaName(workingHtml, "description") || ""
    const cleanDesc = rawDesc
      .replace(/^Amazon\.[a-z.]+[:\s]+/i, "")
      .replace(/\s*[:|]\s*Amazon\.[a-z.]+$/i, "")
      .replace(/\s*:\s*Productos para Animales\s*$/i, "")
      .trim()

    return NextResponse.json({
      title: cleanTitle,
      image,
      description: cleanDesc,
      price: priceEur,
      asin,
      finalUrl: res.url,
    })
  } catch {
    return NextResponse.json({ error: "No se pudo obtener información" }, { status: 500 })
  }
}
