'use client'

import KPICard from './KPICard'

interface KPIMetric {
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
}

interface KPIGridProps {
  kpiMetrics: {
    totalPins: KPIMetric
    imagePins: KPIMetric
    videoPins: KPIMetric
    articlePins: KPIMetric
    totalLikes: KPIMetric
    totalComments: KPIMetric
    totalRepins: KPIMetric
    averageEngagement: KPIMetric
  }
}

export default function KPIGrid({ kpiMetrics }: KPIGridProps) {
  const kpiData = [
    { 
      key: 'totalPins', 
      label: 'Total Pins', 
      metric: kpiMetrics.totalPins,
      gradient: 'from-red-500 to-red-600',
      icon: '📌',
      bgGradient: 'from-red-50 to-red-100'
    },
    { 
      key: 'imagePins', 
      label: 'Image Pins', 
      metric: kpiMetrics.imagePins,
      gradient: 'from-blue-500 to-blue-600',
      icon: '🖼️',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    { 
      key: 'videoPins', 
      label: 'Video Pins', 
      metric: kpiMetrics.videoPins,
      gradient: 'from-purple-500 to-purple-600',
      icon: '🎥',
      bgGradient: 'from-purple-50 to-purple-100'
    },
    { 
      key: 'articlePins', 
      label: 'Article Pins', 
      metric: kpiMetrics.articlePins,
      gradient: 'from-orange-500 to-orange-600',
      icon: '📄',
      bgGradient: 'from-orange-50 to-orange-100'
    },
    { 
      key: 'totalLikes', 
      label: 'Total Likes', 
      metric: kpiMetrics.totalLikes,
      gradient: 'from-pink-500 to-pink-600',
      icon: '❤️',
      bgGradient: 'from-pink-50 to-pink-100'
    },
    { 
      key: 'totalComments', 
      label: 'Total Comments', 
      metric: kpiMetrics.totalComments,
      gradient: 'from-green-500 to-green-600',
      icon: '💬',
      bgGradient: 'from-green-50 to-green-100'
    },
    { 
      key: 'totalRepins', 
      label: 'Total Repins', 
      metric: kpiMetrics.totalRepins,
      gradient: 'from-indigo-500 to-indigo-600',
      icon: '🔄',
      bgGradient: 'from-indigo-50 to-indigo-100'
    },
    { 
      key: 'averageEngagement', 
      label: 'Avg Engagement', 
      metric: kpiMetrics.averageEngagement,
      gradient: 'from-yellow-500 to-yellow-600',
      icon: '📊',
      bgGradient: 'from-yellow-50 to-yellow-100'
    }
  ]

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
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
