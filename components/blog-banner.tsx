"use client"

import { useRouter } from "next/navigation"
import { Newspaper, ArrowRight } from "lucide-react"

export function BlogBanner() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push("/blog")}
      className="w-full group relative overflow-hidden rounded-3xl text-left transition-all hover:shadow-2xl hover:-translate-y-1 duration-300 h-[200px]"
      style={{ background: "linear-gradient(135deg, #EEF3FF 0%, #E8E3FF 100%)", border: "1.5px solid #c3d4ff" }}
    >
      {/* Decorative blob */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-40 pointer-events-none"
        style={{ background: "radial-gradient(circle, #a5c0ff 0%, transparent 70%)" }}
      />

      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        <div>
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
            style={{ background: "white", color: "#4F7CFF", border: "1px solid #c3d4ff" }}
          >
            <Newspaper className="w-3 h-3" />
            Blog & Tipps
          </span>
          <h3 className="text-xl font-black leading-tight tracking-tight" style={{ color: "var(--ap-dark)" }}>
            Ratgeber und Tipps{" "}
            <span style={{ color: "var(--ap-blue)" }}>für deinen Hund</span>
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--ap-muted)" }}>Wie du den perfekten Hundewagen wählst und mehr</p>
        </div>
        <div
          className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all"
          style={{ color: "var(--ap-blue)" }}
        >
          Artikel lesen <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  )
}
