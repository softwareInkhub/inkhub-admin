'use client'

import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CardsPerRowDropdownProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

export default function CardsPerRowDropdown({ value, onChange, className }: CardsPerRowDropdownProps) {
  const options = [3, 4, 5, 6, 7, 8]

  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 appearance-none cursor-pointer"
        style={{ zIndex: 10000 }}
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option} per row
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  )
}
