'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ 
  status, 
  variant = 'default', 
  size = 'md',
  className 
}: StatusBadgeProps) {
  const getStatusClasses = () => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (variant) {
      case 'success':
        return cn(baseClasses, 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200');
      case 'warning':
        return cn(baseClasses, 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200');
      case 'danger':
        return cn(baseClasses, 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200');
      case 'info':
        return cn(baseClasses, 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200');
      default:
        return cn(baseClasses, 'bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-200');
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-3 py-1 text-sm';
      default:
        return 'px-2.5 py-0.5 text-xs';
    }
  };

  // Auto-detect variant based on status if not explicitly provided
  const getAutoVariant = () => {
    if (variant !== 'default') return variant;
    
    const statusLower = status.toLowerCase();
    if (['completed', 'approved', 'active', 'success', 'done'].includes(statusLower)) {
      return 'success';
    }
    if (['pending', 'in_progress', 'processing', 'warning'].includes(statusLower)) {
      return 'warning';
    }
    if (['rejected', 'failed', 'error', 'cancelled', 'suspended'].includes(statusLower)) {
      return 'danger';
    }
    if (['info', 'information', 'note'].includes(statusLower)) {
      return 'info';
    }
    return 'default';
  };

  return (
    <span className={cn(
      getStatusClasses(),
      getSizeClasses(),
      className
    )}>
      {status}
    </span>
  );
}

// Predefined status badges for common use cases
export function CompletedBadge({ className }: { className?: string }) {
  return <StatusBadge status="Completed" variant="success" className={className} />;
}

export function PendingBadge({ className }: { className?: string }) {
  return <StatusBadge status="Pending" variant="warning" className={className} />;
}

export function RejectedBadge({ className }: { className?: string }) {
  return <StatusBadge status="Rejected" variant="danger" className={className} />;
}

export function InProgressBadge({ className }: { className?: string }) {
  return <StatusBadge status="In Progress" variant="warning" className={className} />;
}

export function ActiveBadge({ className }: { className?: string }) {
  return <StatusBadge status="Active" variant="success" className={className} />;
}

export function SuspendedBadge({ className }: { className?: string }) {
  return <StatusBadge status="Suspended" variant="danger" className={className} />;
}
