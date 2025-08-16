'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import ImageDisplay from './ImageDisplay'
import StatusBadge from './StatusBadge'
import HighlightedText from './HighlightedText'

interface DataCardProps<T> {
  item: T
  selected?: boolean
  onSelect?: (id: string) => void
  onClick?: (item: T) => void
  searchQuery?: string
  variant?: 'default' | 'large'
  className?: string
  showImages?: boolean
  imageField?: keyof T
  titleField?: keyof T
  subtitleField?: keyof T
  statusField?: keyof T
  priceField?: keyof T
  tagsField?: keyof T
}

export default function DataCard<T extends { id: string }>({
  item,
  selected = false,
  onSelect,
  onClick,
  searchQuery = '',
  showImages = true,
  imageField = 'images' as keyof T,
  titleField = 'title' as keyof T,
  subtitleField = 'vendor' as keyof T,
  statusField = 'status' as keyof T,
  priceField = 'price' as keyof T,
  tagsField = 'tags' as keyof T,
  className
}: DataCardProps<T>) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.(item)
  }

  const handleSelect = () => {
    onSelect?.(item.id)
  }

  const getFieldValue = (field: keyof T) => {
    const value = item[field]
    if (Array.isArray(value)) {
      return value
    }
    return String(value || '')
  }

  const title = getFieldValue(titleField)
  const subtitle = getFieldValue(subtitleField)
  const status = getFieldValue(statusField)
  const price = getFieldValue(priceField)
  const tags = getFieldValue(tagsField)
  const images = getFieldValue(imageField)

  return (
    <div
      className={cn(
        'border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer',
        selected && 'ring-2 ring-blue-500 bg-blue-50',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3 mb-3">
        {onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={handleSelect}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        
        {showImages && Array.isArray(images) && images.length > 0 && (
          <ImageDisplay
            src={images[0]}
            alt={String(title)}
            size="md"
          />
        )}
      </div>

      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
        {searchQuery ? (
          <HighlightedText
            text={String(title)}
            searchQuery={searchQuery}
            className="text-gray-900"
          />
        ) : (
          title
        )}
      </h3>

      {subtitle && (
        <p className="text-sm text-gray-500 mb-2">{subtitle}</p>
      )}

      <div className="flex items-center justify-between mb-2">
        {typeof price === 'number' && (
          <span className="text-lg font-semibold text-gray-900">₹{(price as number).toFixed(2)}</span>
        )}
        {status && (
          <StatusBadge status={String(status)} type="status" />
        )}
      </div>

      {Array.isArray(tags) && tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
