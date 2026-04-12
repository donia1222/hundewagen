"use client"

import { useRouter } from "next/navigation"
import { Images, ArrowRight } from "lucide-react"

export function GalleryBanner() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push("/gallery")}
      className="w-full group relative overflow-hidden rounded-3xl text-left transition-all hover:shadow-2xl hover:-translate-y-1 duration-300 h-[200px]"
      style={{ background: "linear-gradient(135deg, #FFF0F6 0%, #FFE8F5 100%)", border: "1.5px solid #ffd0e5" }}
    >
      {/* Decorative blob */}
      <div
        className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-40 pointer-events-none"
        style={{ background: "radial-gradient(circle, #ffb3d0 0%, transparent 70%)" }}
      />

      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        <div>
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
            style={{ background: "white", color: "#FF6B9D", border: "1px solid #ffd0e5" }}
          >
            <Images className="w-3 h-3" />
            Galerie
          </span>
          <h3 className="text-xl font-black leading-tight tracking-tight" style={{ color: "var(--ap-dark)" }}>
            Glückliche Hunde{" "}
            <span style={{ color: "var(--ap-pink)" }}>in ihrem Wagen</span>
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--ap-muted)" }}>Lass dich von Fotos unserer Community inspirieren</p>
        </div>
        <div
          className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all"
          style={{ color: "var(--ap-pink)" }}
        >
          Galerie ansehen <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  )
}
