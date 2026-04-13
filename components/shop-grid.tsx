"use client"

import { useState, useEffect, useCallback, memo, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
  ShoppingCart, ChevronLeft, ChevronRight,
  Search, X, Check, LayoutGrid, ArrowLeft, ArrowRight,
  ArrowUp, ChevronDown, Heart, Menu, Newspaper, Download, Images, Gift, ExternalLink
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ShoppingCartComponent } from "./shopping-cart"
import { CheckoutPage } from "@/components/checkout-page"
import { LoginAuth } from "./login-auth"
import { ProductImage } from "./product-image"
import { UserProfile } from "./user-profile"
import { Footer } from "./footer"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: number; name: string; description: string; price: number
  image_url?: string; image_urls?: (string | null)[]; image_url_candidates?: string[]
  heat_level: number; rating: number; badge: string
  origin: string; supplier?: string; category?: string; stock?: number; weight_kg?: number
}
interface CartItem {
  id: number; name: string; price: number; image: string; image_url?: string
  image_url_candidates?: string[]
  description: string; heatLevel: number; rating: number; weight_kg?: number
  badge?: string; origin?: string; quantity: number
}
interface Category { id: number; parent_id: number | null; slug: string; name: string }


// ─── Brand palettes (same as home page) ───────────────────────────────────────

const PALETTES = [
  { bg: "#EEF3FF", accent: "#4F7CFF" },
  { bg: "#FFF0F6", accent: "#FF6B9D" },
  { bg: "#F0FFF8", accent: "#22C55E" },
  { bg: "#FFFBEE", accent: "#F59E0B" },
  { bg: "#E8E3FF", accent: "#8B5CF6" },
  { bg: "#FFF5F5", accent: "#EF4444" },
]

// ─── Standalone helpers ────────────────────────────────────────────────────────

function getImages(p: Product): string[] {
  return (p.image_urls ?? [p.image_url]).filter((u): u is string => !!u)
}

// ─── ProductCard (defined OUTSIDE ShopGrid so memo() actually works) ──────────

interface ProductCardProps {
  product: Product
  addedIds: Set<number>
  wishlist: Set<number>
  affiliateUrl?: string
  onSelect: (p: Product) => void
  onAddToCart: (p: Product) => void
  onToggleWishlist: (id: number) => void
}

const ProductCard = memo(function ProductCard({ product, addedIds, wishlist, affiliateUrl, onSelect, onAddToCart, onToggleWishlist }: ProductCardProps) {
  const [idx, setIdx] = useState(0)
  const images  = getImages(product)
  const inStock = (product.stock ?? 0) > 0
  const isAdded = addedIds.has(product.id)
  const isWished = wishlist.has(product.id)

  return (
    <div className="group bg-white rounded-3xl overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300" style={{ border: "1.5px solid #e8eeff" }}>
      {/* Image */}
      <div
        className="relative aspect-square overflow-hidden cursor-pointer"
        style={{ background: "#F3F6FF" }}
        onClick={() => onSelect(product)}
      >
        {images.length > 0 ? (
          <img
            src={images[idx]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            onError={() => {
              if (idx < images.length - 1) setIdx(i => i + 1)
              else {
                const el = document.querySelector(`[data-pid="${product.id}"] img`) as HTMLImageElement
                if (el) el.src = "/placeholder.svg?height=300&width=300"
              }
            }}
          />
        ) : (
          <ProductImage
            src={product.image_url}
            candidates={product.image_url_candidates}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          />
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length) }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#333]" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
            >
              <ChevronRight className="w-3.5 h-3.5 text-[#333]" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <div key={i} className={`rounded-full transition-all ${i === idx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`} />
              ))}
            </div>
          </>
        )}

        {!inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-[#1A1A1A]/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">Im Moment nicht im Lager</span>
          </div>
        )}
        {product.badge && (
          <span className="absolute top-2.5 left-2.5 bg-[#4F7CFF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide shadow-sm">
            {product.badge}
          </span>
        )}

        {/* Stock indicator */}
        <div className={`absolute top-2.5 left-2.5 w-2.5 h-2.5 rounded-full shadow ${inStock ? "bg-emerald-500" : "bg-red-500"}`} />

      </div>

      {/* Details */}
      <div className="p-3.5 flex flex-col flex-1 gap-1.5">
        <p className="text-[10px] font-bold text-[#BBBBBB] uppercase tracking-widest truncate">
          {product.origin || "—"}
        </p>
        <h3
          className="text-sm font-bold text-[#1A1A1A] line-clamp-2 leading-snug cursor-pointer hover:text-[#4F7CFF] transition-colors"
          onClick={() => onSelect(product)}
        >
          {product.name}
        </h3>
        <div className="mt-auto pt-2.5 flex items-center justify-between gap-2 border-t border-[#F5F5F5]">
          <span className="text-base font-black text-[#1A1A1A] tracking-tight">€ {product.price.toFixed(2)}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={e => { e.stopPropagation(); onToggleWishlist(product.id) }}
              className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-200 active:scale-95 ${isWished ? "bg-red-50 border-red-200 text-red-500" : "bg-[#F5F5F5] border-transparent text-[#999] hover:text-red-400 hover:bg-red-50"}`}
              title="Favorit"
            >
              <Heart className={`w-4 h-4 ${isWished ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={() => onAddToCart(product)}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#FF9900] hover:bg-[#e88a00] text-white hover:shadow-md active:scale-95 transition-all duration-200"
              title="Bei Amazon kaufen"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

// ─── MobileCatCard: soft pastel style matching home page ──────────────────────

function MobileCatCard({ srcs, displayName, isActive, onClick, id, palette }: {
  srcs: string[]
  displayName: string
  isActive: boolean
  onClick: () => void
  id?: string
  palette: { bg: string; accent: string }
}) {
  const [imgIdx, setImgIdx] = useState(0)
  const img = srcs[imgIdx] ?? null
  const { bg, accent } = palette

  return (
    <button
      id={id}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl flex-shrink-0 text-left transition-all duration-300 hover:-translate-y-0.5"
      style={{
        width: "104px", height: "112px",
        background: bg,
        border: isActive ? `2px solid ${accent}` : `1.5px solid ${accent}28`,
        boxShadow: isActive ? `0 6px 20px ${accent}35` : "none",
      }}
    >
      {/* Soft image thumbnail — top right corner */}
      {img && (
        <div className="absolute top-0 right-0 w-14 h-14 overflow-hidden rounded-bl-2xl" style={{ opacity: 0.38 }}>
          <img
            src={img}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgIdx(i => i + 1)}
          />
        </div>
      )}

      {isActive && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: accent }}>
          <Check className="w-2.5 h-2.5 text-white" />
        </div>
      )}

      <div className="relative p-2.5 flex flex-col justify-between h-full">
        {/* Icon */}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}20` }}>
          <LayoutGrid className="w-4 h-4" style={{ color: accent }} />
        </div>
        {/* Text */}
        <div>
          <span className="font-black text-[12px] leading-tight block" style={{ color: "var(--ap-dark)" }}>
            {displayName}
          </span>
          <span className="text-[10px] font-bold" style={{ color: accent }}>Ansehen →</span>
        </div>
      </div>
    </button>
  )
}

// ─── CatCard: soft pastel style matching home page ────────────────────────────

function CatCard({ srcs, displayName, isActive, onClick, palette }: {
  srcs: string[]
  displayName: string
  isActive: boolean
  onClick: () => void
  palette: { bg: string; accent: string }
}) {
  const [imgIdx, setImgIdx] = useState(0)
  const img = srcs[imgIdx] ?? null
  const { bg, accent } = palette

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{
        height: "170px", minWidth: "200px", width: "200px", flexShrink: 0,
        background: bg,
        border: isActive ? `2px solid ${accent}` : `1.5px solid ${accent}25`,
        boxShadow: isActive ? `0 8px 28px ${accent}38` : "none",
      }}
    >
      {/* Soft image thumbnail — top-right corner */}
      {img && (
        <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden rounded-bl-3xl" style={{ opacity: 0.35 }}>
          <img
            src={img}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgIdx(i => i + 1)}
          />
        </div>
      )}

      {isActive && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center shadow-md" style={{ background: accent }}>
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div className="relative p-4 flex flex-col justify-between h-full">
        {/* Icon */}
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${accent}18` }}>
          <LayoutGrid className="w-6 h-6" style={{ color: accent }} />
        </div>

        {/* Text */}
        <div>
          {isActive && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: accent }}>
              <Check className="w-3 h-3" /> Aktiv
            </span>
          )}
          <p className="font-black text-sm leading-tight" style={{ color: "var(--ap-dark)" }}>{displayName}</p>
          <div className="flex items-center gap-1 text-[11px] font-semibold mt-0.5" style={{ color: accent }}>
            Ansehen <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </button>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShopGrid() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [products, setProducts]     = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState("")
  const [affiliateLinks, setAffiliateLinks] = useState<Record<string, string>>({})
  const affiliateLinksRef = useRef<Record<string, string>>({})
  const [amazonLinkCats, setAmazonLinkCats] = useState<{ id: string; name: string; amazonUrl: string }[]>([])

  useEffect(() => {
    fetch("/api/affiliate-links").then(r => r.json()).then(data => {
      setAffiliateLinks(data)
      affiliateLinksRef.current = data
    }).catch(() => {})
    try {
      const saved = JSON.parse(localStorage.getItem("amazon-link-cats") || "[]")
      setAmazonLinkCats(saved)
    } catch {}
  }, [])

  const handleCategoryClick = (slug: string) => {
    const amazonCat = amazonLinkCats.find(c =>
      c.name.toLowerCase() === slug.toLowerCase() ||
      c.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
    )
    if (amazonCat) {
      window.open(amazonCat.amazonUrl, "_blank", "noopener,noreferrer")
      return
    }
    setActiveCategory(slug)
  }

  const [search, setSearch]                 = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const mobileCatScrollRef = useRef<HTMLDivElement>(null)
  const desktopCatScrollRef = useRef<HTMLDivElement>(null)
  const [activeSupplier, setActiveSupplier] = useState("all")
  const [stockFilter, setStockFilter]       = useState<"all" | "out_of_stock">("all")
  const [sortBy, setSortBy]                 = useState<"default"|"name_asc"|"name_desc"|"price_asc"|"price_desc">("default")
  const [sidebarOpen, setSidebarOpen]       = useState(false)
  const [showBackTop, setShowBackTop]       = useState(false)
  const [navMenuOpen, setNavMenuOpen]       = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)

  const handleDownloadVCard = () => {
    const imageUrl = "https://online-shop-seven-delta.vercel.app/Security_n.png"
    fetch(imageUrl)
      .then((res) => { if (!res.ok) throw new Error(res.statusText); return res.blob() })
      .then((blob) => {
        const reader = new FileReader()
        reader.onloadend = function () {
          const base64data = (reader.result as string).split(",")[1]
          const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:Hundewagen\nORG:Hundewagen\nTITLE:Hundeprodukte · Outdoor · Schweiz\nADR:;;Bahnhofstrasse 2;Sevelen;;9475;Switzerland\nTEL:+41786066105\nEMAIL:info@hundewagen.shop\nURL:https://hundewagen.shop\nPHOTO;ENCODING=b;TYPE=PNG:${base64data}\nEND:VCARD`
          const link = document.createElement("a")
          link.href = URL.createObjectURL(new Blob([vcard], { type: "text/vcard;charset=utf-8" }))
          link.download = "Hundewagen.vcf"
          document.body.appendChild(link); link.click(); document.body.removeChild(link)
        }
        reader.readAsDataURL(blob)
      })
      .catch(() => {
        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:Hundewagen\nORG:Hundewagen\nTITLE:Hundeprodukte · Outdoor · Schweiz\nADR:;;Bahnhofstrasse 2;Sevelen;;9475;Switzerland\nTEL:+41786066105\nEMAIL:info@hundewagen.shop\nURL:https://hundewagen.shop\nEND:VCARD`
        const link = document.createElement("a")
        link.href = URL.createObjectURL(new Blob([vcard], { type: "text/vcard;charset=utf-8" }))
        link.download = "Hundewagen.vcf"
        document.body.appendChild(link); link.click(); document.body.removeChild(link)
      })
  }

  const PAGE_SIZE = 20
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const hasMoreRef = useRef(false)
  const loadingMoreRef = useRef(false)

  const [cart, setCart]           = useState<CartItem[]>([])
  const [cartOpen, setCartOpen]   = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [addedIds, setAddedIds]   = useState<Set<number>>(new Set())
  const [currentView, setCurrentView] = useState<"products"|"checkout">("products")
  const [wishlist, setWishlist]   = useState<Set<number>>(new Set())
  const [showWishlist, setShowWishlist] = useState(false)

  useEffect(() => { loadProducts(); loadCategories(); loadCart(); loadWishlist() }, [])
  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [search, activeCategory, activeSupplier, stockFilter, sortBy])

  // Apply category filter from URL param once categories are loaded
  useEffect(() => {
    const catParam = searchParams.get("cat")
    if (!catParam || categories.length === 0) return
    // Match against category name (API names like "Messer 2026" contain the display name)
    const matched = categories.find((c) =>
      c.name.toLowerCase().includes(catParam.toLowerCase())
    )
    if (matched) {
      setActiveCategory(matched.slug)
    }
  }, [categories, searchParams])

  // Scroll horizontal automático al card de categoría activa en móvil
  useEffect(() => {
    if (activeCategory === "all") return
    const container = mobileCatScrollRef.current
    const el = document.getElementById(`mobile-cat-${activeCategory}`)
    if (!container || !el) return
    const containerCenter = container.offsetWidth / 2
    const elCenter = el.offsetLeft + el.offsetWidth / 2
    container.scrollTo({ left: elCenter - containerCenter, behavior: "smooth" })
  }, [activeCategory])

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 500)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Infinite scroll: scroll event on window
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMoreRef.current || !hasMoreRef.current) return
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      if (scrolled >= total - 1500) {
        loadingMoreRef.current = true
        setLoadingMore(true)
        setTimeout(() => {
          setVisibleCount(c => c + PAGE_SIZE)
          loadingMoreRef.current = false
          setLoadingMore(false)
        }, 400)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/products`)
      const data = await res.json()
      if (data.success) setProducts(data.products)
      else throw new Error(data.error)
    } catch (e: any) { setError(e.message || "Fehler") }
    finally { setLoading(false) }
  }
  const loadCategories = async () => {
    try {
      const res = await fetch(`/api/categories`)
      const data = await res.json()
      if (data.success) setCategories(data.categories)
    } catch {}
  }
  const loadCart = () => {
    try {
      const saved = localStorage.getItem("cantina-cart")
      if (saved) {
        const data: CartItem[] = JSON.parse(saved)
        setCart(data); setCartCount(data.reduce((s, i) => s + i.quantity, 0))
        setAddedIds(new Set(data.map(i => i.id)))
      }
    } catch {}
  }
  const loadWishlist = () => {
    try {
      const saved = localStorage.getItem("shop-wishlist")
      if (saved) setWishlist(new Set(JSON.parse(saved)))
    } catch {}
  }
  const toggleWishlist = useCallback((id: number) => {
    setWishlist(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem("shop-wishlist", JSON.stringify([...next]))
      return next
    })
  }, [])

  const saveCart = (c: CartItem[]) => {
    localStorage.setItem("cantina-cart", JSON.stringify(c))
    localStorage.setItem("cantina-cart-count", c.reduce((s, i) => s + i.quantity, 0).toString())
  }
  const getAmazonUrl = (product: Product) =>
    affiliateLinksRef.current[String(product.id)] ||
    `https://www.amazon.es/s?k=${encodeURIComponent(product.name)}&tag=hundezonen-20`

  const addToCart = (product: Product) => {
    window.open(getAmazonUrl(product), "_blank", "noopener,noreferrer")
    return
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id)
      const next = exists
        ? prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, {
            id: product.id, name: product.name, price: product.price,
            image: getImages(product)[0] ?? "/placeholder.svg",
            image_url: getImages(product)[0],
            image_url_candidates: product.image_url_candidates,
            description: product.description,
            heatLevel: product.heat_level, rating: product.rating,
            badge: product.badge, origin: product.origin, quantity: 1,
            weight_kg: product.weight_kg,
          }]
      saveCart(next); setCartCount(next.reduce((s, i) => s + i.quantity, 0))
      return next
    })
    setAddedIds(prev => new Set([...prev, product.id]))
    setTimeout(() => setAddedIds(prev => { const s = new Set(prev); s.delete(product.id); return s }), 2000)
  }
  const removeFromCart = (id: number) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id)
      const next = item && item.quantity > 1
        ? prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
        : prev.filter(i => i.id !== id)
      saveCart(next); setCartCount(next.reduce((s, i) => s + i.quantity, 0))
      return next
    })
  }
  const clearCart = () => {
    setCart([]); setCartCount(0)
    localStorage.removeItem("cantina-cart"); localStorage.removeItem("cantina-cart-count")
  }
  const normalizeOrigin = (s: string) => s.toUpperCase().replace(/[`'']/g, "'").replace(/\s*&\s*/g, " & ").replace(/\s+/g, " ").trim()
  const ORIGIN_ALIASES: Record<string, string> = {
    "BLACKFIELD": "BLACK FIELD",
    "BLACKFLASH": "BLACK FLASH",
    "SMITH&WESSON": "SMITH & WESSON",
  }
  const getCanonicalOrigin = (s: string) => {
    const n = normalizeOrigin(s)
    return ORIGIN_ALIASES[n] ?? n
  }

  const suppliers = Array.from(
    new Set(
      products
        .filter(p => activeCategory === "all" || p.category === activeCategory)
        .map(p => p.origin)
        .filter((s): s is string => !!s && s.trim() !== "")
        .map(s => getCanonicalOrigin(s))
    )
  ).sort()

  // Reset supplier when it's not available in the current category
  useEffect(() => {
    if (activeSupplier !== "all" && !suppliers.includes(activeSupplier)) {
      setActiveSupplier("all")
    }
  }, [activeCategory])

  // When a parent category is active → include products from all its subcategories too
  // When a subcategory is active → only that subcategory
  const activeCatObj2 = categories.find(c => c.slug === activeCategory)
  const categoryMatchSlugs: Set<string> = (() => {
    if (activeCategory === "all" || !activeCatObj2) return new Set()
    const isParent = activeCatObj2.parent_id === null
    if (isParent) {
      const subSlugs = categories.filter(c => c.parent_id === activeCatObj2.id).map(c => c.slug)
      return new Set([activeCategory, ...subSlugs])
    }
    return new Set([activeCategory])
  })()

  const filtered = products
    .filter(p => {
      if (showWishlist) return wishlist.has(p.id)
      const matchSearch   = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
      const matchCategory = activeCategory === "all" || categoryMatchSlugs.has(p.category ?? "")
      const matchSupplier = activeSupplier === "all" || (p.origin && getCanonicalOrigin(p.origin) === activeSupplier)
      const matchStock    = stockFilter === "out_of_stock" ? (p.stock ?? 0) > 0 : true
      return matchSearch && matchCategory && matchSupplier && matchStock
    })
    .sort((a, b) => {
      const aInStock = (a.stock ?? 0) > 0 ? 0 : 1
      const bInStock = (b.stock ?? 0) > 0 ? 0 : 1
      if (aInStock !== bInStock) return aInStock - bInStock
      switch (sortBy) {
        case "name_asc":   return a.name.localeCompare(b.name)
        case "name_desc":  return b.name.localeCompare(a.name)
        case "price_asc":  return a.price - b.price
        case "price_desc": return b.price - a.price
        default: return 0
      }
    })

  const visibleProducts = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length
  hasMoreRef.current = hasMore
  // loadingMoreRef stays in sync with loadingMore state

  const handleSelect    = useCallback((p: Product) => router.push(`/product/${p.id}`), [])
  const handleAddToCart = useCallback((p: Product) => addToCart(p), [addedIds, cart]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Views ────────────────────────────────────────────────────────────────
  if (currentView === "checkout") {
    return <CheckoutPage cart={cart} onBackToStore={() => setCurrentView("products")} onClearCart={clearCart} onAddToCart={(p: any) => addToCart(p)} onRemoveFromCart={removeFromCart} />
  }
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--ap-cream)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-3.5 space-y-2">
                  <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                  <div className="h-4 bg-gray-100 rounded-full w-5/6" />
                  <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-8 bg-gray-100 rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-3">{error}</p>
          <button onClick={loadProducts} className="text-sm font-medium text-gray-600 underline">Erneut versuchen</button>
        </div>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {showUserProfile && (
        <UserProfile
          onClose={() => setShowUserProfile(false)}
          onAccountDeleted={() => setShowUserProfile(false)}
        />
      )}

      <ShoppingCartComponent
        isOpen={cartOpen} onOpenChange={setCartOpen} cart={cart}
        onAddToCart={(p: any) => addToCart(p)} onRemoveFromCart={removeFromCart}
        onGoToCheckout={() => { setCartOpen(false); setCurrentView("checkout") }}
        onClearCart={clearCart}
      />


      {/* Back to top */}
      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed right-6 z-50 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl p-3 shadow-xl border border-gray-200 transition-all hover:scale-110 active:scale-95"
          style={{ bottom: typeof window !== 'undefined' && window.innerWidth >= 1024 ? '5.5rem' : '1.5rem' }}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}


<div className="min-h-screen" style={{ background: "var(--ap-cream)" }}>

        {/* ── Top bar ── */}
        <div className="bg-white/90 backdrop-blur-md sticky top-0 z-30" style={{ borderBottom: "1px solid #e8eeff", boxShadow: "0 2px 12px rgba(79,124,255,0.06)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">

            {/* Mobile: Hamburger side menu */}
            <Sheet open={navMenuOpen} onOpenChange={setNavMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-[#4F7CFF] hover:text-white transition-all flex-shrink-0">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-white border-r border-gray-100 w-full sm:w-72 flex flex-col p-0 shadow-2xl h-full">
                <div className="flex items-center justify-between p-4 pr-16 border-b border-[#E0E0E0] flex-shrink-0">
                  <div className="flex flex-col gap-1">
                    <img src="/pawlogo.png" alt="Hundewagen" className="h-14 w-auto object-contain" />
                    <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#4F7CFF" }}>hundewagen.shop · Zubehör & Mehr 🐾</div>
                  </div>
                </div>
                <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                  <button
                    onClick={() => { router.push("/"); setNavMenuOpen(false) }}
                    className="w-full text-left px-3 py-2.5 text-base rounded hover:bg-[#F5F5F5] font-bold text-[#222222]"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => { setActiveCategory("all"); setNavMenuOpen(false) }}
                    className="w-full text-left px-3 py-2.5 text-base rounded hover:bg-[#F5F5F5] font-bold text-[#222222]"
                  >
                    Alle Produkte
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => { handleCategoryClick(cat.slug); setNavMenuOpen(false) }}
                      className="w-full text-left px-3 py-2.5 text-base rounded hover:bg-[#F5F5F5] font-bold text-[#222222]"
                    >
                      {cat.name.replace(/\s*\d{4}$/, "")}
                    </button>
                  ))}
                  <button
                    onClick={() => { router.push("/blog"); setNavMenuOpen(false) }}
                    className="w-full text-left px-3 py-2.5 text-base rounded hover:bg-[#F5F5F5] flex items-center gap-2 font-bold text-[#4F7CFF]"
                  >
                    <Newspaper className="w-4 h-4 shrink-0" />
                    Blog
                  </button>
                  <button
                    onClick={() => { router.push("/gallery"); setNavMenuOpen(false) }}
                    className="w-full text-left px-3 py-2.5 text-base rounded hover:bg-[#F5F5F5] flex items-center gap-2 font-bold text-[#4F7CFF]"
                  >
                    <Images className="w-4 h-4 shrink-0" />
                    Gallery
                  </button>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Home button — desktop only (mobile uses hamburger menu) */}
            <button
              onClick={() => router.push("/")}
              className="hidden lg:flex w-9 h-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-[#4F7CFF] hover:text-white transition-all flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-[#E5E5E5] flex-shrink-0" />

            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <img src="/pawlogo.png" alt="Hundewagen" className="w-12 h-12 rounded-xl object-contain flex-shrink-0" />
              <div className="hidden sm:block">
                <div className="font-black text-lg leading-tight" style={{ color: "#1A1A2E" }}>Hundewagen</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#4F7CFF" }}>hundewagen.shop · Online-Shop</div>
              </div>
              <span className="sm:hidden font-black text-base" style={{ color: "#1A1A2E" }}>Hundewagen</span>
            </div>

            <div className="hidden sm:block w-px h-6 bg-[#E5E5E5] flex-shrink-0" />

            {/* Search — desktop only */}
            <div className="hidden sm:flex flex-1 max-w-lg relative mr-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
              <input
                type="text"
                placeholder="Produkte suchen…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#F3F4F6] rounded-full border border-transparent focus:outline-none focus:bg-white focus:border-[#4F7CFF] focus:ring-2 focus:ring-[#4F7CFF]/15 transition-all placeholder-[#9CA3AF]"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAA] hover:text-[#555]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <span className="text-xs text-[#999] font-semibold hidden lg:block whitespace-nowrap">
              <span className="text-[#1A1A1A] font-black">{filtered.length}</span> Produkte
            </span>

            {/* Right group: wishlist */}
            <div className="ml-auto flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setShowWishlist(p => !p)}
                className={`relative flex flex-col items-center p-2 rounded-xl transition-colors ${showWishlist ? "text-red-500 bg-red-50" : "text-[#555] hover:bg-[#F5F5F5]"}`}
              >
                <Heart className="w-6 h-6" />
                {wishlist.size > 0 && (
                  <span style={{ backgroundColor: "#ef4444" }} className="absolute -top-0.5 -right-0.5 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {wishlist.size > 9 ? "9+" : wishlist.size}
                  </span>
                )}
              </button>
            </div>{/* end right group */}
          </div>
        </div>

        {/* ── Shop hero banner ── */}
        <div style={{ background: "linear-gradient(135deg, #EEF3FF 0%, #FFF0F6 60%, #F7F8FF 100%)", borderBottom: "1px solid #e8eeff" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                style={{ background: "var(--ap-blue-pale)", color: "var(--ap-blue-dark)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--ap-blue)" }} />
                Online-Shop
              </span>
              <h1 className="font-black leading-tight" style={{ fontSize: "clamp(1.5rem, 4vw, 2.4rem)", color: "var(--ap-dark)", letterSpacing: "-0.02em" }}>
                Amazon Hundewagen Selection
              </h1>
              <p className="text-sm md:text-base mt-1.5 max-w-md" style={{ color: "var(--ap-muted)" }}>
                Hundewagen, Zubehör & mehr — handverlesen für aktive Hunde
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { bg: "#EEF3FF", accent: "#4F7CFF", emoji: "🛡️", label: "Sicherer Kauf" },
                { bg: "#FFF0F6", accent: "#FF6B9D", emoji: "🚚", label: "Schnelle Lieferung" },
                { bg: "#F0FFF8", accent: "#22C55E", emoji: "⭐", label: "4.8★ Google" },
              ].map(({ bg, accent, emoji, label }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold" style={{ background: bg, color: accent }}>
                  <span>{emoji}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">

          {/* ── Sidebar ── */}
          <aside className={`${sidebarOpen ? "block" : "hidden"} lg:block w-full lg:w-52 xl:w-60 flex-shrink-0 lg:sticky lg:top-20 lg:self-start`}>
            <div className="rounded-3xl p-4 space-y-5" style={{ background: "white", border: "1.5px solid #e8eeff", boxShadow: "0 4px 20px rgba(79,124,255,0.07)" }}>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-3" style={{ color: "var(--ap-muted)" }}>Verfügbarkeit</p>
                <ul className="space-y-0.5">
                  {([["all", "Alle"], ["out_of_stock", "An Lager"]] as const).map(([val, label]) => {
                    const count = val === "all" ? products.length : products.filter(p => (p.stock ?? 0) > 0).length
                    const isActive = stockFilter === val
                    return (
                      <li key={val}>
                        <button
                          onClick={() => { setShowWishlist(false); setStockFilter(val); setSidebarOpen(false) }}
                          className="w-full text-left flex items-center justify-between text-sm px-3 py-2 rounded-xl transition-all font-medium"
                          style={isActive
                            ? { background: "var(--ap-blue)", color: "white" }
                            : { color: "var(--ap-muted)" }
                          }
                        >
                          <span>{label}</span>
                          <span className="text-[10px] font-bold ml-2 px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={isActive ? { background: "rgba(255,255,255,0.25)", color: "white" } : { background: "#F0F0F0", color: "#888" }}
                          >{count}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className="pt-4" style={{ borderTop: "1px solid #e8eeff" }}>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-3" style={{ color: "var(--ap-muted)" }}>Kategorien</p>
                <ul className="space-y-0.5">
                  {categories
                    .filter(c => c.parent_id === null)
                    .flatMap(parent => [parent, ...categories.filter(c => c.parent_id === parent.id)])
                  .map(cat => {
                    const isSub = cat.parent_id !== null
                    // Parent categories: count own products + all subcategory products
                    const count = isSub
                      ? products.filter(p => p.category === cat.slug).length
                      : products.filter(p => {
                          const subSlugs = categories.filter(c => c.parent_id === cat.id).map(c => c.slug)
                          return p.category === cat.slug || subSlugs.includes(p.category ?? "")
                        }).length
                    const isActive = activeCategory === cat.slug
                    return (
                      <li key={cat.slug} className={isSub ? "pl-3" : ""}>
                        <button
                          onClick={() => { setShowWishlist(false); setActiveCategory(prev => prev === cat.slug ? "all" : cat.slug); setSidebarOpen(false) }}
                          className="w-full text-left flex items-center justify-between text-sm px-3 py-2 rounded-xl transition-all font-medium"
                          style={isActive
                            ? { background: "var(--ap-blue)", color: "white" }
                            : { color: "var(--ap-muted)" }
                          }
                        >
                          <span className="truncate">{isSub ? "↳ " : ""}{cat.name.replace(/\s*\d{4}$/, "")}</span>
                          <span className="text-[10px] font-bold ml-2 px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={isActive ? { background: "rgba(255,255,255,0.25)", color: "white" } : { background: "#F0F0F0", color: "#888" }}
                          >{count}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className="pt-4" style={{ borderTop: "1px solid #e8eeff" }}>
                <button
                  onClick={() => { setShowWishlist(p => !p); setActiveCategory("all"); setStockFilter("all"); setSearch(""); setSidebarOpen(false) }}
                  className="w-full text-left flex items-center justify-between text-sm px-3 py-2 rounded-xl transition-all font-medium"
                  style={showWishlist
                    ? { background: "var(--ap-pink-pale)", color: "#c0395a" }
                    : { color: "var(--ap-muted)" }
                  }
                >
                  <span className="flex items-center gap-2">
                    <Heart className={`w-3.5 h-3.5 ${showWishlist ? "fill-current" : ""}`} />
                    Wunschliste
                  </span>
                  {wishlist.size > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={showWishlist ? { background: "#ffc0d0", color: "#c0395a" } : { background: "#ffe0f0", color: "#FF6B9D" }}
                    >
                      {wishlist.size}
                    </span>
                  )}
                </button>
              </div>


            </div>

          


          </aside>

          {/* ── Main ── */}
          <main className="flex-1 min-w-0">

            {/* ── Category section title ── */}
            {(() => {
              const activeCatObj = categories.find(c => c.slug === activeCategory)
              const activeName = activeCatObj
                ? (activeCatObj.name.replace(/\s*\d{4}$/, "").replace(/^Hundewagen\s*/i, "").trim() || activeCatObj.name.replace(/\s*\d{4}$/, "").trim() || "Hundewagen")
                : null
              const parentObj = activeCatObj?.parent_id ? categories.find(c => c.id === activeCatObj.parent_id) : null
              const parentName = parentObj
                ? (parentObj.name.replace(/\s*\d{4}$/, "").replace(/^Hundewagen\s*/i, "").trim() || "Hundewagen")
                : null
              return (
                <div className="hidden lg:block mb-5">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2"
                    style={{ background: "var(--ap-blue-pale)", color: "var(--ap-blue-dark)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--ap-blue)" }} />
                    {activeName ? `Hundewagen${parentName ? ` · ${parentName}` : ""} · ${activeName}` : "Unser Sortiment"}
                  </span>
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--ap-dark)" }}>
                    {activeName ?? "Hundewagen & Zubehör"}
                  </h1>
                  <p className="text-sm mt-1" style={{ color: "var(--ap-muted)" }}>
                    {activeName
                      ? `${filtered.length} Produkte in dieser Kategorie`
                      : "Alles für deinen Hund — kuratiert & geprüft"}
                  </p>
                </div>
              )
            })()}

            {/* ── Category image banners — desktop only ── */}
            <div className="hidden lg:block mb-6 relative group/cat">
              <button
                onClick={() => desktopCatScrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 border border-[#E0E0E0] shadow-md flex items-center justify-center opacity-0 group-hover/cat:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronLeft className="w-5 h-5 text-[#333]" />
              </button>
              <button
                onClick={() => desktopCatScrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 border border-[#E0E0E0] shadow-md flex items-center justify-center opacity-0 group-hover/cat:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronRight className="w-5 h-5 text-[#333]" />
              </button>
              <div ref={desktopCatScrollRef} className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex gap-3" style={{ flexWrap: "nowrap" }}>
              {/* Alle — default card */}
              <button
                onClick={() => setActiveCategory("all")}
                className="group relative overflow-hidden rounded-3xl text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between p-4"
                style={{
                  height: "170px", minWidth: "200px", width: "200px", flexShrink: 0,
                  background: "#EEF3FF",
                  border: activeCategory === "all" ? "2px solid #4F7CFF" : "1.5px solid #4F7CFF25",
                  boxShadow: activeCategory === "all" ? "0 8px 28px #4F7CFF38" : "none",
                }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "#4F7CFF18" }}>
                  <LayoutGrid className="w-6 h-6" style={{ color: "#4F7CFF" }} />
                </div>
                <div>
                  {activeCategory === "all" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#4F7CFF" }}>
                      <Check className="w-3 h-3" /> Aktiv
                    </span>
                  )}
                  <p className="font-black text-sm leading-tight" style={{ color: "var(--ap-dark)" }}>Alle Kategorien</p>
                  <div className="flex items-center gap-1 text-[11px] font-semibold mt-0.5" style={{ color: "#4F7CFF" }}>
                    Alles anzeigen <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
              {categories.filter(cat => cat.parent_id === null).map((cat, i) => {
                const catProds = products.filter(p =>
                  p.category === cat.slug || p.category === cat.name
                )
                const srcs: string[] = []
                for (const p of catProds) {
                  const fromUrls = (p.image_urls ?? []).filter((u): u is string => !!u)
                  srcs.push(...fromUrls)
                  if (p.image_url) srcs.push(p.image_url)
                  if (p.image_url_candidates?.length) srcs.push(...p.image_url_candidates)
                }
                const uniqueSrcs = [...new Set(srcs)]
                const isActive = activeCategory === cat.slug
                const displayName = cat.name.replace(/\s*\d{4}$/, "").replace(/^Hundewagen\s*/i, "").trim() || cat.name.replace(/\s*\d{4}$/, "").trim() || "Hundewagen"
                return (
                  <CatCard
                    key={cat.slug}
                    srcs={uniqueSrcs}
                    displayName={displayName}
                    isActive={isActive}
                    onClick={() => handleCategoryClick(activeCategory === cat.slug ? "all" : cat.slug)}
                    palette={PALETTES[(i + 1) % PALETTES.length]}
                  />
                )
              })}
              {amazonLinkCats.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => window.open(cat.amazonUrl, "_blank", "noopener,noreferrer")}
                  className="relative overflow-hidden rounded-2xl flex flex-col justify-between p-4 transition-all duration-200 text-left group"
                  style={{ width: "160px", height: "160px", background: "#FFF8F0", border: "2px solid #FF9900", flexShrink: 0 }}
                >
                  <div className="absolute top-2 right-2 bg-[#FF9900] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">Amazon</div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FF9900]/20 mt-1">
                    <span className="text-[#CC7700] font-black text-lg">🛒</span>
                  </div>
                  <div>
                    <p className="font-black text-sm leading-tight text-[#1A1A1A] line-clamp-2">{cat.name}</p>
                    <p className="text-[11px] text-[#CC7700] mt-0.5 font-semibold group-hover:underline">Auf Amazon ansehen ↗</p>
                  </div>
                </button>
              ))}
              </div>
              </div>
            </div>

            {/* ── Category cards — mobile only ── */}
            <div ref={mobileCatScrollRef} className="lg:hidden overflow-x-auto mb-3 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex gap-2.5 pb-1" style={{ flexWrap: "nowrap" }}>

                {/* Alle card — mobile */}
                <button
                  onClick={() => setActiveCategory("all")}
                  className="relative overflow-hidden rounded-2xl flex-shrink-0 flex flex-col justify-between p-2.5 transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    width: "104px", height: "112px",
                    background: "#EEF3FF",
                    border: activeCategory === "all" ? "2px solid #4F7CFF" : "1.5px solid #4F7CFF28",
                    boxShadow: activeCategory === "all" ? "0 6px 20px #4F7CFF35" : "none",
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#4F7CFF20" }}>
                    <LayoutGrid className="w-4 h-4" style={{ color: "#4F7CFF" }} />
                  </div>
                  <div>
                    <p className="font-black text-[12px] leading-tight" style={{ color: "var(--ap-dark)" }}>Alle</p>
                    <p className="text-[10px] font-bold" style={{ color: "#4F7CFF" }}>Ansehen →</p>
                  </div>
                </button>

                {categories.map((cat, i) => {
                  const catProds = products.filter(p => p.category === cat.slug || p.category === cat.name)
                  const srcs: string[] = []
                  for (const p of catProds) {
                    const fromUrls = (p.image_urls ?? []).filter((u): u is string => !!u)
                    srcs.push(...fromUrls)
                    if (p.image_url) srcs.push(p.image_url)
                    if (p.image_url_candidates?.length) srcs.push(...p.image_url_candidates)
                  }
                  const uniqueSrcs = [...new Set(srcs)]
                  const isActive = activeCategory === cat.slug
                  const displayName = cat.name.replace(/\s*\d{4}$/, "").replace(/^Hundewagen\s*/i, "").trim() || cat.name.replace(/\s*\d{4}$/, "").trim() || "Hundewagen"
                  return (
                    <MobileCatCard
                      key={cat.slug}
                      id={`mobile-cat-${cat.slug}`}
                      srcs={uniqueSrcs}
                      displayName={displayName}
                      isActive={isActive}
                      onClick={() => handleCategoryClick(activeCategory === cat.slug ? "all" : cat.slug)}
                      palette={PALETTES[(i + 1) % PALETTES.length]}
                    />
                  )
                })}
                {amazonLinkCats.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => window.open(cat.amazonUrl, "_blank", "noopener,noreferrer")}
                    className="relative overflow-hidden rounded-xl flex-shrink-0 flex flex-col justify-between p-3 text-left group"
                    style={{ width: "110px", height: "120px", background: "#FFF8F0", border: "2px solid #FF9900" }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FF9900]/20">
                      <span className="text-[#CC7700] text-base">🛒</span>
                    </div>
                    <div>
                      <p className="font-black text-[13px] leading-tight text-[#1A1A1A] line-clamp-2">{cat.name}</p>
                      <p className="text-[10px] text-[#CC7700] mt-0.5 font-semibold">Amazon ↗</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Subcategory bar — visible when active category has subcategories ── */}
            {(() => {
              const activeCat = categories.find(c => c.slug === activeCategory)
              // Si la categoría activa es una sub, busca el padre
              const parentCat = activeCat?.parent_id
                ? categories.find(c => c.id === activeCat.parent_id)
                : activeCat
              const subs = parentCat ? categories.filter(c => c.parent_id === parentCat.id) : []
              if (subs.length === 0) return null
              return (
                <div className="border-t mt-6 pt-6" style={{ borderColor: "#e8eeff" }}>
                  <div className="mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-1"
                      style={{ background: "var(--ap-pink-pale)", color: "#c0395a" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B9D]" />
                      Subkategorien
                    </span>
                    <p className="text-sm font-semibold" style={{ color: "var(--ap-muted)" }}>{parentCat?.name.replace(/\s*\d{4}$/, "")}</p>
                  </div>
                  <div className="overflow-x-auto mb-3 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="flex items-center gap-1.5 min-w-max pb-1">
                      {subs.map(sub => {
                        const isSubActive = activeCategory === sub.slug
                        return (
                          <button
                            key={sub.slug}
                            onClick={() => setActiveCategory(prev => prev === sub.slug ? parentCat!.slug : sub.slug)}
                            className="px-3 py-1.5 rounded-full border transition-all whitespace-nowrap text-[11px] font-bold"
                            style={isSubActive
                              ? { background: "var(--ap-blue)", color: "#fff", borderColor: "var(--ap-blue)" }
                              : { background: "var(--ap-blue-pale)", color: "var(--ap-blue)", borderColor: "var(--ap-blue-pale)" }
                            }
                          >
                            {sub.name.replace(/\s*\d{4}$/, "")}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* ── Supplier section ── */}
            {suppliers.length > 0 && (
              <div className="border-t mt-6 pt-6" style={{ borderColor: "#e8eeff" }}>
                <div className="mb-3">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-1"
                    style={{ background: "#F0FFF8", color: "#15803d" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    Marken
                  </span>
                  <p className="text-sm font-semibold" style={{ color: "var(--ap-muted)" }}>Qualitätsmarken aus aller Welt</p>
                </div>
                <div className="overflow-x-auto mb-3 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="flex items-center gap-1.5 min-w-max pb-1">
                    <button
                      onClick={() => setActiveSupplier("all")}
                      className="px-3 py-1.5 rounded-full border transition-all whitespace-nowrap text-[11px] font-bold"
                      style={activeSupplier === "all"
                        ? { background: "var(--ap-dark)", color: "#fff", borderColor: "var(--ap-dark)" }
                        : { background: "white", color: "var(--ap-muted)", borderColor: "#e8eeff" }
                      }
                    >
                      Alle
                    </button>
                    {suppliers.map(supplier => {
                      const isActive = activeSupplier === supplier
                      const COLORS: Record<string, string> = {
                        "AIRSOFT":      "#1A1A1A",
                        "BLACK FLASH":  "#333",
                        "BLACKFLASH":   "#1A1A1A",
                        "BÖKER":        "#8B0000",
                        "FISHERMAN'S":  "#1A5276",
                        "HALLER":       "#D4622A",
                        "JENZI":        "#FF6600",
                        "LINDER":       "#333",
                        "NATURZONE":    "#D4622A",
                        "POHLFORCE":    "#CC0000",
                        "SMOKI":        "#8B6914",
                        "STEAMBOW":     "#1A1A8C",
                        "SYTONG":       "#003087",
                        "WILTEC":       "#555",
                      }
                      const color = COLORS[supplier.toUpperCase()] ?? "#333"
                      return (
                        <button
                          key={supplier}
                          onClick={() => setActiveSupplier(prev => prev === supplier ? "all" : supplier)}
                          className="px-3 py-1.5 rounded-full border transition-all whitespace-nowrap text-[11px] font-bold"
                          style={isActive
                            ? { background: color, color: "#fff", borderColor: color }
                            : { background: "white", color, borderColor: "#e8eeff", opacity: 0.8 }
                          }
                        >
                          {supplier}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Search — mobile only, below brand badges ── */}
            <div className="sm:hidden relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
              <input
                type="text"
                placeholder="Produkte suchen…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#F3F4F6] rounded-full border border-transparent focus:outline-none focus:bg-white focus:border-[#4F7CFF] focus:ring-2 focus:ring-[#4F7CFF]/15 transition-all placeholder-[#9CA3AF]"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAA] hover:text-[#555]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort + count */}
            <div id="products-section" className="flex items-center justify-between mb-4 gap-3">
              <p className="text-sm text-[#888] font-medium">
                <span className="font-black text-[#1A1A1A]">{filtered.length}</span> Produkte
              </p>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="appearance-none text-sm font-semibold text-[#555] bg-white border border-[#E5E5E5] rounded-full pl-4 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4622A]/20 cursor-pointer"
                >
                  <option value="default">Empfehlung</option>
                  <option value="name_asc">Name A–Z</option>
                  <option value="name_desc">Name Z–A</option>
                  <option value="price_asc">Preis ↑</option>
                  <option value="price_desc">Preis ↓</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#AAA] pointer-events-none" />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-24">
                {showWishlist ? (
                  <>
                    <Heart className="w-14 h-14 text-red-200 mx-auto mb-4" />
                    <p className="text-lg font-bold text-gray-300 mb-2">Wunschliste ist leer</p>
                    <p className="text-sm text-gray-400 mb-4">Klicke auf das Herz bei einem Produkt, um es hinzuzufügen.</p>
                    <button onClick={() => setShowWishlist(false)} className="text-sm font-semibold text-[#4F7CFF] hover:underline">Alle Produkte anzeigen</button>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-gray-300 mb-3">Keine Produkte gefunden</p>
                    <button onClick={() => { setSearch(""); setActiveCategory("all"); setActiveSupplier("all"); setStockFilter("all") }} className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                      Filter zurücksetzen
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
<div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {visibleProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      addedIds={addedIds}
                      wishlist={wishlist}
                      affiliateUrl={affiliateLinks[String(product.id)]}
                      onSelect={handleSelect}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={toggleWishlist}
                    />
                  ))}
                </div>

                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="mt-10 flex flex-col items-center gap-3 pb-6">
                  {loadingMore && (
                    <>
                      <div className="w-8 h-8 rounded-full border-[3px] border-[#4F7CFF]/20 border-t-[#D4622A] animate-spin" />
                      <span className="text-xs text-[#999] font-semibold">Mehr laden…</span>
                    </>
                  )}
                  {!hasMore && visibleProducts.length > 0 && (
                    <p className="text-xs text-[#CCC] font-semibold tracking-widest uppercase">— Alle {filtered.length} Produkte geladen —</p>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </>
  )
}
