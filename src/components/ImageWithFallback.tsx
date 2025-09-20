'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Users } from 'lucide-react'

interface ImageWithFallbackProps {
  src: string | null | undefined
  alt: string
  width: number
  height: number
  className?: string
  fallbackIcon?: React.ReactNode
}

export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackIcon
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // If no src provided or image failed to load, show fallback
  if (!src || imageError) {
    return (
      <div 
        className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        {fallbackIcon || <Users className="text-gray-400" style={{ width: width * 0.6, height: height * 0.6 }} />}
      </div>
    )
  }

  // Validate URL format
  try {
    new URL(src)
  } catch {
    // If URL is invalid, show fallback
    return (
      <div 
        className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        {fallbackIcon || <Users className="text-gray-400" style={{ width: width * 0.6, height: height * 0.6 }} />}
      </div>
    )
  }

  return (
    <div className="relative" style={{ width, height }}>
      {isLoading && (
        <div 
          className={`absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center ${className}`}
          style={{ width, height }}
        >
          <div className="animate-pulse bg-gray-300 rounded" style={{ width: '60%', height: '60%' }} />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true)
          setIsLoading(false)
        }}
        unoptimized={src.includes('google.com') || src.includes('redirect')} // Skip optimization for redirect URLs
      />
    </div>
  )
}