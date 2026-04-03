"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronLeft, Calendar, X, ChevronRight, Menu, Newspaper, Images, Download, ShoppingCart } from "lucide-react"
import { Footer } from "@/components/footer"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { LoginAuth } from "@/components/login-auth"

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
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#2C5F2E] bg-[#2C5F2E]/8 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-[#2C5F2E] rounded-full" />
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
            <div className="w-12 h-1 bg-[#2C5F2E] rounded-full mb-6" />

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
    <div className="min-h-screen bg-[#F4F4F5]">

      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center gap-3">
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
                    <button onClick={() => router.push("/blog")} className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded font-semibold bg-gray-100 text-[#2C5F2E]"><Newspaper className="w-4 h-4 shrink-0" />Blog</button>
                    <button onClick={() => router.push("/gallery")} className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded hover:bg-[#F5F5F5] text-[#2C5F2E] font-semibold"><Images className="w-4 h-4 shrink-0" />Gallery</button>
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
          <span className="sm:hidden" style={{ fontFamily: "'Rubik Dirt', sans-serif", fontSize: '1.1rem', color: '#333333' }}>Blog</span>
          <div className="hidden sm:block">
            <div className="leading-tight">
              <span style={{ fontFamily: 'Impact, Arial Narrow, sans-serif', fontStyle: 'italic', fontWeight: 900, color: '#CC0000', fontSize: '1rem' }}>US-</span>
              <span style={{ fontFamily: "'Rubik Dirt', sans-serif", color: '#1A1A1A', fontSize: '0.9rem' }}> FISHING &amp; HUNTINGSHOP</span>
            </div>
            <div className="text-[11px] text-[#888] uppercase tracking-widest mt-0.5">News · Tipps · Wissen</div>
          </div>
        </div>
      </div>

      {/* Page title */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-7 bg-[#2C5F2E] rounded-full" />
          <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Aktuelles & Tipps</h1>
        </div>
        <p className="text-sm text-[#888] ml-4">Neuigkeiten, Produkttests und Expertentipps aus unserem Shop.</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0,1,2].map(i => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-[#EBEBEB] shadow-sm animate-pulse">
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
            <article key={post.id} className="bg-white rounded-3xl overflow-hidden border border-[#EBEBEB] shadow-sm mb-10">
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
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#2C5F2E] bg-[#2C5F2E]/8 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-[#2C5F2E] rounded-full" />
                    Beitrag
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-[#AAA] font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(post.created_at)}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight leading-tight mb-5">{post.title}</h2>
                <div className="w-12 h-1 bg-[#2C5F2E] rounded-full mb-6" />
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
            <div className="w-1 h-6 bg-[#2C5F2E] rounded-full" />
            <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight">Weitere Beiträge</h2>
          </div>
        )}
        {!loading && posts.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(1).map((post) => (
              <article
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-3xl overflow-hidden border border-[#EBEBEB] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
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
                  <div className="mt-4 text-xs font-bold text-[#2C5F2E] group-hover:underline">Weiterlesen →</div>
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
