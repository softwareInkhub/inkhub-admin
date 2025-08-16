'use client'

import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPIMetric {
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
}

interface KPICardProps {
  label: string
  metric: KPIMetric
  gradient: string
  icon: string
  bgGradient: string
}

export default function KPICard({
  label,
  metric,
  gradient,
  icon,
  bgGradient
}: KPICardProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-3 w-3 text-green-600" />
      case 'down':
        return <ArrowDown className="h-3 w-3 text-red-600" />
      default:
        return <Minus className="h-3 w-3 text-gray-400" />
    }
  }

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      const millions = Math.round(value / 100000) / 10
      return `${millions}M`
    } else if (value >= 1000) {
      const thousands = Math.round(value / 100) / 10
      return `${thousands}K`
    }
    return Math.round(value).toLocaleString()
  }

  return (
    <div className={cn(
      "bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 group",
      "relative overflow-hidden"
    )}>
      {/* Background Gradient */}
      <div className={cn(
        "absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-200",
        bgGradient
      )} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{icon}</span>
            <span className="text-xs font-medium text-gray-600">{label}</span>
          </div>
          <div className="flex items-center space-x-1">
            {getTrendIcon(metric.trend)}
            <span className={cn(
              "text-xs font-medium",
              metric.trend === 'up' ? "text-green-600" :
              metric.trend === 'down' ? "text-red-600" :
              "text-gray-500"
            )}>
              {metric.change > 0 ? '+' : ''}{metric.change}%
            </span>
          </div>
        </div>
        
        <div className={cn(
          "text-xl font-bold",
          gradient
        )}>
          {formatValue(metric.value)}
        </div>
      </div>
    </div>
  )
}
