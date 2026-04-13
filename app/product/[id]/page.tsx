"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight, ShoppingCart, Check, X, ZoomIn, Heart, ExternalLink } from "lucide-react"
import { ProductImage } from "@/components/product-image"
import { fetchProductsCached } from "@/lib/product-cache"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

function shortTitle(name: string): string {
  const pipe = name.indexOf(" | ")
  return pipe !== -1 ? name.slice(0, pipe) : name
}

function DescriptionBlock({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const [clamped, setClamped] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el) setClamped(el.scrollHeight > el.clientHeight)
  }, [text])

  return (
    <div className="rounded-2xl p-4" style={{ background: "#F3F6FF", border: "1.5px solid #e8eeff" }}>
      <p className="text-[11px] font-bold text-[#BBBBBB] uppercase tracking-widest mb-2">
        Beschreibung
      </p>
      <p
        ref={ref}
        className={`text-sm text-[#444] leading-relaxed whitespace-pre-line ${!expanded ? "line-clamp-4" : ""}`}
      >
        {text}
      </p>
      {clamped && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-2 text-xs font-semibold text-[#4F7CFF] hover:underline"
        >
          {expanded ? "Weniger anzeigen" : "Mehr anzeigen"}
        </button>
      )}
    </div>
  )
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url?: string
  image_urls?: (string | null)[]
  image_url_candidates?: string[]
  badge?: string
  origin?: string
  supplier?: string
  category?: string
  stock?: number
  weight_kg?: number
}

interface CartItem {
  id: number; name: string; price: number; image: string; image_url?: string
  description: string; heatLevel: number; rating: number
  badge?: string; origin?: string; quantity: number; weight_kg?: number
}

function getImages(p: Product): string[] {
  return (p.image_urls ?? [p.image_url]).filter((u): u is string => !!u)
}

export default function ProductPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const backTo = searchParams.get("back")

  const [product, setProduct] = useState<Product | null>(null)
  const [similar, setSimilar] = useState<Product[]>([])
  const [failedSimilar, setFailedSimilar] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [imgIdx, setImgIdx] = useState(0)
  const [added, setAdded] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isWished, setIsWished] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [zoom, setZoom] = useState({ x: 50, y: 50, active: false })
  const lightboxImgRef = useRef<HTMLDivElement>(null)
  const [affiliateUrl, setAffiliateUrl] = useState<string | null>(null)
  const [paySettings, setPaySettings] = useState<{
    enable_paypal: boolean; enable_stripe: boolean; enable_twint: boolean; enable_invoice: boolean
  } | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/affiliate-links`)
      .then(r => r.json())
      .then(data => setAffiliateUrl(data[id] ?? null))
      .catch(() => {})
  }, [id])

  useEffect(() => {
    fetch(`${API_BASE_URL}/get_payment_settings.php`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.settings) {
          const s = data.settings
          setPaySettings({
            enable_paypal: !!s.enable_paypal,
            enable_stripe: !!s.enable_stripe,
            enable_twint: !!s.enable_twint,
            enable_invoice: s.enable_invoice !== false,
          })
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cantina-cart")
      if (saved) {
        const items: CartItem[] = JSON.parse(saved)
        setCartCount(items.reduce((s, i) => s + i.quantity, 0))
      }
    } catch {}
  }, [added])

  const markSimilarFailed = (id: number) =>
    setFailedSimilar(prev => new Set([...prev, id]))

  // Wishlist sync with shop
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shop-wishlist")
      if (saved && id) setIsWished(JSON.parse(saved).includes(Number(id)))
    } catch {}
  }, [id])

  const toggleWishlist = () => {
    if (!product) return
    try {
      const saved = localStorage.getItem("shop-wishlist")
      const list: number[] = saved ? JSON.parse(saved) : []
      const next = isWished ? list.filter(x => x !== product.id) : [...list, product.id]
      localStorage.setItem("shop-wishlist", JSON.stringify(next))
      setIsWished(!isWished)
    } catch {}
  }

  useEffect(() => {
    setImgIdx(0)
    setProduct(null)
    setSimilar([])
    setFailedSimilar(new Set())
    setLoading(true)
    setError("")

    fetchProductsCached(`id=${id}`)
      .then(data => {
        if (data.success && data.product) {
          setProduct(data.product as unknown as Product)
          fetchProductsCached()
            .then(all => {
              if (!all.success || !all.products) return
              const cat = (data.product as unknown as Product).category
              const hasImage = (p: Product) =>
                getImages(p).length > 0 || !!(p.image_url) || !!(p.image_url_candidates?.length)
              const others = (all.products as unknown as Product[]).filter(
                (p: Product) => p.id !== (data.product as unknown as Product).id && p.category === cat && (p.stock ?? 0) > 0 && hasImage(p)
              )
              setSimilar(others.slice(0, 10))
            })
            .catch(() => {})
        } else {
          setError("Produkt nicht gefunden")
        }
      })
      .catch(() => setError("Verbindungsfehler"))
      .finally(() => setLoading(false))
  }, [id])

  const addToCart = () => {
    if (!product) return
    try {
      const saved = localStorage.getItem("cantina-cart")
      const cart: CartItem[] = saved ? JSON.parse(saved) : []
      const images = getImages(product)
      const exists = cart.find(i => i.id === product.id)
      const next = exists
        ? cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...cart, {
            id: product.id, name: product.name, price: product.price,
            image: images[0] ?? "/placeholder.svg",
            image_url: images[0],
            image_url_candidates: product.image_url_candidates,
            description: product.description,
            heatLevel: 0, rating: 0,
            badge: product.badge, origin: product.origin, quantity: 1,
            weight_kg: product.weight_kg,
          }]
      localStorage.setItem("cantina-cart", JSON.stringify(next))
      localStorage.setItem("cantina-cart-count", next.reduce((s, i) => s + i.quantity, 0).toString())
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {}
  }

  const handleLightboxMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = lightboxImgRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoom({ x, y, active: true })
  }

  const handleLightboxTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    const rect = lightboxImgRef.current?.getBoundingClientRect()
    if (!rect || !touch) return
    const x = ((touch.clientX - rect.left) / rect.width) * 100
    const y = ((touch.clientY - rect.top) / rect.height) * 100
    setZoom({ x, y, active: true })
  }

  const handleLightboxTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    const touch = e.touches[0]
    const rect = lightboxImgRef.current?.getBoundingClientRect()
    if (!rect || !touch) return
    const x = ((touch.clientX - rect.left) / rect.width) * 100
    const y = ((touch.clientY - rect.top) / rect.height) * 100
    setZoom({ x, y, active: true })
  }

  if (loading) return (
    <div className="min-h-screen" style={{ background: "var(--ap-cream)" }}>
      <div className="bg-white h-14 animate-pulse" style={{ borderBottom: "1px solid #e8eeff" }} />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl border border-[#EBEBEB] overflow-hidden animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-gray-100 aspect-square" />
            <div className="p-8 flex flex-col gap-4">
              <div className="h-3 w-24 bg-gray-100 rounded-full" />
              <div className="h-8 w-4/5 bg-gray-200 rounded-full" />
              <div className="h-6 w-32 bg-gray-100 rounded-full" />
              <div className="h-28 bg-gray-100 rounded-2xl" />
              <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
                <div className="h-8 w-32 bg-gray-200 rounded-full" />
                <div className="h-14 bg-gray-100 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (error || !product) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <p className="text-[#666] font-semibold">{error || "Produkt nicht gefunden"}</p>
      <button onClick={() => backTo ? router.push(`/${backTo}`) : router.back()} className="text-sm text-[#4F7CFF] font-bold underline">
        Zurück
      </button>
    </div>
  )

  const images = getImages(product)
  const inStock = (product.stock ?? 0) > 0

  return (
    <div className="min-h-screen" style={{ background: "var(--ap-cream)" }}>

      {/* Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm" style={{ borderBottom: "1px solid #e8eeff" }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => backTo ? router.push(`/${backTo}`) : router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all flex-shrink-0"
            style={{ background: "#EEF3FF", color: "#4F7CFF" }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-[#E5E5E5] flex-shrink-0" />
          <p className="truncate font-bold text-base" style={{ color: "#1A1A2E" }}>{shortTitle(product.name)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 4px 32px rgba(79,124,255,0.08)", border: "1.5px solid #e8eeff" }}>
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* Image side */}
            <div className="p-6 flex flex-col items-center gap-4 border-b md:border-b-0 md:border-r" style={{ background: "#F3F6FF", borderColor: "#e8eeff" }}>
              <div
                className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-white shadow-sm cursor-zoom-in"
                onClick={() => setLightbox(true)}
                title="Klicken zum Vergrößern"
              >
                <ProductImage
                  src={images[imgIdx] || product.image_url}
                  candidates={product.image_url_candidates}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-[#4F7CFF] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {product.badge}
                  </span>
                )}
                {!inStock && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <span className="bg-[#1A1A1A]/80 text-white text-sm font-bold px-4 py-2 rounded-full">
                      Im Moment nicht im Lager
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 flex-wrap justify-center">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        i === imgIdx
                          ? "border-[#4F7CFF] shadow-md scale-105"
                          : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info side */}
            <div className="p-6 md:p-8 flex flex-col gap-4">

              {product.origin && (
                <p className="text-sm font-black uppercase tracking-widest text-[#888]">
                  {product.origin}
                </p>
              )}

              <h1 className="text-2xl md:text-3xl font-black text-[#1A1A1A] leading-tight tracking-tight">
                {shortTitle(product.name)}
              </h1>

              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full w-fit ${
                inStock ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-500"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-red-400"}`} />
                {inStock ? `Auf Lager · ${product.stock} Stück` : "Im Moment nicht im Lager"}
              </div>

              {product.description && (
                <DescriptionBlock text={product.description} />
              )}


              {/* Price + CTA */}
              <div className="mt-auto pt-5 border-t border-[#F0F0F0]">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-black text-[#1A1A1A] tracking-tight">
                    {product.price.toFixed(2)}
                  </span>
                  <span className="text-base text-[#999] font-medium">€</span>
                </div>
                <p className="text-xs text-[#999] mb-4">* Preise exkl. MwSt., zzgl. Versandkosten</p>
                {(
                  <a
                    href={affiliateUrl || `https://www.amazon.es/s?k=${encodeURIComponent(product.name)}&tag=hundezonen-20`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm bg-[#FF9900] hover:bg-[#e88a00] text-white shadow-lg shadow-[#FF9900]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Bei Amazon kaufen
                  </a>
                ) || (
                  <button
                    onClick={addToCart}
                    disabled={!inStock}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all duration-200 ${
                      added
                        ? "bg-emerald-500 text-white"
                        : inStock
                          ? "bg-[#4F7CFF] hover:bg-[#B8501F] text-white shadow-lg shadow-[#D4622A]/20 hover:scale-[1.02] active:scale-[0.98]"
                          : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    {added ? "Hinzugefügt!" : inStock ? "In den Warenkorb" : "Im Moment nicht im Lager"}
                  </button>
                )}
                {!inStock && (
                  <div className="flex justify-center mt-3">
                    <a
                      href={`mailto:info@usfh.ch?subject=Verfügbarkeitsanfrage: ${encodeURIComponent(product.name)}&body=Guten Tag,%0A%0Aich würde gerne wissen, ob der folgende Artikel wieder verfügbar ist:%0A%0AArtikel: ${encodeURIComponent(product.name)}%0AArtikel-Nr.: ${product.id}%0A%0AVielen Dank!`}
                      className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200 transition-colors"
                    >
                      Nach Verfügbarkeit anfragen
                    </a>
                  </div>
                )}
                <button
                  onClick={toggleWishlist}
                  style={{ marginTop: '8px' }}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all duration-200 border ${
                    isWished
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "bg-white border-[#E8E8E8] text-[#333] hover:border-[#999]"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWished ? "fill-current" : ""}`} />
                  {isWished ? "Auf der Wunschliste" : "Zur Wunschliste hinzufügen"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Similar products */}
      {(() => {
        const visible = similar.filter(p => !failedSimilar.has(p.id)).slice(0, 4)
        if (visible.length === 0) return null
        return (
          <div className="max-w-5xl mx-auto px-4 pb-10">
            <div className="border-t border-[#E8E8E8] pt-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #4F7CFF, #FF6B9D)" }} />
                <h2 className="text-base font-black tracking-tight" style={{ color: "#1A1A2E" }}>Ähnliche Produkte</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {visible.map(p => {
                  const imgs = getImages(p)
                  return (
                    <div
                      key={p.id}
                      onClick={() => router.replace(`/product/${p.id}?back=shop`)}
                      className="bg-white rounded-3xl overflow-hidden cursor-pointer group hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                      style={{ border: "1.5px solid #e8eeff" }}
                    >
                      <div className="aspect-square overflow-hidden" style={{ background: "#F3F6FF" }}>
                        <ProductImage
                          src={imgs[0] || p.image_url}
                          candidates={p.image_url_candidates}
                          alt={p.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onAllFailed={() => markSimilarFailed(p.id)}
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-semibold text-[#1A1A1A] line-clamp-2 leading-tight mb-1">
                          {shortTitle(p.name)}
                        </p>
                        <p className="text-sm font-black text-[#4F7CFF]">
                          € {p.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Amazon Affiliate Banner */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div style={{ background: "linear-gradient(135deg, #FFF8F0 0%, #FFF3E0 100%)", borderRadius: "16px", border: "1px solid #FFE0B2" }}>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 px-6 py-5">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: "#FF9900" }}>
              <span className="font-black text-white text-xl italic" style={{ fontFamily: "Georgia, serif" }}>a</span>
            </div>
            <div className="text-center sm:text-left">
              <p className="font-black text-sm mb-1" style={{ color: "#1A1A1A" }}>
                Dieses Produkt kommt direkt von Amazon
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#6B6B6B" }}>
                hundewagen.shop ist ein Amazon-Affiliate-Partner. Beim Kauf werden Sie direkt zu Amazon weitergeleitet — Versand, Lieferung und Rückgabe laufen vollständig über Amazon.
              </p>
            </div>
            <div className="flex-shrink-0 hidden sm:flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl border" style={{ borderColor: "#FFB74D", background: "white" }}>
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#FF9900" }}>Partner</span>
              <span className="font-black text-base leading-none" style={{ color: "#FF9900" }}>Amazon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={() => { setLightbox(false); setZoom({ x: 50, y: 50, active: false }) }}
        >
          <button
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            onClick={() => { setLightbox(false); setZoom({ x: 50, y: 50, active: false }) }}
          >
            <X className="w-6 h-6" />
          </button>
          <div
            ref={lightboxImgRef}
            className="relative overflow-hidden rounded-xl cursor-crosshair select-none bg-[#111]"
            style={{ maxWidth: "90vw", maxHeight: "90vh", width: "auto", height: "auto" }}
            onClick={e => e.stopPropagation()}
            onMouseMove={handleLightboxMouseMove}
            onMouseLeave={() => setZoom(z => ({ ...z, active: false }))}
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={handleLightboxTouchMove}
            onTouchEnd={() => setZoom(z => ({ ...z, active: false }))}
          >
            <div
              className="w-full h-full transition-transform duration-75"
              style={zoom.active ? {
                transform: `scale(2.5)`,
                transformOrigin: `${zoom.x}% ${zoom.y}%`,
              } : { transform: "scale(1)", transformOrigin: "center" }}
            >
              <ProductImage
                src={images[imgIdx] || product.image_url}
                candidates={product.image_url_candidates}
                alt={product.name}
                className="block max-w-[90vw] max-h-[90vh] w-auto h-auto bg-white"
              />
            </div>
          </div>
          {images.length > 1 && (
            <>
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/30 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
                onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + images.length) % images.length); setZoom({ x: 50, y: 50, active: false }) }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/30 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
                onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % images.length); setZoom({ x: 50, y: 50, active: false }) }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setImgIdx(i) }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === imgIdx ? "bg-white scale-125" : "bg-white/40"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment methods */}
      {paySettings && (paySettings.enable_invoice || paySettings.enable_stripe || paySettings.enable_twint || paySettings.enable_paypal) && (
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 pr-4 border-r border-[#E0E0E0]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#4F7CFF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span className="text-[11px] font-semibold text-[#555] tracking-widest uppercase">Sichere Zahlung</span>
          </div>
          {paySettings.enable_invoice && (
            <div className="h-8 px-3 rounded-lg bg-[#F5F5F5] border border-[#E0E0E0] flex items-center gap-1.5 shadow-sm">
              <span className="text-base">🏦</span>
              <span className="text-[11px] font-bold text-[#444]">Rechnung</span>
            </div>
          )}
          {paySettings.enable_twint && (
            <div className="h-8 px-3 rounded-lg bg-black flex items-center shadow-sm">
              <img src="/twint-logo.svg" alt="TWINT" className="h-5 w-auto" />
            </div>
          )}
          {paySettings.enable_stripe && (
            <>
              <div className="h-8 px-4 rounded-lg bg-[#1A1F71] flex items-center shadow-sm">
                <span className="font-black text-white text-base italic tracking-tight">VISA</span>
              </div>
              <div className="h-8 px-3 rounded-lg bg-white border border-[#E0E0E0] flex items-center gap-1 shadow-sm">
                <div className="w-4 h-4 rounded-full bg-[#EB001B]" />
                <div className="w-4 h-4 rounded-full bg-[#F79E1B] -ml-2" />
                <span className="text-[11px] font-bold text-[#333] ml-1.5">Mastercard</span>
              </div>
            </>
          )}
          {paySettings.enable_paypal && (
            <div className="h-8 px-3 rounded-lg bg-white border border-[#E0E0E0] flex items-center shadow-sm">
              <img src="/0014294_paypal-express-payment-plugin.png" alt="PayPal" className="h-6 w-auto object-contain" />
            </div>
          )}
        </div>
      </div>
      )}

    </div>
  )
}
