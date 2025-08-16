'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KPIMetric } from './types'

interface KPICardProps extends Omit<KPIMetric, 'icon'> {
  icon?: LucideIcon
  className?: string
  onClick?: () => void
}

export default function KPICard({
  value,
  change,
  trend,
  label,
  icon: Icon,
  color,
  className,
  onClick
}: KPICardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗'
      case 'down':
        return '↘'
      default:
        return '→'
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getColorClasses = () => {
    if (color) {
      return color
    }
    return 'bg-blue-100 text-blue-600'
  }

  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toLocaleString()
  }

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200',
        onClick && 'cursor-pointer hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
          <div className="flex items-center space-x-1 mt-2">
            <span className={cn('text-sm font-medium', getTrendColor())}>
              {getTrendIcon()} {formatChange(change)}
            </span>
            <span className="text-sm text-gray-500">from last month</span>
          </div>
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-lg', getColorClasses())}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  )
}
