import { KPIMetric } from '../types';
import { 
  Palette, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Eye, 
  Download,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface KPICardProps {
  label: string;
  metric: KPIMetric;
  gradient: string;
  icon: string;
  backgroundGradient?: string;
}

const iconMap = {
  Palette,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Download
};

export const KPICard = ({ label, metric, gradient, icon, backgroundGradient }: KPICardProps) => {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Palette;
  
  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${backgroundGradient || ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{formatValue(metric.value)}</p>
          <div className="flex items-center mt-2">
            {metric.changeType === 'increase' ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">from last month</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient}`}>
          <IconComponent className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};
