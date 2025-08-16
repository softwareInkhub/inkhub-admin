'use client'

import React from 'react'
import { ChevronDown, Grid } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CardsPerRowDropdownProps {
  cardsPerRow: number
  onCardsPerRowChange: (count: number) => void
  className?: string
}

export default function CardsPerRowDropdown({
  cardsPerRow,
  onCardsPerRowChange,
  className
}: CardsPerRowDropdownProps) {
  const options = [2, 3, 4, 5, 6]

  return (
    <div className={cn('relative', className)}>
      <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors">
        <Grid className="h-4 w-4" />
        <span className="text-sm font-medium">{cardsPerRow} per row</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      
      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="py-1">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => onCardsPerRowChange(option)}
              className={cn(
                'flex items-center space-x-3 w-full px-4 py-2 text-sm hover:bg-gray-50',
                cardsPerRow === option && 'bg-blue-50 text-blue-700'
              )}
            >
              <Grid className="h-4 w-4" />
              <span>{option} per row</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
