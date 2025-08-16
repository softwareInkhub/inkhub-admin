'use client'

import { useState } from 'react'
import KPICard from './KPICard'

interface KPIMetric {
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
}

interface KPIConfig {
  refreshRate: number
  alertThreshold: number
  isVisible: boolean
  showTrend: boolean
  showPercentage: boolean
  customLabel?: string
  customIcon?: string
}

interface KPIGridProps {
  kpiMetrics: {
    totalProducts: KPIMetric
    activeProducts: KPIMetric
    draftProducts: KPIMetric
    totalValue: KPIMetric
    averagePrice: KPIMetric
    lowStock: KPIMetric
  }
  onRefresh?: (kpiKey: string) => void
  onConfigure?: (kpiKey: string, config: KPIConfig) => void
}

export default function KPIGrid({ kpiMetrics, onRefresh, onConfigure }: KPIGridProps) {
  const [kpiConfigs, setKpiConfigs] = useState<Record<string, KPIConfig>>({
    totalProducts: {
      refreshRate: 30,
      alertThreshold: 0,
      isVisible: true,
      showTrend: true,
      showPercentage: true
    },
    activeProducts: {
      refreshRate: 30,
      alertThreshold: 0,
      isVisible: true,
      showTrend: true,
      showPercentage: true
    },
    draftProducts: {
      refreshRate: 30,
      alertThreshold: 0,
      isVisible: true,
      showTrend: true,
      showPercentage: true
    },
    totalValue: {
      refreshRate: 30,
      alertThreshold: 0,
      isVisible: true,
      showTrend: true,
      showPercentage: true
    },
    averagePrice: {
      refreshRate: 30,
      alertThreshold: 0,
      isVisible: true,
      showTrend: true,
      showPercentage: true
    },
    lowStock: {
      refreshRate: 30,
      alertThreshold: 10, // Default threshold for low stock
      isVisible: true,
      showTrend: true,
      showPercentage: true
    }
  })

  const kpiData = [
    { 
      key: 'totalProducts', 
      label: 'Total Products', 
      metric: kpiMetrics.totalProducts,
      gradient: 'from-blue-500 to-blue-600',
      icon: '📦',
      bgGradient: 'from-blue-50 to-blue-100',
      isCurrency: false
    },
    { 
      key: 'activeProducts', 
      label: 'Active Products', 
      metric: kpiMetrics.activeProducts,
      gradient: 'from-green-500 to-green-600',
      icon: '✅',
      bgGradient: 'from-green-50 to-green-100',
      isCurrency: false
    },
    { 
      key: 'draftProducts', 
      label: 'Draft Products', 
      metric: kpiMetrics.draftProducts,
      gradient: 'from-yellow-500 to-yellow-600',
      icon: '📝',
      bgGradient: 'from-yellow-50 to-yellow-100',
      isCurrency: false
    },
    { 
      key: 'totalValue', 
      label: 'Total Value', 
      metric: kpiMetrics.totalValue,
      gradient: 'from-purple-500 to-purple-600',
      icon: '💰',
      bgGradient: 'from-purple-50 to-purple-100',
      isCurrency: true
    },
    { 
      key: 'averagePrice', 
      label: 'Average Price', 
      metric: kpiMetrics.averagePrice,
      gradient: 'from-indigo-500 to-indigo-600',
      icon: '📊',
      bgGradient: 'from-indigo-50 to-indigo-100',
      isCurrency: true
    },
    { 
      key: 'lowStock', 
      label: 'Low Stock Items', 
      metric: kpiMetrics.lowStock,
      gradient: 'from-red-500 to-red-600',
      icon: '⚠️',
      bgGradient: 'from-red-50 to-red-100',
      isCurrency: false
    }
  ]

  const handleRefresh = (kpiKey: string) => {
    onRefresh?.(kpiKey)
  }

  const handleConfigure = (kpiKey: string, config: KPIConfig) => {
    setKpiConfigs(prev => ({
      ...prev,
      [kpiKey]: config
    }))
    onConfigure?.(kpiKey, config)
  }

  return (
    <div className="px-4 py-2">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
        {kpiData
          .filter(({ key }) => kpiConfigs[key]?.isVisible !== false)
          .map(({ key, label, metric, gradient, icon, bgGradient, isCurrency }) => (
            <KPICard
              key={key}
              label={label}
              metric={metric}
              gradient={gradient}
              icon={icon}
              bgGradient={bgGradient}
              isCurrency={isCurrency}
              config={kpiConfigs[key]}
              onRefresh={() => handleRefresh(key)}
              onConfigure={(config) => handleConfigure(key, config)}
            />
          ))}
      </div>
    </div>
  )
}
