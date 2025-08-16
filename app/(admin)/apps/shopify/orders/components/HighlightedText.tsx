'use client'

import { cn } from '@/lib/utils'

interface HighlightedTextProps {
  text: string
  highlight?: string
  className?: string
}

export default function HighlightedText({ text, highlight, className }: HighlightedTextProps) {
  if (!highlight || !text) {
    return <span className={className}>{text}</span>
  }

  // Check if the text contains HTML highlighting tags from Algolia
  if (text.includes('<em>')) {
    // Convert Algolia highlighting to our format
    const highlightedText = text
      .replace(/<em>/g, '<mark class="bg-yellow-200 px-0.5 rounded">')
      .replace(/<\/em>/g, '</mark>')
    
    return (
      <span 
        className={className}
        dangerouslySetInnerHTML={{ __html: highlightedText }}
      />
    )
  }

  // Simple text highlighting
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
  
  return (
    <span className={className}>
      {parts.map((part, index) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  )
}
