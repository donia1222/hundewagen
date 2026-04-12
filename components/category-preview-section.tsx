"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProductImage } from "./product-image"
import { fetchProductsCached } from "@/lib/product-cache"

interface Product {
  id: number
  name: string
  price: number
  image_url?: string
  image_urls?: (string | null)[]
  image_url_candidates?: string[]
  category?: string
  stock?: number
}

interface Category {
  id: number
  slug: string
  name: string
}

function getImages(p: Product): string[] {
  return (p.image_urls ?? [p.image_url]).filter((u): u is string => !!u)
}

const CATEGORY_CONFIG = [
  {
    keyword:     "Messer",
    label:       "Unsere Messer",
    cat:         "Messer",
    image:       "/images/messer/488659357_1257006842863540_6360458103650416865_n.jpg",
    emoji:       "🔪",
    headline:    ["Schärfer.", "Präziser."],
    accent:      "Besser.",
    description: "Premium Messer für jeden Einsatz — von Outdoor bis Küche, Qualität die überzeugt.",
    accentColor: "#E8C547",
    overlayFrom: "#1A0800",
    stats:       [["50+", "Modelle"], ["Top", "Qualität"], ["Swiss", "Service"]],
    ctaLabel:    "Alle Messer entdecken",
    catParam:    "Messer",
  },
  {
    keyword:     "Armbrust",
    label:       "Unsere Armbrüste",
    cat:         "Armbrust",
    image:       "/images/shop/488657394_1257007002863524_6579276074813205025_n.jpg",
    emoji:       "🏹",
    headline:    ["Präzision auf", "den Punkt."],
    accent:      "Gebracht.",
    description: "Leistungsstarke Armbrüste für Sport und Freizeit — Qualität, der man vertrauen kann.",
    accentColor: "#5BC8E8",
    overlayFrom: "#04111f",
    stats:       [["20+", "Modelle"], ["Top", "Präzision"], ["Gratis", "Beratung"]],
    ctaLabel:    "Alle Armbrüste entdecken",
    catParam:    "Armbrust",
  },
]

export function CategoryPreviewSection() {
  const router = useRouter()
  const [products, setProducts]     = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(true)
  const [failedIds, setFailedIds]   = useState<Set<number>>(new Set())

  const markFailed = (id: number) =>
    setFailedIds(prev => new Set([...prev, id]))

  useEffect(() => {
    let cancelled = false
    const load = async (retries = 2): Promise<void> => {
      try {
        const [prodData, catRes] = await Promise.all([
          fetchProductsCached(),
          fetch("/api/categories"),
        ])
        if (!catRes.ok) throw new Error("not ok")
        const catData = await catRes.json()
        if (cancelled) return
        if (prodData.success && prodData.products) setProducts(prodData.products as unknown as Product[])
        if (catData.success) setCategories(catData.categories)
      } catch {
        if (!cancelled && retries > 0) {
          await new Promise(r => setTimeout(r, 1500))
          return load(retries - 1)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) return (
    <div className="py-12 animate-pulse" style={{ background: "var(--ap-cream)", borderTop: "1px solid #e8eeff" }}>
      <div className="container mx-auto px-4 space-y-6">
        {[0, 1].map(i => (
          <div key={i} className="rounded-3xl overflow-hidden border" style={{ background: "white", borderColor: "#e8eeff" }}>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e8eeff" }}>
                  <div className="aspect-square" style={{ background: "#F3F6FF" }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const sections = CATEGORY_CONFIG.flatMap(({ keyword, label, cat, image, emoji, headline, accent, description, accentColor, overlayFrom, stats, ctaLabel, catParam }) => {
    const apiCat = categories.find(c => c.name.toLowerCase().includes(keyword.toLowerCase()))
    if (!apiCat) return []
    const catProducts = products.filter(p => p.category === apiCat.slug && (p.stock ?? 1) > 0).slice(0, 12)
    if (catProducts.length === 0) return []
    return [{ label, cat, image, emoji, headline, accent, description, accentColor, overlayFrom, stats, ctaLabel, catParam, products: catProducts }]
  })

  if (sections.length === 0) return null

  return (
    <div>
        {sections.map(({ label, cat, emoji, description, ctaLabel, catParam, products: catProducts }) => {
          const visible = catProducts.filter(p => !failedIds.has(p.id)).slice(0, 6)
          if (visible.length === 0) return null
          return (
            <section key={cat} className="py-14" style={{ background: "var(--ap-cream)", borderTop: "1px solid #e8eeff" }}>
              <div className="container mx-auto px-4">

                {/* Header */}
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <span
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                      style={{ background: "var(--ap-pink-pale)", color: "#c0395a" }}
                    >
                      <span className="text-lg leading-none">{emoji}</span> {cat}
                    </span>
                    <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--ap-dark)" }}>{label}</h2>
                    <p className="text-sm mt-1" style={{ color: "var(--ap-muted)" }}>{description}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/shop?cat=${encodeURIComponent(catParam)}`)}
                    className="hidden sm:flex items-center gap-1.5 text-sm font-bold hover:gap-3 transition-all duration-200 whitespace-nowrap"
                    style={{ color: "var(--ap-blue)" }}
                  >
                    Alle ansehen <span className="text-base">→</span>
                  </button>
                </div>

                {/* Product grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {visible.map((product) => {
                    const imgs = getImages(product)
                    return (
                      <div
                        key={product.id}
                        onClick={() => router.push(`/product/${product.id}`)}
                        className="cursor-pointer group"
                      >
                        <div
                          className="relative overflow-hidden aspect-square mb-3 group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 rounded-3xl"
                          style={{ background: "#F3F6FF", border: "1.5px solid #e8eeff" }}
                        >
                          <ProductImage
                            src={imgs[0] || product.image_url}
                            candidates={product.image_url_candidates}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onAllFailed={() => markFailed(product.id)}
                          />
                          <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span
                              className="text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md"
                              style={{ background: "linear-gradient(135deg, var(--ap-blue) 0%, var(--ap-pink) 100%)" }}
                            >
                              Ansehen →
                            </span>
                          </div>
                        </div>
                        <p className="text-xs font-semibold leading-tight line-clamp-2 mb-1.5 transition-colors" style={{ color: "var(--ap-dark)" }}>
                          {product.name}
                        </p>
                        {product.price > 0 && (
                          <span className="text-sm font-black" style={{ color: "var(--ap-dark)" }}>
                            € {product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Mobile CTA */}
                <div className="mt-6 sm:hidden">
                  <button
                    onClick={() => router.push(`/shop?cat=${encodeURIComponent(catParam)}`)}
                    className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all border-2"
                    style={{ borderColor: "var(--ap-blue)", color: "var(--ap-blue)", background: "transparent" }}
                  >
                    Alle ansehen — {label} →
                  </button>
                </div>

              </div>
            </section>
          )
        })}

    </div>
  )
}
