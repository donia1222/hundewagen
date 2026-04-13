"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ShieldCheck, Truck, Star, Heart, ShoppingBag, LayoutGrid } from "lucide-react"

interface Category {
  id: number
  slug: string
  name: string
}

interface Product {
  id: number
  name: string
  category: string
  image_url?: string
  image_url_candidates?: string[]
}

const HERO_IMG = "/wagen.png"

const FEATURES = [
  { icon: <ShieldCheck className="w-4 h-4" />, label: "Sicherer Kauf" },
  { icon: <Truck className="w-4 h-4" />, label: "Schnelle Lieferung" },
  { icon: <Star className="w-4 h-4" />, label: "4.8★ Google" },
  { icon: <Star className="w-4 h-4" />, label: "Kuratierte Auswahl" },
]

export function HeroSection() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => { if (d.success) setCategories(d.categories) })
      .catch(() => {})

  }, [])

  return (
    <div style={{ background: "var(--ap-cream)" }}>

      {/* ── Trust strip ── */}
      <div className="hidden md:block border-b border-blue-100/60" style={{ background: "white" }}>
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-center gap-8">
            {FEATURES.map(({ icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--ap-muted)" }}>
                <span style={{ color: "var(--ap-blue)" }}>{icon}</span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO: Split layout ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #EEF3FF 0%, #FFF0F6 50%, #F7F8FF 100%)",
          minHeight: "560px",
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, #a5c0ff 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-25 pointer-events-none"
          style={{ background: "radial-gradient(circle, #ffb3d0 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #c8f5e8 0%, transparent 70%)" }}
        />

        <div className="relative z-10 container mx-auto px-6 py-8 md:py-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center" style={{ minHeight: "560px" }}>

            {/* Mobile image — shown above text on small screens */}
            <div className={`md:hidden relative transition-all duration-700 delay-150 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
              <div className="relative rounded-3xl overflow-hidden shadow-xl mx-auto" style={{ height: "240px", border: "3px solid white" }}>
                <img src={HERO_IMG} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 50%, rgba(26,26,46,0.18) 100%)" }} />
              </div>
            </div>

            {/* LEFT: Text content */}
            <div
              className={`flex flex-col items-start transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              {/* Headline */}
              <h1
                className="font-black leading-[1.1] mb-4"
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.6rem)",
                  color: "var(--ap-dark)",
                  letterSpacing: "-0.03em",
                }}
              >
                Der perfekte Hundewagen<br />
                <span
                  style={{
                    background: "linear-gradient(135deg, var(--ap-blue) 0%, var(--ap-pink) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  für jeden Ausflug
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base md:text-lg leading-relaxed max-w-md" style={{ color: "var(--ap-muted)" }}>
                Handverlesene Hundewagen von Amazon – komfortabel, sicher und ideal für Hunde jeder Grösse.
              </p>
            </div>

            {/* RIGHT: Dog image with floating cards */}
            <div className={`relative hidden md:flex items-center justify-center transition-all duration-700 delay-150 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
              {/* Main image */}
              <div
                className="relative rounded-3xl overflow-hidden shadow-2xl"
                style={{ width: "420px", height: "480px", border: "4px solid white" }}
              >
                <img src={HERO_IMG} alt="" className="absolute inset-0 w-full h-full object-cover" />
                {/* Soft overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, transparent 50%, rgba(26,26,46,0.18) 100%)" }}
                />
              </div>

              {/* Floating card: rating */}
              <div
                className="absolute top-6 -left-8 flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 shadow-xl"
                style={{ border: "1.5px solid #e8e3ff" }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "var(--ap-lavender)" }}>⭐</div>
                <div>
                  <div className="text-xs font-black" style={{ color: "var(--ap-dark)" }}>4.8 / 5</div>
                  <div className="text-[10px]" style={{ color: "var(--ap-muted)" }}>41 Bewertungen</div>
                </div>
              </div>

              {/* Floating card: shipment */}
              <div
                className="absolute bottom-10 -left-10 flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 shadow-xl"
                style={{ border: "1.5px solid #ffe0ed" }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "var(--ap-pink-pale)" }}>🚚</div>
                <div>
                  <div className="text-xs font-black" style={{ color: "var(--ap-dark)" }}>Schnelle Lieferung</div>
                  <div className="text-[10px]" style={{ color: "var(--ap-muted)" }}>Direkt vom Händler</div>
                </div>
              </div>

              {/* Floating card: dogs */}
              <div
                className="absolute -bottom-4 right-4 flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 shadow-xl"
                style={{ border: "1.5px solid #c3d4ff" }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "var(--ap-blue-pale)" }}>🐶</div>
                <div>
                  <div className="text-xs font-black" style={{ color: "var(--ap-dark)" }}>Für alle Hunde</div>
                  <div className="text-[10px]" style={{ color: "var(--ap-muted)" }}>Klein und gross</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── Feature strip ── */}
      <div style={{ background: "white", borderTop: "1px solid #e8eeff", borderBottom: "1px solid #e8eeff" }}>
        <div className="container mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <ShoppingBag className="w-5 h-5" />, title: "Sichere Hundewagen", desc: "Für Spaziergänge & Reisen", color: "#EEF3FF", accent: "#4F7CFF" },
              { icon: <Star className="w-5 h-5" />, title: "Beste Auswahl", desc: "Premium-Qualität", color: "#FFF0F6", accent: "#FF6B9D" },
              { icon: <Truck className="w-5 h-5" />, title: "Schnelle Lieferung", desc: "Direkt nach Hause", color: "#F0FFF8", accent: "#22C55E" },
              { icon: <Heart className="w-5 h-5" />, title: "Für jeden Hund", desc: "Klein oder gross", color: "#FFFBEE", accent: "#F59E0B" },
            ].map(({ icon, title, desc, color, accent }) => (
              <div
                key={title}
                className="flex items-center gap-3 p-3.5 rounded-2xl"
                style={{ background: color, border: `1px solid ${accent}20` }}
              >
                <span className="shrink-0" style={{ color: accent }}>{icon}</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--ap-dark)" }}>{title}</p>
                  <p className="text-xs" style={{ color: "var(--ap-muted)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Categorías grid ── */}
      {categories.length > 0 && (
        <div style={{ background: "var(--ap-cream)", borderBottom: "1px solid #e8eeff" }} className="py-14">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                  style={{ background: "var(--ap-blue-pale)", color: "var(--ap-blue-dark)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--ap-blue)" }} />
                  Unsere Kategorien
                </span>
                <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--ap-dark)" }}>
                  Alles für deinen Hund
                </h2>
                <p className="text-sm mt-1" style={{ color: "var(--ap-muted)" }}>
                  Finde genau das, was dein Begleiter braucht
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

            <div className="grid grid-cols-2 gap-4">
              {categories.slice(0, 4).map((cat, i) => {
                const palettes = [
                  { bg: "#EEF3FF", accent: "#4F7CFF" },
                  { bg: "#FFF0F6", accent: "#FF6B9D" },
                  { bg: "#F0FFF8", accent: "#22C55E" },
                  { bg: "#FFFBEE", accent: "#F59E0B" },
                  { bg: "#E8E3FF", accent: "#8B5CF6" },
                  { bg: "#FFF5F5", accent: "#EF4444" },
                ]
                const { bg, accent } = palettes[i % palettes.length]
                return (
                  <button
                    key={cat.id}
                    onClick={() => router.push(`/shop?cat=${encodeURIComponent(cat.name)}`)}
                    className="group text-left rounded-3xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    style={{ background: bg, border: `1.5px solid ${accent}25` }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110" style={{ background: `${accent}18` }}>
                      <LayoutGrid className="w-5 h-5" style={{ color: accent }} />
                    </div>
                    <p className="font-black text-base mb-0.5" style={{ color: "var(--ap-dark)" }}>{cat.name}</p>
                    <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: accent }}>
                      Produkte ansehen <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-5 sm:hidden">
              <button
                onClick={() => router.push("/shop")}
                className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all border-2"
                style={{ borderColor: "var(--ap-blue)", color: "var(--ap-blue)", background: "transparent" }}
              >
                Alle Kategorien ansehen →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
