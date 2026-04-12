"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, ChevronDown, Menu, ArrowUp, Newspaper, Download, Images, Mail, Gift } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { LoginAuth } from "./login-auth"

interface HeaderProps {
  onCartOpen?: () => void
  cartCount?: number
}

export function Header({ onCartOpen, cartCount = 0 }: HeaderProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLightSection] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [backendCategories, setBackendCategories] = useState<{ slug: string; name: string }[]>([])

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY
      setShowScrollTop(currentY > 400)
      if (currentY < 10) {
        setHeaderVisible(true)
      } else if (currentY > lastScrollY && currentY > 100) {
        setHeaderVisible(false)
      } else if (currentY < lastScrollY) {
        setHeaderVisible(true)
      }
      setLastScrollY(currentY)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [lastScrollY])

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(data => { if (data.success) setBackendCategories(data.categories) })
      .catch(() => {})
  }, [])

  const categories: { label: string; href: string; highlight?: boolean }[] = [
    { label: "Home", href: "/" },
    { label: "Alle Produkte", href: "/shop" },
    ...backendCategories.map(cat => ({
      label: cat.name,
      href: `/shop?cat=${encodeURIComponent(cat.name)}`,
    })),
    { label: "Gutscheine", href: "/gutscheine" },
  ]

  const handleLoginSuccess = (_user: any) => {}
  const handleLogout = () => {}
  const handleShowProfile = () => {
    router.push("/profile")
    setIsMenuOpen(false)
  }

  return (
    <>
    


      {/* ── TIER 2: Logo + Search + Icons ── */}
      <div className={`bg-white border-b sticky top-0 z-50 transition-transform duration-300 ${headerVisible ? "translate-y-0" : "-translate-y-full"}`} style={{ borderColor: "#e8eeff" }}>
        <div className="container mx-auto px-4 lg:px-8 h-[72px] flex items-center justify-between gap-3">

          {/* LEFT: Mobile menu + Logo */}
          <div className="flex items-center gap-3">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-all flex-shrink-0" style={{ background: "#EEF3FF", color: "#4F7CFF" }}>
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-white border-r border-gray-100 w-full sm:w-72 flex flex-col p-0 shadow-2xl h-full">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex items-center justify-between p-4 pr-16 border-b border-[#E0E0E0] flex-shrink-0">
                  <div className="flex flex-col gap-1">
                    <img src="/pawlogo.png" alt="Hundewagen" className="h-14 w-auto object-contain" />
                    <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#4F7CFF" }}>hundewagen.shop · Zubehör & Mehr 🐾</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="[&_span]:hidden flex items-center">
                      <LoginAuth
                        onLoginSuccess={handleLoginSuccess}
                        onLogout={handleLogout}
                        onShowProfile={handleShowProfile}
                        isLightSection={true}
                        variant="button"
                      />
                    </div>
                    <button
                      onClick={() => { onCartOpen?.(); setIsMenuOpen(false) }}
                      className="relative p-2 rounded-xl hover:bg-[#F5F5F5] text-[#555]"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {cartCount > 0 && (
                        <span className="absolute top-0 right-0 bg-[#CC0000] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                          {cartCount > 9 ? "9+" : cartCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                  {categories.map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => { router.push(cat.href); setIsMenuOpen(false) }}
                      className={`w-full text-left px-3 py-2.5 text-base rounded hover:bg-[#F5F5F5] flex items-center gap-2 ${cat.highlight ? "text-[#CC0000] font-bold" : "text-[#222222] font-bold"}`}
                    >
                      {cat.label === "Gutscheine" && <Gift className="w-4 h-4 shrink-0 text-[#4F7CFF]" />}
                      <span className={cat.label === "Gutscheine" ? "text-[#4F7CFF]" : ""}>{cat.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => { router.push("/blog"); setIsMenuOpen(false) }}
                    className="w-full text-left px-3 py-2.5 text-base rounded hover:bg-[#F5F5F5] flex items-center gap-2 text-[#4F7CFF] font-medium"
                  >
                    <Newspaper className="w-4 h-4 shrink-0" />
                    Blog
                  </button>
                  <button
                    onClick={() => { router.push("/gallery"); setIsMenuOpen(false) }}
                    className="w-full text-left px-3 py-2.5 text-base rounded hover:bg-[#F5F5F5] flex items-center gap-2 text-[#4F7CFF] font-medium"
                  >
                    <Images className="w-4 h-4 shrink-0" />
                    Gallery
                  </button>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2.5 flex-shrink-0 py-1 lg:pl-2"
            >
              <img src="/pawlogo.png" alt="Hundewagen" className="hidden md:block w-14 h-14 rounded-xl object-contain flex-shrink-0" />
              <div className="text-left">
                <div className="font-black text-lg leading-tight tracking-tight" style={{ color: "var(--ap-dark)" }}>Hundewagen</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ap-blue)" }}>hundewagen.shop · Zubehör & Mehr 🐾</div>
              </div>
            </button>
          </div>

          {/* RIGHT: Blog + Gallery + Login + Cart */}
          <div className="flex items-center gap-1 justify-end">
            <button
              onClick={() => router.push("/gutscheine")}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#333333] hover:text-[#4F7CFF] hover:bg-[#EEF3FF] rounded-xl transition-colors"
            >
              <Gift className="w-4 h-4 text-[#4F7CFF]" />
              Gutscheine
            </button>
            <button
              onClick={() => router.push("/blog")}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#333333] hover:text-[#4F7CFF] hover:bg-[#EEF3FF] rounded-xl transition-colors"
            >
              <Newspaper className="w-4 h-4 text-[#4F7CFF]" />
              Aktuelles & Tipps
            </button>
            <button
              onClick={() => router.push("/gallery")}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#333333] hover:text-[#4F7CFF] hover:bg-[#EEF3FF] rounded-xl transition-colors"
            >
              <Images className="w-4 h-4 text-[#4F7CFF]" />
              Gallery
            </button>
            <button
              onClick={() => {
                const footer = document.getElementById("footer")
                if (footer) footer.scrollIntoView({ behavior: "smooth" })
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#333333] hover:text-[#4F7CFF] hover:bg-[#EEF3FF] rounded-xl transition-colors"
            >
              <Mail className="w-4 h-4 text-[#4F7CFF]" />
              Kontakt
            </button>
            <div className="[&_span]:hidden flex items-center justify-center">
              <LoginAuth
                onLoginSuccess={handleLoginSuccess}
                onLogout={handleLogout}
                onShowProfile={handleShowProfile}
                isLightSection={isLightSection}
                variant="button"
              />
            </div>
            <button
              onClick={() => onCartOpen?.()}
              className="relative flex items-center justify-center w-11 h-11 hover:bg-[#F5F5F5] rounded-xl transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-[#555]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#CC0000] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── TIER 3: Category navigation bar ── */}
      <div className="bg-white hidden lg:block sticky top-0 z-40" style={{ borderBottom: "1px solid #e8eeff" }}>
        <div className="relative">
          {/* fade edges para indicar scroll */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent z-10" />
          <nav
            className="overflow-x-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex items-center justify-center min-w-max mx-auto px-4">
            {categories.filter(cat => cat.label !== "Home" && cat.label !== "Gutscheine").map((cat, i) => (
              <button
                key={i}
                onClick={() => router.push(cat.href)}
                className={`
                  flex items-center gap-1 px-4 py-3.5 text-[15px] font-medium whitespace-nowrap border-b-2 border-transparent flex-shrink-0
                  hover:border-[#4F7CFF] hover:text-[#4F7CFF] transition-colors
                  ${cat.highlight ? "text-[#FF6B9D] font-bold hover:border-[#FF6B9D] hover:text-[#FF6B9D]" : "text-[#4B5563]"}
                `}
              >
                {cat.label}

              </button>
            ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed right-6 z-50 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl p-3 shadow-xl border border-gray-200 transition-all hover:scale-110 active:scale-95"
          style={{ bottom: typeof window !== 'undefined' && window.innerWidth >= 1024 ? '5.5rem' : '1.5rem' }}
          aria-label="Nach oben scrollen"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  )
}
