import * as React from 'react'
import { cn } from '@/lib/utils'

const CardFluent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    elevated?: boolean
    interactive?: boolean
    acrylic?: boolean
  }
>(({ className, elevated = false, interactive = false, acrylic = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-[var(--radius-medium)]',
      'bg-[var(--fluent-bg-card)]',
      'border border-[var(--fluent-stroke-card)]',
      elevated && 'shadow-depth-8',
      !elevated && 'shadow-rest',
      interactive && 'transition-fluent hover-lift cursor-pointer',
      acrylic && 'acrylic',
      className
    )}
    {...props}
  />
))
CardFluent.displayName = 'CardFluent'

const CardFluentHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5 p-4',
      'border-b border-[var(--fluent-stroke-rest)]',
      className
    )}
    {...props}
  />
))
CardFluentHeader.displayName = 'CardFluentHeader'

const CardFluentTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-base font-semibold leading-none tracking-tight',
      'text-[var(--fluent-text-primary)]',
      className
    )}
    {...props}
  />
))
CardFluentTitle.displayName = 'CardFluentTitle'

const CardFluentDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-[var(--fluent-text-secondary)]', className)}
    {...props}
  />
))
CardFluentDescription.displayName = 'CardFluentDescription'

const CardFluentContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-4', className)} {...props} />
))
CardFluentContent.displayName = 'CardFluentContent'

const CardFluentFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center p-4 pt-0',
      'text-[var(--fluent-text-tertiary)]',
      className
    )}
    {...props}
  />
))
CardFluentFooter.displayName = 'CardFluentFooter'

export {
  CardFluent,
  CardFluentHeader,
  CardFluentTitle,
  CardFluentDescription,
  CardFluentContent,
  CardFluentFooter,
}
