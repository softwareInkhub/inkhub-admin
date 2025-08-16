import { KPIMetrics } from '../types';
import { KPICard } from './KPICard';

interface KPIGridProps {
  metrics: KPIMetrics;
}

export const KPIGrid = ({ metrics }: KPIGridProps) => {
  const kpiData = [
    {
      label: 'Total Designs',
      metric: metrics.totalDesigns,
      gradient: 'from-blue-500 to-blue-600',
      icon: 'Palette'
    },
    {
      label: 'Completed',
      metric: metrics.completedDesigns,
      gradient: 'from-green-500 to-green-600',
      icon: 'CheckCircle'
    },
    {
      label: 'In Progress',
      metric: metrics.inProgressDesigns,
      gradient: 'from-yellow-500 to-yellow-600',
      icon: 'Clock'
    },
    {
      label: 'Total Value',
      metric: metrics.totalValue,
      gradient: 'from-purple-500 to-purple-600',
      icon: 'DollarSign'
    },
    {
      label: 'Total Views',
      metric: metrics.totalViews,
      gradient: 'from-indigo-500 to-indigo-600',
      icon: 'Eye'
    },
    {
      label: 'Total Downloads',
      metric: metrics.totalDownloads,
      gradient: 'from-pink-500 to-pink-600',
      icon: 'Download'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 p-6">
      {kpiData.map((kpi, index) => (
        <KPICard
          key={index}
          label={kpi.label}
          metric={kpi.metric}
          gradient={kpi.gradient}
          icon={kpi.icon}
        />
      ))}
    </div>
  );
};
