"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronLeft, Calendar, X, ChevronRight } from "lucide-react"
import { Footer } from "@/components/footer"

interface BlogPost {
  id: number
  title: string
  content: string
  hero_image_url?: string
  image2_url?: string
  image3_url?: string
  image4_url?: string
  created_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-CH", { day: "2-digit", month: "long", year: "numeric" })
}

function Lightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
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
      <div className="absolute inset-0 bg-black/90" />

      {/* Image */}
      <img
        src={images[idx]}
        alt=""
        className="relative z-10 max-w-[92vw] max-h-[88vh] object-contain rounded-2xl shadow-2xl select-none"
        onClick={e => e.stopPropagation()}
      />

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
            className="absolute right-4 z-20 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors"
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

function PostModal({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  const extraImgs = [post.image2_url, post.image3_url, post.image4_url].filter(Boolean) as string[]
  const allImages = [post.hero_image_url, ...extraImgs].filter(Boolean) as string[]
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && lightboxIndex === null) onClose() }
    window.addEventListener("keydown", onKey)
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey) }
  }, [onClose, lightboxIndex])

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <div
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 hover:bg-white border border-[#E5E5E5] rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-105"
          >
            <X className="w-4 h-4 text-[#555]" />
          </button>

          {/* Hero image */}
          {post.hero_image_url && (
            <div
              className="h-[280px] sm:h-[380px] overflow-hidden rounded-t-3xl bg-[#F0F0F0] cursor-zoom-in"
              onClick={() => setLightboxIndex(0)}
            >
              <img src={post.hero_image_url} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          )}

          <div className="p-8 sm:p-10">
            {/* Date + badge */}
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#4F7CFF] bg-[#EEF3FF] px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-[#4F7CFF] rounded-full" />
                Beitrag
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#AAA] font-medium">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.created_at)}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight leading-tight mb-5">
              {post.title}
            </h2>

            {/* Divider */}
            <div className="w-12 h-1 rounded-full mb-6" style={{ background: "linear-gradient(90deg, #4F7CFF, #FF6B9D)" }} />

            {/* Content */}
            <p className="text-base text-[#444] leading-[1.85] whitespace-pre-line">
              {post.content}
            </p>

            {/* Extra images */}
            {extraImgs.length > 0 && (
              <div className={`mt-8 grid gap-4 ${
                extraImgs.length === 1 ? "grid-cols-1" :
                extraImgs.length === 2 ? "grid-cols-2" :
                "grid-cols-3"
              }`}>
                {extraImgs.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setLightboxIndex(i + 1)}
                    className={`rounded-2xl overflow-hidden bg-[#F0F0F0] cursor-zoom-in ${extraImgs.length === 1 ? "aspect-[16/7]" : "aspect-[4/3]"}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={allImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}

export default function BlogPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [firstPostLightbox, setFirstPostLightbox] = useState<{ images: string[]; index: number } | null>(null)
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([])

  useEffect(() => {
    fetch("/api/blog")
      .then(r => r.json())
      .then(d => { if (d.success) setPosts(d.posts) })
      .catch(() => {})
      .finally(() => setLoading(false))
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => { if (d.success) setCategories(d.categories) })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen" style={{ background: "var(--ap-cream)" }}>

      {/* Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm" style={{ borderBottom: "1px solid #e8eeff" }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-3">
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
              <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#4F7CFF" }}>Blog & Tipps</div>
            </div>
          </div>
          <span className="sm:hidden font-black text-base" style={{ color: "#1A1A2E" }}>Blog</span>
        </div>
      </div>

      {/* Hero banner */}
      <div style={{ background: "linear-gradient(135deg, #EEF3FF 0%, #E8E3FF 60%, #F7F8FF 100%)", borderBottom: "1px solid #e8eeff" }}>
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ background: "white", color: "#3A63E0", border: "1px solid #c3d4ff" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F7CFF]" />
              Blog & Tipps
            </span>
            <h1 className="font-black leading-tight" style={{ fontSize: "clamp(1.5rem, 4vw, 2.4rem)", color: "#1A1A2E", letterSpacing: "-0.02em" }}>
              Aktuelles & Tipps
            </h1>
            <p className="text-sm md:text-base mt-1.5 max-w-md" style={{ color: "#6B7280" }}>
              Neuigkeiten, Produkttests und Expertentipps für dich und deinen Hund.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0,1,2].map(i => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse" style={{ border: "1.5px solid #e8eeff" }}>
                <div className="h-52 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-28 bg-gray-100 rounded-full" />
                  <div className="h-5 w-4/5 bg-gray-200 rounded-full" />
                  <div className="h-3 w-full bg-gray-100 rounded-full" />
                  <div className="h-3 w-3/4 bg-gray-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-32">
            <p className="text-[#BBB] font-semibold text-lg">Noch keine Beiträge vorhanden.</p>
          </div>
        )}

        {/* First post — full expanded */}
        {!loading && posts.length > 0 && (() => {
          const post = posts[0]
          const extraImgs = [post.image2_url, post.image3_url, post.image4_url].filter(Boolean) as string[]
          const allImgs = [post.hero_image_url, ...extraImgs].filter(Boolean) as string[]
          return (
            <article key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-sm mb-10" style={{ border: "1.5px solid #e8eeff" }}>
              {post.hero_image_url && (
                <div
                  className="h-[420px] overflow-hidden bg-[#F0F0F0] cursor-zoom-in"
                  onClick={() => setFirstPostLightbox({ images: allImgs, index: 0 })}
                >
                  <img src={post.hero_image_url} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#4F7CFF] bg-[#EEF3FF] px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-[#4F7CFF] rounded-full" />
                    Beitrag
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-[#AAA] font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(post.created_at)}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight leading-tight mb-5">{post.title}</h2>
                <div className="w-12 h-1 rounded-full mb-6" style={{ background: "linear-gradient(90deg, #4F7CFF, #FF6B9D)" }} />
                <p className="text-base text-[#444] leading-[1.85] whitespace-pre-line">{post.content}</p>
                {extraImgs.length > 0 && (
                  <div className={`mt-8 grid gap-4 ${extraImgs.length === 1 ? "grid-cols-1" : extraImgs.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                    {extraImgs.map((url, i) => (
                      <div
                        key={i}
                        onClick={() => setFirstPostLightbox({ images: allImgs, index: i + 1 })}
                        className={`rounded-2xl overflow-hidden bg-[#F0F0F0] cursor-zoom-in ${extraImgs.length === 1 ? "aspect-[16/7]" : "aspect-[4/3]"}`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          )
        })()}

        {/* Rest of posts — card grid */}
        {!loading && posts.length > 1 && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #4F7CFF, #FF6B9D)" }} />
            <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight">Weitere Beiträge</h2>
          </div>
        )}
        {!loading && posts.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(1).map((post) => (
              <article
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
                style={{ border: "1.5px solid #e8eeff" }}
              >
                <div className="h-52 overflow-hidden bg-[#F0F0F0]">
                  {post.hero_image_url ? (
                    <img src={post.hero_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#CCC] text-sm">Kein Bild</div>
                  )}
                </div>
                <div className="p-5">
                  <span className="flex items-center gap-1.5 text-xs text-[#AAA] font-medium mb-2">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.created_at)}
                  </span>
                  <h2 className="font-black text-[#1A1A1A] text-base leading-tight mb-2 line-clamp-2">{post.title}</h2>
                  <p className="text-sm text-[#666] leading-relaxed line-clamp-3">{post.content}</p>
                  <div className="mt-4 text-xs font-bold text-[#4F7CFF] group-hover:underline">Weiterlesen →</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Post modal */}
      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      {/* Lightbox for first post images */}
      {firstPostLightbox && (
        <Lightbox
          images={firstPostLightbox.images}
          startIndex={firstPostLightbox.index}
          onClose={() => setFirstPostLightbox(null)}
        />
      )}
      <Footer />
    </div>
  )
}
