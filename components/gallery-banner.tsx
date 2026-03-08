"use client"

import { useRouter } from "next/navigation"
import { Images, ArrowRight } from "lucide-react"

export function GalleryBanner() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push("/gallery")}
      className="w-full group relative overflow-hidden rounded-2xl text-left transition-all hover:shadow-xl hover:-translate-y-0.5 duration-300 h-[200px]"
    >
      <div className="absolute inset-0">
        <img
          src="/images/shop/46503497_763729157311247_9165108232799125504_ncopia.jpg"
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A1F]/90 via-[#1A1A3A]/80 to-[#2E2C5F]/50" />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 mb-3">
            <Images className="w-3 h-3 text-white" />
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">Galerie</span>
          </div>
          <h3 className="text-xl font-black text-white leading-tight tracking-tight">
            Eindrücke aus dem Shop
            <span className="text-[#8B8BFF]"> & Outdoor</span>
          </h3>
        </div>
        <div className="flex items-center gap-2 text-white/80 text-sm font-semibold group-hover:text-white group-hover:gap-3 transition-all">
          Zur Galerie <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  )
}
