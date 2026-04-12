"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronLeft, X, ChevronRight, Images } from "lucide-react"
import { Footer } from "@/components/footer"

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

  useEffect(() => {
    fetch("/api/gallery")
      .then(r => r.json())
      .then(d => { if (d.success) setImages(d.images) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen" style={{ background: "var(--ap-cream)" }}>

      {/* Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm" style={{ borderBottom: "1px solid #e8eeff" }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
          {/* Back button — all screens */}
          <button
            onClick={() => router.push("/")}
            className="flex w-9 h-9 items-center justify-center rounded-xl transition-all flex-shrink-0"
            style={{ background: "#EEF3FF", color: "#4F7CFF" }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-[#e8eeff]" />
          <div className="hidden sm:flex items-center gap-2.5">
            <img src="/pawlogo.png" alt="Hundewagen" className="w-12 h-12 rounded-xl object-contain flex-shrink-0" />
            <div>
              <div className="font-black text-base leading-tight" style={{ color: "#1A1A2E" }}>Hundewagen</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#FF6B9D" }}>Galerie & Fotos</div>
            </div>
          </div>
          <span className="sm:hidden font-black text-base" style={{ color: "#1A1A2E" }}>Galerie</span>
        </div>
      </div>

      {/* Page title */}
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ background: "#FFF0F6", color: "#c0395a", border: "1px solid #ffd0e5" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B9D]" />
          Galerie
        </span>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: "#1A1A2E" }}>Unsere Fotos</h1>
        <p className="text-sm mt-1" style={{ color: "#6B7280" }}>Bilder glücklicher Hunde, Abenteuer und unserer Produkte.</p>
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
                className="break-inside-avoid bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-zoom-in group" style={{ border: "1.5px solid #e8eeff" }}
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
      <Footer />
    </div>
  )
}
