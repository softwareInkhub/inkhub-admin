'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageDisplayProps {
  src: string
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallbackIcon?: React.ReactNode
}

export default function ImageDisplay({
  src,
  alt,
  size = 'md',
  className,
  fallbackIcon
}: ImageDisplayProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-32 h-32'
  }

  const handleError = () => {
    setError(true)
    setLoading(false)
  }

  const handleLoad = () => {
    setLoading(false)
  }

  if (error || !src) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-gray-200 rounded-lg',
        sizeClasses[size],
        className
      )}>
        {fallbackIcon || (
          <svg className="w-1/2 h-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      'relative overflow-hidden rounded-lg',
      sizeClasses[size],
      className
    )}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          'object-cover transition-opacity duration-200',
          loading ? 'opacity-0' : 'opacity-100'
        )}
        onError={handleError}
        onLoad={handleLoad}
        sizes={size === 'xs' ? '24px' : size === 'sm' ? '32px' : size === 'md' ? '48px' : size === 'lg' ? '64px' : '128px'}
      />
    </div>
  )
}
