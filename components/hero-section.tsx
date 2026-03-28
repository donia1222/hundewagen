"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Flashlight, Sword, Target, Wrench, Axe, Shield } from "lucide-react"

interface Product {
  id: number
  image_url?: string
  image_urls?: (string | null)[]
  image_url_candidates?: string[]
  category?: string
  origin?: string
}

interface Category {
  id: number
  slug: string
  name: string
}

function getCategoryImage(catProds: Product[]): string[] {
  const urls: string[] = []
  for (const p of catProds) {
    // uploaded images (most reliable — have full URL with extension)
    const fromUrls = (p.image_urls ?? []).filter((u): u is string => !!u)
    urls.push(...fromUrls)
    // direct image_url
    if (p.image_url) urls.push(p.image_url)
    // candidates with extensions appended
    if (p.image_url_candidates?.length) urls.push(...p.image_url_candidates)
  }
  // deduplicate
  return [...new Set(urls)]
}

function CatImageCard({
  srcs,
  alt,
  className,
}: {
  srcs: string[]
  alt: string
  className?: string
}) {
  const [idx, setIdx] = useState(0)
  if (!srcs.length || idx >= srcs.length) return null
  return (
    <img
      src={srcs[idx]}
      alt={alt}
      className={className}
      onError={() => setIdx(i => i + 1)}
    />
  )
}

const HERO_IMAGES = [
  "/images/shop/header.jpeg",
  "/images/shop/46503497_763729157311247_9165108232799125504_ncopia.jpg",
  "/images/shop/132718579_1370015803349243_4576092651755794772_n.jpg",
]

export function HeroSection() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [count, setCount] = useState(0)
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    // Wait for the element to be visible (fade delay 360ms + partial animation), then count
    const startDelay = setTimeout(() => {
      const target = 500
      const duration = 1000
      const steps = 50
      const increment = target / steps
      const interval = duration / steps
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          setCount(target)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, interval)
    }, 500)
    return () => clearTimeout(startDelay)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex(i => (i + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    Promise.all([fetch("/api/categories"), fetch("/api/products")])
      .then(([r1, r2]) => Promise.all([r1.json(), r2.json()]))
      .then(([catData, prodData]) => {
        if (catData.success)  setCategories(catData.categories)
        if (prodData.success) setProducts(prodData.products)
      })
      .catch(() => {})
  }, [])


  return (
    <div className="bg-white">

      {/* ── Trust bar ── */}
      <div className="hidden md:block border-b border-[#E0E0E0] bg-white">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1 text-sm text-[#333333]">
            {[
              "100% Schweizer Shop",
              "Schnelle Lieferung",
              "14 Tage Rückgaberecht",
            ].map((item, i) => (
              <span
                key={item}
                className="flex items-center gap-1.5 section-fade"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <span className="text-[#2C5F2E] font-bold">✓</span>
                <span>{item}</span>
              </span>
            ))}
            <span
              className="flex items-center gap-1.5 section-fade"
              style={{ animationDelay: "360ms" }}
            >
              <span className="text-[#2C5F2E] font-bold">✓</span>
              <span><span className="font-bold">{count}+</span> Artikel im Sortiment</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Hero banner ── */}
      <div
        id="hero"
        className="relative w-full overflow-hidden"
        style={{ minHeight: "520px" }}
      >
        {HERO_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{
              transform: "scale(1.04)",
              transformOrigin: "center center",
              opacity: i === slideIndex ? 1 : 0,
            }}
          />
        ))}
        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIndex(i)}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{ background: i === slideIndex ? "#fff" : "rgba(255,255,255,0.4)" }}
            />
          ))}
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.58) 45%, rgba(0,0,0,0.18) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }}
        />

        <div className="relative z-10 container mx-auto px-6 flex items-center" style={{ minHeight: "520px" }}>
          <div className="max-w-2xl">
            {/* Frühjahrs-Sale chip removed */}

            <h1
              className="text-white font-black leading-[1.05] mb-5"
              style={{
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                textShadow: "0 2px 24px rgba(0,0,0,0.45)",
                letterSpacing: "-0.02em",
              }}
            >
              Top-Ausrüstung<br />
              <span className="text-[#6DBF6A]">zu Bestpreisen</span>
            </h1>

            <p className="text-white/75 text-lg mb-8 leading-relaxed max-w-lg">
              Jagd, Angeln & Outdoor — alles was du brauchst,<br />
              jetzt zum Frühjahrs-Sale-Preis.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/shop")}
                className="bg-white text-[#1A1A1A] font-bold px-8 py-3.5 text-sm hover:bg-[#F0F0F0] transition-all rounded-full inline-flex items-center gap-2 shadow-xl"
              >
                Zum Angebot <span className="text-base">→</span>
              </button>
              <button
                onClick={() => router.push("/shop")}
                className="border-2 border-white/40 hover:border-white text-white font-semibold px-8 py-3.5 text-sm transition-all rounded-full hover:bg-white/10"
              >
                Alle Kategorien
              </button>
            </div>

            <div className="flex items-center gap-8 mt-10 pt-8 border-t border-white/12">
              {[
                { val: "500+", label: "Artikel" },
                { val: "1–3 Tage", label: "Lieferung" },
                { val: "100%", label: "Schweizer Shop" },
              ].map(({ val, label }) => (
                <div key={label}>
                  <div className="text-white font-black text-xl leading-none">{val}</div>
                  <div className="text-white/45 text-xs mt-1 tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#2C5F2E]/70 to-transparent" />
      </div>

      {/* ── Unsere beliebtesten Marken ── */}
      <div className="bg-white border-b border-[#E0E0E0] py-8">
        <div className="container mx-auto px-4 mb-5">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-l from-[#E0E0E0] to-transparent" />
            <h2 className="text-xs font-black text-[#888] uppercase tracking-[0.18em] whitespace-nowrap">Unsere beliebtesten Marken</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[#E0E0E0] to-transparent" />
          </div>
        </div>
        {(() => {
          const normalizeOrigin = (s: string) => s.toUpperCase().replace(/[`'']/g, "'").replace(/\s*&\s*/g, " & ").replace(/\s+/g, " ").trim()
          const ORIGIN_ALIASES: Record<string, string> = {
            "BLACKFIELD": "BLACK FIELD",
            "BLACKFLASH": "BLACK FLASH",
            "SMITH&WESSON": "SMITH & WESSON",
          }
          const BRAND_COLORS = [
            "#2C5F2E", "#CC0000", "#1A5276", "#8B0000", "#FF6600",
            "#003087", "#8B6914", "#1A1A8C", "#333", "#555",
            "#0B6E4F", "#9B2335", "#D4A017", "#4A148C", "#00695C",
          ]
          const brands = Array.from(
            new Set(
              products
                .map((p) => p.origin)
                .filter((s): s is string => !!s && s.trim() !== "")
                .map(s => {
                  const n = normalizeOrigin(s)
                  return ORIGIN_ALIASES[n] ?? n
                })
            )
          ).sort()
          if (brands.length === 0) return null
          return (
            <div className="overflow-hidden w-full">
              <style>{`
                @keyframes marquee {
                  0%   { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .marquee-track { animation: marquee ${Math.max(40, brands.length * 4)}s linear infinite; }
              `}</style>
              <div className="flex marquee-track w-max">
                {[...Array(2)].flatMap((_, copy) =>
                  brands.map((name, i) => (
                    <div
                      key={`${copy}-${name}`}
                      className="flex-shrink-0 mx-[5px] px-4 py-2 rounded-full border border-[#EBEBEB] bg-white flex items-center gap-2.5 select-none"
                    >
                      <span className="font-black text-sm tracking-wide" style={{ color: BRAND_COLORS[i % BRAND_COLORS.length] }}>{name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })()}
      </div>

      {/* ── Unsere Top Kategorien (dinámico, solo 6) ── */}
      <div id="spice-discovery" className="bg-[#F0F1F3] border-b border-[#E0E0E0] py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#2C5F2E] mb-1">Sortiment</p>
              <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">Unsere Top Kategorien</h2>
              <p className="text-sm text-[#888] mt-1">Schnell und einfach zu den passenden Produkten.</p>
            </div>
            <button
              onClick={() => router.push("/shop")}
              className="hidden sm:flex items-center gap-1.5 text-sm text-[#2C5F2E] font-semibold hover:underline transition-all pb-1"
            >
              Alle anzeigen →
            </button>
          </div>

          {/* Skeleton */}
          {categories.length === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-200 animate-pulse aspect-[3/4]" />
              ))}
            </div>
          )}

          {/* Grid — 3 categorías con iconos */}
          {categories.length > 0 && (() => {
            const iconMap: Record<string, React.ReactNode> = {
              "Lampen": <Flashlight className="w-7 h-7" />,
              "Messer": <Sword className="w-7 h-7" />,
              "Armbrust": <Target className="w-7 h-7" />,
              "Armbrust Zubehör": <Wrench className="w-7 h-7" />,
              "Beil": <Axe className="w-7 h-7" />,
              "Security": <Shield className="w-7 h-7" />,
            }
            const colors = [
              { bg: "bg-white", icon: "bg-[#2C5F2E]/10 text-[#2C5F2E]", accent: "text-[#2C5F2E]", border: "hover:border-[#2C5F2E]/40" },
              { bg: "bg-white", icon: "bg-[#2C5F2E]/10 text-[#2C5F2E]", accent: "text-[#2C5F2E]", border: "hover:border-[#2C5F2E]/40" },
              { bg: "bg-white", icon: "bg-[#2C5F2E]/10 text-[#2C5F2E]", accent: "text-[#2C5F2E]", border: "hover:border-[#2C5F2E]/40" },
            ]
            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                {categories.slice(0, 6).map((cat, i) => {
                  const catProds = products.filter(p =>
                    p.category === cat.slug || p.category === cat.name
                  )
                  const c = colors[i % 3]
                  return (
                    <button
                      key={cat.id}
                      onClick={() => router.push(`/shop?cat=${encodeURIComponent(cat.name)}`)}
                      className={`${c.bg} rounded-2xl border border-[#E8E8E8] ${c.border} p-5 group hover:shadow-xl transition-all duration-300 text-left flex flex-col gap-4 relative overflow-hidden`}
                    >
                      {/* Decorative circles — floating */}
                      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#2C5F2E]/5 animate-float" />
                      <div className="absolute -top-2 -right-2 w-16 h-16 rounded-full bg-[#2C5F2E]/8 animate-float-reverse" />
                      <div className={`relative w-14 h-14 rounded-2xl ${c.icon} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        {iconMap[cat.name] || <Flashlight className="w-7 h-7" />}
                      </div>
                      <div>
                        <p className="font-black text-[#1A1A1A] text-lg group-hover:text-[#2C5F2E] transition-colors">
                          {cat.name}
                        </p>
                        <p className="text-xs text-[#888] mt-1">{catProds.length} Produkte verfügbar</p>
                      </div>
                      <span className={`text-sm font-semibold ${c.accent} group-hover:gap-2 inline-flex items-center gap-1 transition-all`}>
                        Entdecken <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )
          })()}

          {/* Mobile CTA */}
          <div className="mt-5 sm:hidden">
            <button
              onClick={() => router.push("/shop")}
              className="w-full py-3 rounded-2xl border-2 border-[#2C5F2E]/25 hover:border-[#2C5F2E] text-sm font-bold text-[#2C5F2E] transition-all"
            >
              Alle Kategorien anzeigen →
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
