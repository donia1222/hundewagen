"use client"

import { Mountain, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export function FischenBanner() {
  const router = useRouter()
  return (
    <div
      onClick={() => router.push("/shop")}
      className="w-full relative overflow-hidden rounded-3xl h-[200px] md:h-[240px] cursor-pointer group"
    >
      <div className="absolute inset-0">
        <img
          src="/images/shop/header.jpeg"
          alt="Outdoor Abenteuer mit deinem Hund"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(79,124,255,0.7) 0%, rgba(255,107,157,0.4) 100%)" }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit"
          style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
        >
          <Mountain className="w-3 h-3" />
          Abenteuer & Outdoor
        </span>

        <div>
          <h2 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight mb-2">
            Outdoor-Touren mit<br />
            <span style={{ color: "#C8F5E8" }}>deinem Hund 🐾</span>
          </h2>
          <p className="text-white/80 text-xs mb-4 max-w-md">
            Leinen, Rucksäcke, Schutzbekleidung und alles für aktive Hunde in der Natur.
          </p>
          <span className="inline-flex items-center gap-2 text-white text-sm font-bold group-hover:gap-3 transition-all">
            Zum Shop <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  )
}
