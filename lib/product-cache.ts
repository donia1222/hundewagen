/**
 * Client-side in-memory cache for products and resolved image URLs.
 * Survives across component mounts / page navigations within the same session.
 */

interface Product {
  id: number
  [key: string]: unknown
}

interface CacheEntry {
  data: { success: boolean; products?: Product[]; product?: Product }
  at: number
}

const TTL = 60_000 // 60 s client-side
const cache = new Map<string, CacheEntry>()

/** Fetch products through /api/products with client-side caching */
export async function fetchProductsCached(
  query = "",
  signal?: AbortSignal,
): Promise<{ success: boolean; products?: Product[]; product?: Product }> {
  const key = query
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL) return hit.data

  const url = query ? `/api/products?${query}` : "/api/products"
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`${res.status}`)
  const data = await res.json()
  cache.set(key, { data, at: Date.now() })
  return data
}

// ── Image URL resolution cache ──
// Once we know which candidate URL actually loads for a given base src,
// remember it so we never retry the failing candidates again.

const resolvedImages = new Map<string, string>()

/** Get previously resolved image URL for a source */
export function getResolvedImage(src: string): string | undefined {
  return resolvedImages.get(src)
}

/** Store a resolved image URL */
export function setResolvedImage(src: string, resolvedUrl: string): void {
  resolvedImages.set(src, resolvedUrl)
}
