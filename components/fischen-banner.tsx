"use client"

import { Fish } from "lucide-react"
import { useRouter } from "next/navigation"

export function FischenBanner() {
  const router = useRouter()
  return (
    <div
      onClick={() => router.push("/angeln")}
      className="w-full relative overflow-hidden rounded-2xl h-[200px] md:h-[240px] cursor-pointer group">
      <div className="absolute inset-0">
        <img
          src="/images/fischen/472679633_1183608080203417_7913441867178334031_n.jpg"
          alt="Angeln Zubehör"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-end p-5 md:p-7">
        <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-2.5 py-1 mb-2 w-fit">
          <Fish className="w-3 h-3 text-white" />
          <span className="text-white text-[9px] font-bold uppercase tracking-widest">Angeln & Outdoor</span>
        </div>

        <h2 className="text-lg md:text-2xl font-black text-white leading-tight tracking-tight mb-1">
          Alles zum <span className="text-[#6DD5FA]">Angeln</span>
        </h2>

        <p className="text-white/75 text-xs mb-3 max-w-md">
          Angelhaken, Ruten, Köder, Netze, Kanus und vieles mehr.
        </p>

      </div>
    </div>
  )
}
