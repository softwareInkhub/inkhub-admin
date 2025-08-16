'use client'

import KPICard from './KPICard'

interface KPIMetric {
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
}

interface KPIGridProps {
  kpiMetrics: {
    totalBoards: KPIMetric
    publicBoards: KPIMetric
    privateBoards: KPIMetric
    totalPins: KPIMetric
    totalFollowers: KPIMetric
    averagePinsPerBoard: KPIMetric
  }
}

export default function KPIGrid({ kpiMetrics }: KPIGridProps) {
  const kpiData = [
    { 
      key: 'totalBoards', 
      label: 'Total Boards', 
      metric: kpiMetrics.totalBoards,
      gradient: 'from-red-500 to-red-600',
      icon: '📌',
      bgGradient: 'from-red-50 to-red-100'
    },
    { 
      key: 'publicBoards', 
      label: 'Public Boards', 
      metric: kpiMetrics.publicBoards,
      gradient: 'from-blue-500 to-blue-600',
      icon: '🌐',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    { 
      key: 'privateBoards', 
      label: 'Private Boards', 
      metric: kpiMetrics.privateBoards,
      gradient: 'from-orange-500 to-orange-600',
      icon: '🔒',
      bgGradient: 'from-orange-50 to-orange-100'
    },
    { 
      key: 'totalPins', 
      label: 'Total Pins', 
      metric: kpiMetrics.totalPins,
      gradient: 'from-purple-500 to-purple-600',
      icon: '📎',
      bgGradient: 'from-purple-50 to-purple-100'
    },
    { 
      key: 'totalFollowers', 
      label: 'Total Followers', 
      metric: kpiMetrics.totalFollowers,
      gradient: 'from-green-500 to-green-600',
      icon: '👥',
      bgGradient: 'from-green-50 to-green-100'
    },
    { 
      key: 'averagePinsPerBoard', 
      label: 'Avg Pins/Board', 
      metric: kpiMetrics.averagePinsPerBoard,
      gradient: 'from-indigo-500 to-indigo-600',
      icon: '📊',
      bgGradient: 'from-indigo-50 to-indigo-100'
    }
  ]

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {kpiData.map(({ key, label, metric, gradient, icon, bgGradient }) => (
          <KPICard
            key={key}
            label={label}
            metric={metric}
            gradient={gradient}
            icon={icon}
            bgGradient={bgGradient}
          />
        ))}
      </div>
    </div>
  )
}
