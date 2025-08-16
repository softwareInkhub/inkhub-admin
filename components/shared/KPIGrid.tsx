'use client'

import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  Settings,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KPIGridProps, KPIMetrics } from './types'

export default function KPIGrid({
  kpiMetrics,
  data,
  onRefresh,
  onConfigure
}: KPIGridProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatValue = (value: number, label: string): string => {
    if (label.toLowerCase().includes('price') || label.toLowerCase().includes('value')) {
      return `₹${value.toLocaleString()}`
    }
    if (label.toLowerCase().includes('percentage')) {
      return `${value}%`
    }
    return value.toLocaleString()
  }

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Object.entries(kpiMetrics).map(([key, metric], index) => (
        <div 
          key={key} 
          className="card hover-lift animate-fade-in" 
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                {metric.label}
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                {formatValue(metric.value, metric.label)}
              </p>
            </div>
            <div className={cn(
              'rounded-lg p-3 hover-lift',
              metric.color ? metric.color : 'bg-blue-100'
            )}>
              {metric.icon ? (
                <div className={cn('h-6 w-6', metric.color ? metric.color.replace('bg-', 'text-') : 'text-blue-600')}>
                  {/* You can add icon mapping here */}
                </div>
              ) : (
                <div className="h-6 w-6 text-blue-600">
                  {/* Default icon */}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              {getTrendIcon(metric.trend)}
              <span className={cn(
                'ml-1 text-sm font-medium',
                getTrendColor(metric.trend)
              )}>
                {formatChange(metric.change)}
              </span>
              <span className="ml-2 text-sm text-secondary-500 dark:text-secondary-400">
                from last month
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              {onRefresh && (
                <button
                  onClick={() => onRefresh(key)}
                  className="p-1 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
              {onConfigure && (
                <button
                  onClick={() => onConfigure(key, metric)}
                  className="p-1 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded transition-colors"
                  title="Configure"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
              <button className="p-1 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
