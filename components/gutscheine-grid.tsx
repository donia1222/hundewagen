"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, Check, Gift, ArrowLeft, ArrowUp, Truck } from "lucide-react"
import { ShoppingCartComponent } from "@/components/shopping-cart"
import { LoginAuth } from "@/components/login-auth"
import { CheckoutPage } from "@/components/checkout-page"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"

interface GiftCard {
  id: number
  name: string
  description: string
  amount: number
  image: string | null
  is_active: number
}

interface CartItem {
  id: number
  name: string
  price: number
  image: string
  description: string
  heatLevel: number
  rating: number
  quantity: number
  item_type: "gutschein"
  gift_card_id: number
}

const CART_KEY = "cantina-cart"
const CART_COUNT_KEY = "cantina-cart-count"
const gcEnabled = true
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export default function GutscheineGrid() {
  const router = useRouter()
  const [cards, setCards] = useState<GiftCard[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartCount, setCartCount] = useState(0)
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set())
  const [cartOpen, setCartOpen] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showBackTop, setShowBackTop] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadCards()
    loadCart()
    const onScroll = () => setShowBackTop(window.scrollY > 400)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const loadCards = async () => {
    try {
      const res = await fetch("/api/gutscheine")
      const data = await res.json()
      if (data.success) setCards(data.gift_cards)
    } catch {}
    finally { setLoading(false) }
  }

  const loadCart = () => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      if (saved) {
        const data: CartItem[] = JSON.parse(saved)
        setCart(data)
        setCartCount(data.reduce((s, i) => s + i.quantity, 0))
      }
    } catch {}
  }

  const saveCart = useCallback((c: CartItem[]) => {
    localStorage.setItem(CART_KEY, JSON.stringify(c))
    localStorage.setItem(CART_COUNT_KEY, c.reduce((s, i) => s + i.quantity, 0).toString())
  }, [])

  const addToCart = (card: GiftCard) => {
    const cartId = -card.id
    setCart(prev => {
      const exists = prev.find(i => i.id === cartId)
      const next = exists
        ? prev.map(i => i.id === cartId ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, {
            id: cartId,
            name: card.name,
            price: card.amount,
            image: "/icon-192x192.png",
            description: card.description ?? "",
            heatLevel: 0,
            rating: 0,
            quantity: 1,
            item_type: "gutschein" as const,
            gift_card_id: card.id,
          }]
      saveCart(next)
      setCartCount(next.reduce((s, i) => s + i.quantity, 0))
      return next
    })
    setAddedIds(prev => new Set([...prev, card.id]))
    setTimeout(() => setAddedIds(prev => { const s = new Set(prev); s.delete(card.id); return s }), 2000)
    toast({ title: "Gutschein hinzugefügt", description: card.name })
  }

  const removeFromCart = (cartId: number) => {
    setCart(prev => {
      const item = prev.find(i => i.id === cartId)
      const next = item && item.quantity > 1
        ? prev.map(i => i.id === cartId ? { ...i, quantity: i.quantity - 1 } : i)
        : prev.filter(i => i.id !== cartId)
      saveCart(next)
      setCartCount(next.reduce((s, i) => s + i.quantity, 0))
      return next
    })
  }

  const clearCart = () => {
    setCart([]); setCartCount(0)
    localStorage.setItem(CART_KEY, "[]")
    localStorage.setItem(CART_COUNT_KEY, "0")
  }

  if (showCheckout) {
    return (
      <CheckoutPage
        cart={cart}
        onBackToStore={() => setShowCheckout(false)}
        onRemoveFromCart={removeFromCart}
        onClearCart={clearCart}
      />
    )
  }

  return (
    <>
      {/* Side cart modal */}
      <ShoppingCartComponent
        isOpen={cartOpen}
        onOpenChange={setCartOpen}
        cart={cart}
        onAddToCart={() => {}}
        onRemoveFromCart={removeFromCart}
        onGoToCheckout={() => { setCartOpen(false); setShowCheckout(true) }}
        onClearCart={clearCart}
      />

      {/* Back to top */}
      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed right-6 bottom-6 z-50 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl p-3 shadow-xl border border-gray-200 transition-all hover:scale-110 active:scale-95"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      <div className="min-h-screen" style={{ background: "var(--ap-cream)" }}>

        {/* ── Top bar ── */}
        <div className="bg-white sticky top-0 z-30 shadow-sm" style={{ borderBottom: "1px solid #e8eeff" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">

            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all flex-shrink-0"
              style={{ background: "#EEF3FF", color: "#4F7CFF" }}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-[#e8eeff] flex-shrink-0" />

            {/* Alpine Paws branding */}
            <div className="hidden sm:flex items-center gap-2.5 flex-shrink-0">
              <img src="/pawlogo.png" alt="Hundewagen" className="w-12 h-12 rounded-xl object-contain flex-shrink-0" />
              <div>
                <div className="font-black text-base leading-tight" style={{ color: "#1A1A2E" }}>Hundewagen</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#4F7CFF" }}>Geschenkgutscheine</div>
              </div>
            </div>
            <span className="sm:hidden font-black text-base flex-shrink-0" style={{ color: "#1A1A2E" }}>Gutscheine</span>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right: login + cart */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="[&_span]:hidden sm:[&_span]:inline-block flex items-center justify-center">
                <LoginAuth
                  onLoginSuccess={() => {}}
                  onLogout={() => {}}
                  onShowProfile={() => router.push("/profile")}
                  isLightSection={true}
                  variant="button"
                />
              </div>
              <button
                onClick={() => gcEnabled && setCartOpen(true)}
                className={`relative flex flex-col items-center p-2 rounded-xl transition-colors ${gcEnabled ? "hover:bg-[#F5F5F5] cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
                disabled={!gcEnabled}
              >
                <ShoppingCart className="w-6 h-6 text-[#555]" />
                {gcEnabled ? (
                  <span className="text-[10px] text-[#555] mt-0.5 leading-none hidden sm:block">Warenkorb</span>
                ) : (
                  <span className="text-[9px] text-[#999] mt-0.5 leading-none hidden sm:block whitespace-nowrap">Demnächst</span>
                )}
                {gcEnabled && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#CC0000] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Hero banner */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: "220px", background: "linear-gradient(135deg, #EEF3FF 0%, #FFF0F6 60%, #E8E3FF 100%)" }}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle, #a5c0ff 0%, transparent 70%)" }} />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-25 pointer-events-none" style={{ background: "radial-gradient(circle, #ffb3d0 0%, transparent 70%)" }} />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4" style={{ background: "white", color: "#4F7CFF", border: "1px solid #c3d4ff" }}>
              <Gift className="w-3.5 h-3.5" /> Besondere Geschenke
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: "#1A1A2E" }}>
              Geschenk<span style={{ background: "linear-gradient(135deg, #4F7CFF, #FF6B9D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>gutscheine</span>
            </h1>
            <p className="text-sm sm:text-base mt-3 max-w-xl" style={{ color: "#6B7280" }}>Verschenke Freude an Hundeliebhaber und Abenteurer.</p>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          {loading ? (
            <div className="flex flex-col gap-5">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl h-44 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-semibold">Keine Gutscheine verfügbar</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {cards.map(card => {
                const isAdded = addedIds.has(card.id)
                return (
                  <div
                    key={card.id}
                    className="bg-white rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-row" style={{ border: "1.5px solid #e8eeff" }}
                    style={{ minHeight: "130px" }}
                  >
                    {/* Left: logo section */}
                    <div className="flex items-center justify-center px-1 py-2 flex-shrink-0 overflow-hidden w-[80px] sm:w-[140px] md:w-[180px]" style={{ background: "var(--ap-blue-pale)", borderRight: "1.5px solid #e8eeff" }}>
                      <img src="/icon-192x192.png" alt="US-Fishing & Huntingshop" className="w-full h-auto object-contain" />
                    </div>

                    {/* Center: card info */}
                    <div className="flex flex-col justify-center flex-1 px-3 sm:px-6 py-4 gap-1 min-w-0">
                      <span className="text-[9px] sm:text-[10px] font-black tracking-[0.15em] uppercase text-[#b40000] flex items-center gap-1"><Gift className="w-3 h-3 flex-shrink-0" />Geschenkgutschein</span>
                      <h3 className="text-base sm:text-xl font-black text-[#1A1A1A] leading-tight truncate">{card.name}</h3>
                      {card.description && (
                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{card.description}</p>
                      )}
                      <p className="text-[9px] font-bold tracking-[0.08em] uppercase text-[#4F7CFF] mt-1 leading-relaxed">
                        ALLES FUER DIE BACH FLUSS UND SEEFISCHE<br />
                        ** ARMBRUESTE UND PFEILBOEG<br />
                        ** GROSSES MESSERSORTIME
                      </p>
                    </div>

                    {/* Right: price + CTA */}
                    <div className="flex flex-col items-center justify-center px-3 sm:px-6 py-4 gap-2 flex-shrink-0 border-l border-[#E0E0E0] w-[90px] sm:w-[130px]">
                      <div className="text-center">
                        <span className="text-[10px] font-bold text-[#888] uppercase tracking-widest block">€</span>
                        <span className="text-2xl sm:text-4xl font-black text-[#1A1A1A] leading-none">{card.amount % 1 === 0 ? card.amount.toFixed(0) : card.amount.toFixed(2)}</span>
                      </div>
                      {gcEnabled ? (
                        <button
                          onClick={() => addToCart(card)}
                          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-95 ${
                            isAdded
                              ? "bg-emerald-500 text-white"
                              : "bg-[#D4622A] hover:bg-[#B8501F] text-white hover:shadow-md"
                          }`}
                        >
                          {isAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                        </button>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 opacity-50">
                            <ShoppingCart className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide text-center leading-tight">Demnächst<br/>verfügbar</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Info box */}
          <div className="mt-8 bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden text-sm text-gray-600">
            {/* Banner versandkostenfrei */}
            <div className="w-full py-4 text-center" style={{ background: "linear-gradient(90deg, #e8f5e9 0%, #f1f8f1 50%, #e8f5e9 100%)" }}>
              <p className="text-[#4F7CFF] font-black text-xl tracking-widest uppercase">Versandkostenfrei</p>
              <p className="text-[#4F7CFF]/60 text-xs tracking-widest uppercase mt-0.5">Geschenkgutscheine – keine Versandkosten</p>
            </div>
            {/* Hinweise */}
            <div className="p-6">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4 text-red-500" /> Hinweise zu Gutscheinen
              </h2>
              <ul className="space-y-2 list-disc list-inside text-sm">
                <li>Nach Zahlungseingang erhalten Sie den Gutschein-Code per E-Mail.</li>
                <li>Kein Mindestbestellwert. Nicht kombinierbar mit anderen Aktionen.</li>
                <li>Kein Rückgeld auf Gutscheine.</li>
                <li>Bei Fragen: <a href="mailto:info@usfh.ch" className="text-[#b40000] underline">info@usfh.ch</a></li>
              </ul>
            </div>
          </div>
          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 py-8">
            {[
              "100% Schweizer Shop",
              "Schnelle Lieferung",
              "14 Tage Rückgaberecht",
              "500+ Artikel im Sortiment",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2 bg-white border border-[#E8E8E8] rounded-full px-4 py-2 shadow-sm">
                <span className="w-5 h-5 rounded-full bg-[#D4622A] flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </span>
                <span className="text-xs font-semibold text-[#333]">{feat}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}
