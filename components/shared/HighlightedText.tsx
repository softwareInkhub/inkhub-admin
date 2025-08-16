'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface HighlightedTextProps {
  text: string
  searchQuery: string
  className?: string
  highlightClassName?: string
}

export default function HighlightedText({
  text,
  searchQuery,
  className,
  highlightClassName = 'bg-yellow-200 font-medium'
}: HighlightedTextProps) {
  if (!searchQuery.trim()) {
    return <span className={className}>{text}</span>
  }

  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (regex.test(part)) {
          return (
            <mark key={index} className={cn('rounded px-0.5', highlightClassName)}>
              {part}
            </mark>
          )
        }
        return part
      })}
    </span>
  )
}
