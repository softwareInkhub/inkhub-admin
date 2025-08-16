'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  className 
}: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-6 animate-fade-in', className)}>
      <div className="flex items-center space-x-3">
        {Icon && (
          <div className="p-2 bg-primary-100 rounded-lg">
            <Icon className="h-6 w-6 text-primary-600" />
          </div>
        )}
        <div>
          <h1 className={cn('text-2xl font-bold gradient-text')}>
            {title}
          </h1>
          {description && (
            <p className="text-secondary-600 dark:text-secondary-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center space-x-2">
          {children}
        </div>
      )}
    </div>
  );
}
