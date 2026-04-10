import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputFluentProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  inputSize?: 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'filled' | 'underline'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  error?: boolean
  errorMessage?: string
}

const InputFluent = React.forwardRef<HTMLInputElement, InputFluentProps>(
  (
    {
      className,
      inputSize = 'md',
      variant = 'outline',
      icon,
      iconPosition = 'left',
      error,
      errorMessage,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-8 px-2.5 text-sm',
      md: 'h-10 px-3 text-sm',
      lg: 'h-12 px-4 text-base',
    }

    const variantClasses = {
      outline: [
        'bg-transparent',
        'border border-[var(--fluent-stroke-rest)]',
        'rounded-[var(--radius-medium)]',
        'hover:border-[var(--fluent-stroke-hover)]',
        'focus:border-[var(--fluent-accent-rest)]',
        'focus:ring-1 focus:ring-[var(--fluent-accent-rest)]/30',
      ],
      filled: [
        'bg-[var(--fluent-fill-secondary)]',
        'border border-transparent',
        'rounded-[var(--radius-medium)]',
        'hover:bg-[var(--fluent-fill-tertiary)]',
        'focus:bg-[var(--fluent-bg-card)]',
        'focus:border-[var(--fluent-accent-rest)]',
      ],
      underline: [
        'bg-transparent',
        'border-0 border-b border-[var(--fluent-stroke-rest)]',
        'rounded-none',
        'hover:border-[var(--fluent-stroke-hover)]',
        'focus:border-[var(--fluent-accent-rest)]',
      ],
    }

    return (
      <div className="w-full">
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fluent-text-tertiary)]">
              {icon}
            </div>
          )}
          <input
            className={cn(
              'w-full',
              'bg-transparent',
              'text-[var(--fluent-text-primary)]',
              'placeholder:text-[var(--fluent-text-tertiary)]',
              'transition-all duration-200 ease-standard',
              'focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              sizeClasses[inputSize],
              variantClasses[variant],
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
              className
            )}
            ref={ref}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fluent-text-tertiary)]">
              {icon}
            </div>
          )}
        </div>
        {error && errorMessage && (
          <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
        )}
      </div>
    )
  }
)
InputFluent.displayName = 'InputFluent'

export { InputFluent }
