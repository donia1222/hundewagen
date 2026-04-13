import { MetadataRoute } from "next"

const BASE_URL = "https://www.hundewagen.shop"
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/gallery`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ]

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${API_BASE}/get_products.php`, { next: { revalidate: 3600 } })
    const data = await res.json()
    if (data.success && Array.isArray(data.products)) {
      productPages = data.products.map((p: { id: number; updated_at?: string }) => ({
        url: `${BASE_URL}/product/${p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }))
    }
  } catch {}

  return [...staticPages, ...productPages]
}
