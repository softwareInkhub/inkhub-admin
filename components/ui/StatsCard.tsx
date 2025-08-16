'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  children?: ReactNode;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  className,
  children 
}: StatsCardProps) {
  return (
    <div className={cn(
      'card p-6 hover-lift animate-fade-in',
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {Icon && (
              <Icon className="h-5 w-5 text-secondary-500" />
            )}
            <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
              {title}
            </p>
          </div>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
              {value}
            </p>
            {trend && (
              <span className={cn(
                'text-sm font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
