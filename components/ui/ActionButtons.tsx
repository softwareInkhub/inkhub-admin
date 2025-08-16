'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonProps {
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  className?: string;
}

interface ActionButtonsProps {
  buttons: ActionButtonProps[];
  className?: string;
  children?: ReactNode;
}

export function ActionButtons({ buttons, className, children }: ActionButtonsProps) {
  const getButtonClasses = (variant: string = 'secondary', disabled: boolean = false) => {
    const baseClasses = 'inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover-lift';
    
    if (disabled) {
      return cn(baseClasses, 'opacity-50 cursor-not-allowed');
    }

    switch (variant) {
      case 'primary':
        return cn(baseClasses, 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500');
      case 'danger':
        return cn(baseClasses, 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500');
      case 'success':
        return cn(baseClasses, 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500');
      default:
        return cn(baseClasses, 'bg-white text-secondary-700 border border-secondary-300 hover:bg-secondary-50 focus:ring-2 focus:ring-secondary-500 dark:bg-secondary-800 dark:text-secondary-200 dark:border-secondary-600 dark:hover:bg-secondary-700');
    }
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {buttons.map((button, index) => {
        const Icon = button.icon;
        return (
          <button
            key={index}
            onClick={button.onClick}
            disabled={button.disabled}
            className={getButtonClasses(button.variant, button.disabled)}
          >
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {button.label}
          </button>
        );
      })}
      {children}
    </div>
  );
}

// Individual action button component
export function ActionButton({ 
  icon: Icon, 
  label, 
  onClick, 
  variant = 'secondary', 
  disabled = false, 
  className 
}: ActionButtonProps) {
  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover-lift';
    
    if (disabled) {
      return cn(baseClasses, 'opacity-50 cursor-not-allowed');
    }

    switch (variant) {
      case 'primary':
        return cn(baseClasses, 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500');
      case 'danger':
        return cn(baseClasses, 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500');
      case 'success':
        return cn(baseClasses, 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500');
      default:
        return cn(baseClasses, 'bg-white text-secondary-700 border border-secondary-300 hover:bg-secondary-50 focus:ring-2 focus:ring-secondary-500 dark:bg-secondary-800 dark:text-secondary-200 dark:border-secondary-600 dark:hover:bg-secondary-700');
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(getButtonClasses(), className)}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {label}
    </button>
  );
}
