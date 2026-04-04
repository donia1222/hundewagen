"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Fish, Menu, Newspaper, Images, ShoppingCart, Anchor, Waves, Package } from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { LoginAuth } from "@/components/login-auth"
import { Footer } from "@/components/footer"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface FishingCard {
  id: number
  image: string
  icon: React.ReactNode
  badge: string
  title: string
  description: string
}

const CARDS: FishingCard[] = [
  {
    id: 1,
    image: "/images/fischen/472679633_1183608080203417_7913441867178334031_n.jpg",
    icon: <Fish className="w-3.5 h-3.5 text-[#2C5F2E]" />,
    badge: "Angeln",
    title: "Alles zum Angeln im Laden",
    description: "Angelhaken, Ruten, Köder, Schwimmer und Angelschnüre — alles, was du für einen erfolgreichen Angeltag brauchst.",
  },
  {
    id: 2,
    image: "/images/fischen/589527302_1466241405273415_5787096142363867948_n.jpg",
    icon: <Anchor className="w-3.5 h-3.5 text-[#2C5F2E]" />,
    badge: "Zubehör",
    title: "Angelzubehör & Ausrüstung",
    description: "Vom Kescher bis zur Tackle-Box — unser Sortiment bietet professionelles Zubehör für Anfänger und erfahrene Angler.",
  },
  {
    id: 3,
    image: "/images/fischen/488932258_1259588225938735_6410340367577521871_n.jpg",
    icon: <Waves className="w-3.5 h-3.5 text-[#2C5F2E]" />,
    badge: "Outdoor",
    title: "Kanus & Wassersport",
    description: "Kanus, Boote und Zubehör für Wassersport und Angelausflüge auf Seen und Flüssen in der Schweiz.",
  },
  {
    id: 4,
    image: "/images/fischen/132081708_1370015766682580_118186262331184813_n.jpg",
    icon: <Package className="w-3.5 h-3.5 text-[#2C5F2E]" />,
    badge: "Köder",
    title: "Kunstköder & Naturköder",
    description: "Große Auswahl an Kunstködern, Wobblern, Gummifischen und Naturködern für jeden Gewässertyp.",
  },
  {
    id: 5,
    image: "/images/fischen/503264101_2659264021091075_8537894800997994009_n.jpg",
    icon: <Fish className="w-3.5 h-3.5 text-[#2C5F2E]" />,
    badge: "Ruten",
    title: "Angelruten & Rollen",
    description: "Qualitative Angelruten und Rollen für Fliegenfischen, Spinnfischen und Grundangeln — für jede Fischart die richtige Ausrüstung.",
  },
]


export default function AngelnPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([])
  const [paySettings, setPaySettings] = useState<{
    enable_paypal: boolean; enable_stripe: boolean; enable_twint: boolean; enable_invoice: boolean
  } | null>(null)

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
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => { if (d.success) setCategories(d.categories) })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-[#F4F4F5]">

      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <button className="sm:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-[#2C5F2E] hover:text-white transition-all flex-shrink-0 focus:outline-none">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-white border-r border-gray-100 w-full sm:w-72 flex flex-col p-0 shadow-2xl h-full">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex items-center justify-between p-4 pr-16 border-b border-[#E0E0E0] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <img src="/Security_n.png" alt="Logo" className="h-14 w-auto object-contain" />
                  <span className="leading-tight">
                    <span style={{ fontFamily: 'Impact, Arial Narrow, sans-serif', fontStyle: 'italic', fontWeight: 900, color: '#CC0000', fontSize: '0.9rem' }}>US-</span>
                    <span style={{ fontFamily: "'Rubik Dirt', sans-serif", color: '#1A1A1A', fontSize: '0.8rem' }}> FISHING &amp;<br />HUNTINGSHOP</span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="[&_span]:hidden flex items-center">
                    <LoginAuth onLoginSuccess={() => {}} onLogout={() => {}} onShowProfile={() => router.push("/profile")} isLightSection={true} variant="button" />
                  </div>
                  <button onClick={() => router.push("/shop")} className="relative p-2 rounded-xl hover:bg-[#F5F5F5] text-[#555]">
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                <button onClick={() => router.push("/")} className="w-full text-left px-3 py-2.5 text-sm rounded hover:bg-[#F5F5F5] text-[#333] font-medium">Home</button>
                <button onClick={() => router.push("/shop")} className="w-full text-left px-3 py-2.5 text-sm rounded hover:bg-[#F5F5F5] text-[#333] font-medium">Alle Produkte</button>
                {categories.map(cat => (
                  <button key={cat.slug} onClick={() => router.push(`/shop?cat=${encodeURIComponent(cat.name)}`)} className="w-full text-left px-3 py-2.5 text-sm rounded hover:bg-[#F5F5F5] text-[#333] font-medium">
                    {cat.name.replace(/\s*\d{4}$/, "")}
                  </button>
                ))}
                <div className="pt-2 mt-1 border-t border-[#E0E0E0]">
                  <div className="flex flex-wrap">
                    <button onClick={() => router.push("/blog")} className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded hover:bg-[#F5F5F5] text-[#2C5F2E] font-semibold"><Newspaper className="w-4 h-4 shrink-0" />Blog</button>
                    <button onClick={() => router.push("/gallery")} className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded hover:bg-[#F5F5F5] text-[#2C5F2E] font-semibold"><Images className="w-4 h-4 shrink-0" />Galerie</button>
                    <button onClick={() => router.push("/angeln")} className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded font-semibold bg-gray-100 text-[#2C5F2E]"><Fish className="w-4 h-4 shrink-0" />Angeln</button>
                  </div>
                  <p className="px-3 pt-3 pb-1 text-sm text-[#AAA] tracking-wide">Jagd · Angeln · Outdoor · Schweiz🇨🇭</p>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <button
            onClick={() => router.back()}
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-[#2C5F2E] hover:text-white transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-[#E5E5E5]" />
          <img src="/Security_n.png" alt="Logo" className="h-12 w-auto object-contain" />
          <span className="sm:hidden" style={{ fontFamily: "'Rubik Dirt', sans-serif", fontSize: '1.1rem', color: '#333333' }}>Angeln</span>
          <div className="hidden sm:block">
            <div className="leading-tight">
              <span style={{ fontFamily: 'Impact, Arial Narrow, sans-serif', fontStyle: 'italic', fontWeight: 900, color: '#CC0000', fontSize: '1rem' }}>US-</span>
              <span style={{ fontFamily: "'Rubik Dirt', sans-serif", color: '#1A1A1A', fontSize: '0.9rem' }}> FISHING &amp; HUNTINGSHOP</span>
            </div>
            <div className="text-[11px] text-[#888] uppercase tracking-widest mt-0.5">Angeln · Outdoor · Zubehör</div>
          </div>
        </div>
      </div>

      {/* Page title */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-7 bg-[#2C5F2E] rounded-full" />
          <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Angeln & Outdoor</h1>
        </div>
        <p className="text-sm text-[#888] ml-4">Alles zum Angeln im Laden — Angelhaken, Ruten, Köder, Netze, Kanus und vieles mehr.</p>
      </div>

      {/* First card — full width featured */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-2">
        <article className="bg-white rounded-3xl overflow-hidden border border-[#EBEBEB] shadow-sm mb-8">
          <div className="h-[340px] sm:h-[420px] overflow-hidden bg-[#F0F0F0]">
            <img src={CARDS[0].image} alt={CARDS[0].title} className="w-full h-full object-cover" />
          </div>
          <div className="p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#2C5F2E] bg-[#2C5F2E]/8 px-3 py-1 rounded-full">
                {CARDS[0].icon}
                {CARDS[0].badge}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight leading-tight mb-4">{CARDS[0].title}</h2>
            <div className="w-12 h-1 bg-[#2C5F2E] rounded-full mb-5" />
            <p className="text-base text-[#444] leading-[1.85]">{CARDS[0].description}</p>
          </div>
        </article>

        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-[#2C5F2E] rounded-full" />
          <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight">Unser Sortiment</h2>
        </div>

        {/* Cards grid — 2x2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-12">
          {CARDS.slice(1).map(card => (
            <article
              key={card.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#EBEBEB] shadow-md"
            >
              <div className="h-64 overflow-hidden bg-[#F0F0F0]">
                <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#2C5F2E] bg-[#2C5F2E]/8 px-3 py-1 rounded-full mb-3">
                  {card.icon}
                  {card.badge}
                </span>
                <h2 className="font-black text-[#1A1A1A] text-lg leading-tight mb-2">{card.title}</h2>
                <div className="w-8 h-0.5 bg-[#2C5F2E] rounded-full mb-3" />
                <p className="text-sm text-[#666] leading-relaxed">{card.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
