import React from 'react'
import { cn } from '@/lib/utils'

export interface AcrylicProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: 'light' | 'medium' | 'heavy'
  tintColor?: string
  fallbackColor?: string
  withBorder?: boolean
  children: React.ReactNode
}

export function Acrylic({
  intensity = 'medium',
  tintColor,
  fallbackColor,
  withBorder = true,
  className,
  children,
  style,
  ...props
}: AcrylicProps) {
  const intensityStyles = {
    light: { opacity: 0.7, blur: '16px' },
    medium: { opacity: 0.85, blur: '20px' },
    heavy: { opacity: 0.95, blur: '40px' },
  }

  const { opacity, blur } = intensityStyles[intensity]

  return (
    <div
      className={cn(
        'relative',
        withBorder && 'border border-white/20 dark:border-white/10',
        className
      )}
      style={{
        backgroundColor: fallbackColor || `rgba(255, 255, 255, ${opacity})`,
        ...style,
      }}
      {...props}
    >
      {/* Acrylic blur layer */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backdropFilter: `blur(${blur}) saturate(180%)`,
          WebkitBackdropFilter: `blur(${blur}) saturate(180%)`,
          backgroundColor: tintColor || 'transparent',
        }}
      />
      {children}
    </div>
  )
}

export interface AcrylicCardProps extends AcrylicProps {
  hoverable?: boolean
  elevated?: boolean
}

export function AcrylicCard({
  hoverable = true,
  elevated = false,
  className,
  children,
  ...props
}: AcrylicCardProps) {
  return (
    <Acrylic
      className={cn(
        'rounded-[var(--radius-medium)] overflow-hidden',
        hoverable && 'transition-fluent hover-lift cursor-pointer',
        elevated && 'shadow-depth-8',
        !elevated && 'shadow-rest',
        className
      )}
      {...props}
    >
      {children}
    </Acrylic>
  )
}

export function AcrylicPanel({
  className,
  children,
  ...props
}: AcrylicProps) {
  return (
    <Acrylic
      intensity="medium"
      className={cn(
        'rounded-[var(--radius-large)] shadow-depth-16',
        className
      )}
      {...props}
    >
      {children}
    </Acrylic>
  )
}
