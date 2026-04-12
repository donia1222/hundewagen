"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { ProductImage } from "./product-image"
import { fetchProductsCached } from "@/lib/product-cache"

interface Product {
  id: number
  name: string
  price: number
  original_price?: number
  image_url?: string
  image_urls?: (string | null)[]
  image_url_candidates?: string[]
  badge?: string
  category?: string
  stock?: number
}

export function RecommendedProducts() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [failedIds, setFailedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  const markFailed = (id: number) =>
    setFailedIds(prev => new Set([...prev, id]))

  useEffect(() => {
    let cancelled = false
    const load = async (retries = 2): Promise<void> => {
      try {
        const data = await fetchProductsCached()
        if (!data.success || cancelled) return
        const allProducts = data.products as unknown as Product[]
        const hasImage = (p: Product) => !!(p.image_url && /\.(jpg|jpeg|png|webp|gif)$/i.test(p.image_url))
        const inStock = [
          ...allProducts.filter(p => (p.stock ?? 1) > 0 && hasImage(p)),
          ...allProducts.filter(p => (p.stock ?? 1) > 0 && !hasImage(p)),
        ]
        const byCategory: Record<string, Product[]> = {}
        for (const p of inStock) {
          const key = p.category || "other"
          if (!byCategory[key]) byCategory[key] = []
          byCategory[key].push(p)
        }
        const selected: Product[] = []
        for (const catProducts of Object.values(byCategory)) {
          selected.push(...catProducts.slice(0, 3))
          if (selected.length >= 24) break
        }
        if (selected.length < 24) {
          const ids = new Set(selected.map(p => p.id))
          for (const p of inStock) {
            if (!ids.has(p.id)) { selected.push(p); if (selected.length >= 24) break }
          }
        }
        setProducts(selected.slice(0, 24))
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

  const visibleProducts = products.filter(p => !failedIds.has(p.id)).slice(0, 12)

  if (loading) return (
    <section className="py-16" style={{ background: "white", borderTop: "1px solid #e8eeff" }}>
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-2 animate-pulse">
            <div className="h-5 w-28 rounded-full" style={{ background: "#EEF3FF" }} />
            <div className="h-7 w-56 rounded-full" style={{ background: "#E8EEFF" }} />
            <div className="h-4 w-64 rounded-full" style={{ background: "#EEF3FF" }} />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-square rounded-3xl mb-3" style={{ background: "#F3F6FF" }} />
              <div className="h-3 rounded-full w-5/6 mb-1" style={{ background: "#EEF3FF" }} />
              <div className="h-4 rounded-full w-1/2" style={{ background: "#E8EEFF" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  if (visibleProducts.length === 0) return null

  return (
    <section className="py-16" style={{ background: "white", borderTop: "1px solid #e8eeff" }}>
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
              style={{ background: "var(--ap-blue-pale)", color: "var(--ap-blue-dark)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--ap-blue)" }} />
              Empfohlen
            </span>
            <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--ap-dark)" }}>
              Ausgewählte Produkte
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--ap-muted)" }}>
              Kuratierte Auswahl für dich und deinen Begleiter
            </p>
          </div>
          <button
            onClick={() => router.push("/shop")}
            className="hidden sm:flex items-center gap-1.5 text-sm font-bold hover:gap-3 transition-all duration-200"
            style={{ color: "var(--ap-blue)" }}
          >
            Alle ansehen <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {visibleProducts.map((product) => {
            const hasDiscount = product.original_price && product.original_price > product.price
            const discountPct = hasDiscount
              ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
              : null

            return (
              <div
                key={product.id}
                onClick={() => router.push(`/product/${product.id}`)}
                className="cursor-pointer group"
              >
                {/* Image */}
                <div
                  className="relative overflow-hidden aspect-square mb-3 group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 rounded-3xl"
                  style={{ background: "#F3F6FF", border: "1.5px solid #e8eeff" }}
                >
                  <ProductImage
                    src={product.image_url}
                    candidates={product.image_url_candidates}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onAllFailed={() => markFailed(product.id)}
                  />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    {discountPct && (
                      <span
                        className="text-white text-[10px] font-black px-2 py-0.5 rounded-full leading-none shadow-sm"
                        style={{ background: "var(--ap-pink)" }}
                      >
                        -{discountPct}%
                      </span>
                    )}
                    {product.badge && (
                      <span
                        className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-none shadow-sm"
                        style={{ background: "var(--ap-blue)" }}
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span
                      className="text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md"
                      style={{ background: "linear-gradient(135deg, var(--ap-blue) 0%, var(--ap-pink) 100%)" }}
                    >
                      Ansehen →
                    </span>
                  </div>
                </div>

                {/* Name */}
                <p
                  className="text-xs font-semibold leading-tight line-clamp-2 mb-1.5 transition-colors"
                  style={{ color: "var(--ap-dark)" }}
                >
                  {product.name}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-sm font-black" style={{ color: "var(--ap-dark)" }}>
                    € {product.price.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-[11px] line-through" style={{ color: "#CBD5E0" }}>
                      € {product.original_price!.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
