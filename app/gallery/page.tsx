"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronLeft, X, ChevronRight, Images, Menu, Newspaper, Download, ShoppingCart } from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { LoginAuth } from "@/components/login-auth"

interface GalleryImage {
  id: number
  title: string | null
  image: string
  image_url: string
  created_at: string
}

function Lightbox({ images, startIndex, onClose }: { images: GalleryImage[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") setIdx(i => (i + 1) % images.length)
      if (e.key === "ArrowLeft") setIdx(i => (i - 1 + images.length) % images.length)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [images.length, onClose])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/92" />

      <img
        src={images[idx].image_url}
        alt={images[idx].title ?? ""}
        className="relative z-10 max-w-[92vw] max-h-[88vh] object-contain rounded-2xl shadow-2xl select-none"
        onClick={e => e.stopPropagation()}
      />

      {/* Title */}
      {images[idx].title && (
        <div className="absolute bottom-14 z-20 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-sm font-semibold px-5 py-2 rounded-full">
          {images[idx].title}
        </div>
      )}

      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length) }}
            className="absolute left-4 z-20 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white rotate-180" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length) }}
            className="absolute right-16 z-20 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 z-20 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setIdx(i) }}
                className={`w-2 h-2 rounded-full transition-all ${i === idx ? "bg-white scale-125" : "bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function GalleryPage() {
  const router = useRouter()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([])

  useEffect(() => {
    fetch("/api/gallery")
      .then(r => r.json())
      .then(d => { if (d.success) setImages(d.images) })
      .catch(() => {})
      .finally(() => setLoading(false))
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => { if (d.success) setCategories(d.categories) })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-[#F4F4F5]">

      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center gap-3">
          {/* Mobile: hamburger menu */}
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
                  <div className="flex">
                    <button onClick={() => router.push("/blog")} className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded hover:bg-[#F5F5F5] text-[#2C5F2E] font-semibold"><Newspaper className="w-4 h-4 shrink-0" />Blog</button>
                    <button onClick={() => router.push("/gallery")} className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded font-semibold bg-gray-100 text-[#2C5F2E]"><Images className="w-4 h-4 shrink-0" />Gallery</button>
                    <button
                      onClick={() => {
                        const imageUrl = "https://online-shop-seven-delta.vercel.app/Security_n.png"
                        fetch(imageUrl).then(r => r.blob()).then(blob => {
                          const reader = new FileReader(); reader.onloadend = () => {
                            const b64 = (reader.result as string).split(",")[1]
                            const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:US - Fishing & Huntingshop\nORG:US - Fishing & Huntingshop\nTITLE:JAGD · ANGELN · OUTDOOR\nADR:;;Bahnhofstrasse 2;Sevelen;;9475;Switzerland\nTEL:+41786066105\nEMAIL:info@usfh.ch\nURL:https://usfh.ch\nPHOTO;ENCODING=b;TYPE=PNG:${b64}\nEND:VCARD`
                            const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([vcard], { type: "text/vcard" })); a.download = "US-Fishing-Huntingshop.vcf"; document.body.appendChild(a); a.click(); document.body.removeChild(a)
                          }; reader.readAsDataURL(blob)
                        }).catch(() => {
                          const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:US - Fishing & Huntingshop\nORG:US - Fishing & Huntingshop\nTEL:+41786066105\nEMAIL:info@usfh.ch\nURL:https://usfh.ch\nEND:VCARD`
                          const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([vcard], { type: "text/vcard" })); a.download = "US-Fishing-Huntingshop.vcf"; document.body.appendChild(a); a.click(); document.body.removeChild(a)
                        })
                      }}
                      className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded hover:bg-[#F5F5F5] text-[#2C5F2E] font-semibold"
                    ><Download className="w-4 h-4 shrink-0" />VCard</button>
                  </div>
                  <p className="px-3 pt-3 pb-1 text-sm text-[#AAA] tracking-wide">Jagd · Angeln · Outdoor · Schweiz🇨🇭</p>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          {/* Desktop: back button */}
          <button
            onClick={() => router.push("/")}
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-[#2C5F2E] hover:text-white transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-[#E5E5E5]" />
          <img src="/Security_n.png" alt="Logo" className="h-12 w-auto object-contain" />
          <span className="sm:hidden" style={{ fontFamily: "'Rubik Dirt', sans-serif", fontSize: '1.1rem', color: '#333333' }}>Impressionen</span>
          <div className="hidden sm:block">
            <div className="leading-tight">
              <span style={{ fontFamily: 'Impact, Arial Narrow, sans-serif', fontStyle: 'italic', fontWeight: 900, color: '#CC0000', fontSize: '1rem' }}>US-</span>
              <span style={{ fontFamily: "'Rubik Dirt', sans-serif", color: '#1A1A1A', fontSize: '0.9rem' }}> FISHING &amp; HUNTINGSHOP</span>
            </div>
            <div className="text-[11px] text-[#888] uppercase tracking-widest mt-0.5">Bilder · Impressionen · Outdoor</div>
          </div>
        </div>
      </div>

      {/* Page title */}
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-7 bg-[#2C5F2E] rounded-full" />
          <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Galerie</h1>
        </div>
        <p className="text-sm text-[#888] ml-4">Eindrücke aus unserem Shop, Veranstaltungen und Outdoor-Erlebnisse.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-white rounded-2xl border border-[#EBEBEB] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="text-center py-32">
            <Images className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-[#BBB] font-semibold text-lg">Noch keine Bilder vorhanden.</p>
          </div>
        )}

        {!loading && images.length > 0 && (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {images.map((img, i) => (
              <div
                key={img.id}
                onClick={() => setLightboxIndex(i)}
                className="break-inside-avoid bg-white rounded-2xl overflow-hidden border border-[#EBEBEB] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-zoom-in group"
              >
                <div className="overflow-hidden">
                  <img
                    src={img.image_url}
                    alt={img.title ?? ""}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {img.title && (
                  <div className="px-3 py-2.5">
                    <p className="text-xs font-semibold text-[#444] leading-snug">{img.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}
