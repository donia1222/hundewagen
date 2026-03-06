"use client"

import { useState, useEffect } from "react"
import { getResolvedImage, setResolvedImage } from "@/lib/product-cache"

const EXTENSIONS = [".jpg", ".JPG", ".jpeg", ".JPEG", ".png", ".webp"]
const HAS_EXT = /\.(jpg|jpeg|png|gif|webp|svg)$/i
const PLACEHOLDER = "/Security_n.png"

interface ProductImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string | null | undefined
  candidates?: string[]
  alt: string
  onAllFailed?: () => void
}

export function ProductImage({ src, candidates, alt, onAllFailed, ...props }: ProductImageProps) {
  const cacheKey = src || candidates?.[0] || ""
  const cached = cacheKey ? getResolvedImage(cacheKey) : undefined

  const urls: string[] = cached
    ? [cached]
    : candidates && candidates.length > 0
      ? candidates
      : src
        ? HAS_EXT.test(src)
          ? [src]
          : EXTENSIONS.map(ext => src + ext)
        : []

  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const allFailed = urls.length === 0 || attempt >= urls.length

  useEffect(() => {
    if (allFailed && onAllFailed) onAllFailed()
  }, [allFailed, onAllFailed])

  useEffect(() => {
    setLoaded(false)
    setAttempt(0)
  }, [src])

  if (allFailed) {
    const { className, ...rest } = props
    return (
      <img
        src={PLACEHOLDER}
        alt={alt}
        className={`object-contain p-4 bg-[#F5F5F5] ${className ?? ""}`}
        {...rest}
      />
    )
  }

  const { className, style, ...rest } = props

  return (
    <span className={`relative block overflow-hidden ${className ?? ""}`} style={style}>
      {!loaded && (
        <span className="absolute inset-0 bg-gradient-to-r from-[#F0F0F0] via-[#E8E8E8] to-[#F0F0F0] animate-pulse rounded-[inherit]" />
      )}
      <img
        src={urls[attempt]}
        alt={alt}
        loading="lazy"
        onLoad={() => {
          setLoaded(true)
          if (cacheKey && urls[attempt]) setResolvedImage(cacheKey, urls[attempt])
        }}
        onError={() => { setLoaded(false); setAttempt(a => a + 1) }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        {...rest}
      />
    </span>
  )
}
