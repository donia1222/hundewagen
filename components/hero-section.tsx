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

export function HeroSection() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [count, setCount] = useState(0)

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
      <div className="border-b border-[#E0E0E0] bg-white">
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
        <img
          src="/images/shop/header.jpeg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scale(1.04)", transformOrigin: "center center" }}
          onError={(e) => {
            const el = e.currentTarget
            el.style.display = "none"
            if (el.parentElement) {
              el.parentElement.style.background =
                "linear-gradient(135deg, #0d1a0a 0%, #1a2e10 50%, #2d4a1e 100%)"
            }
          }}
        />
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
            <div className="inline-flex items-center gap-2.5 mb-6">
              <span className="bg-[#CC0000] text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                🔥 Frühjahrs-Sale
              </span>
              <span className="text-white/55 text-xs font-medium tracking-wide">Bis zu 30% Rabatt</span>
            </div>

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
        <div className="overflow-hidden w-full">
          <style>{`
            @keyframes marquee {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-track { animation: marquee 80s linear infinite; }
          `}</style>
          <div className="flex marquee-track w-max">
            {[...Array(2)].flatMap((_, copy) =>
              [
                { name: "AIRSOFT",      domain: "airsoft.ch",               style: "text-[#1A1A1A] font-black text-base tracking-widest" },
                { name: "BLACKFLASH",   domain: "black-flash-archery.com",  style: "text-[#1A1A1A] font-black text-base tracking-widest" },
                { name: "BÖKER",        domain: "boker.de",                 style: "text-[#8B0000] font-black text-base tracking-wide" },
                { name: "FISHERMAN'S",  domain: "fishermans-partner.eu",    style: "text-[#1A5276] font-black text-sm" },
                { name: "HALLER",       domain: "haller-stahlwaren.de",     style: "text-[#2C5F2E] font-black text-base tracking-wide" },
                { name: "JENZI",        domain: "jenzi.com",                style: "text-[#FF6600] font-black text-base" },
                { name: "LINDER",       domain: "linder.de",                style: "text-[#333] font-black text-base tracking-wide" },
                { name: "NATURZONE",    domain: "naturzone.ch",             style: "text-[#2C5F2E] font-bold text-sm tracking-wide" },
                { name: "POHLFORCE",    domain: "pohlforce.de",             style: "text-[#CC0000] font-black text-base" },
                { name: "SMOKI",        domain: "smoki-raeuchertechnik.de", style: "text-[#8B6914] font-black text-sm" },
                { name: "STEAMBOW",     domain: "steambow.at",              style: "text-[#1A1A8C] font-black text-base tracking-wider" },
                { name: "SYTONG",       domain: "sytong.global",            style: "text-[#003087] font-black text-sm tracking-wider" },
                { name: "WILTEC",       domain: "wiltec.de",                style: "text-[#555] font-black text-sm tracking-wide" },
              ].map((brand) => (
                <div
                  key={`${copy}-${brand.name}`}
                  className="flex-shrink-0 mx-[5px] px-4 py-2 rounded-full border border-[#EBEBEB] bg-white flex items-center gap-2.5 select-none"
                >
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=64`}
                    alt={brand.name}
                    className="h-5 w-auto object-contain flex-shrink-0"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                  />
                  <span className={brand.style}>{brand.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
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
                      className={`${c.bg} rounded-2xl border border-[#E8E8E8] ${c.border} p-5 group hover:shadow-xl transition-all duration-300 text-left flex flex-col gap-4`}
                    >
                      <div className={`w-14 h-14 rounded-2xl ${c.icon} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
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
