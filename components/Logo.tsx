'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* Logo Icon */}
      <div className={cn(
        'flex items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105',
        sizeClasses[size]
      )}>
        <span className={cn(
          'font-bold tracking-tight',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}>
          I
        </span>
      </div>
      
      {/* Logo Text */}
      <span className={cn(
        'font-bold tracking-wide text-secondary-900 dark:text-secondary-100',
        size === 'sm' && 'text-sm',
        size === 'md' && 'text-base',
        size === 'lg' && 'text-lg'
      )}>
        INKHUB
      </span>
    </div>
  )
}
