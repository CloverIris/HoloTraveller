import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonFluentVariants = cva(
  [
    'inline-flex items-center justify-center',
    'whitespace-nowrap',
    'text-sm font-medium',
    'transition-all duration-200 ease-standard',
    'focus-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    'rounded-[var(--radius-medium)]',
    'press-effect',
  ],
  {
    variants: {
      variant: {
        subtle: [
          'bg-transparent',
          'text-[var(--fluent-text-primary)]',
          'hover:bg-[var(--fluent-fill-hover)]',
          'active:bg-[var(--fluent-fill-active)]',
        ],
        primary: [
          'bg-[var(--fluent-accent-rest)]',
          'text-white',
          'hover:bg-[var(--fluent-accent-hover)]',
          'active:bg-[var(--fluent-accent-active)]',
          'shadow-depth-4',
          'hover:shadow-depth-8',
        ],
        secondary: [
          'bg-[var(--fluent-fill-secondary)]',
          'text-[var(--fluent-text-primary)]',
          'hover:bg-[var(--fluent-fill-tertiary)]',
          'active:bg-[var(--fluent-fill-hover)]',
        ],
        outline: [
          'bg-transparent',
          'border border-[var(--fluent-stroke-rest)]',
          'text-[var(--fluent-text-primary)]',
          'hover:bg-[var(--fluent-fill-hover)]',
          'hover:border-[var(--fluent-stroke-hover)]',
          'active:bg-[var(--fluent-fill-active)]',
        ],
        ghost: [
          'bg-transparent',
          'text-[var(--fluent-text-secondary)]',
          'hover:bg-[var(--fluent-fill-hover)]',
          'hover:text-[var(--fluent-text-primary)]',
          'active:bg-[var(--fluent-fill-active)]',
        ],
        accent: [
          'bg-[var(--fluent-accent-rest)]/10',
          'text-[var(--fluent-accent-rest)]',
          'hover:bg-[var(--fluent-accent-rest)]/15',
          'active:bg-[var(--fluent-accent-rest)]/20',
        ],
      },
      size: {
        sm: 'h-7 px-2.5 text-xs gap-1',
        md: 'h-9 px-4 text-sm gap-1.5',
        lg: 'h-11 px-6 text-base gap-2',
        icon: 'h-9 w-9',
        'icon-sm': 'h-7 w-7',
        'icon-lg': 'h-11 w-11',
      },
      shape: {
        default: 'rounded-[var(--radius-medium)]',
        pill: 'rounded-full',
        square: 'rounded-[var(--radius-small)]',
      },
    },
    defaultVariants: {
      variant: 'subtle',
      size: 'md',
      shape: 'default',
    },
  }
)

export interface ButtonFluentProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonFluentVariants> {
  asChild?: boolean
  loading?: boolean
}

const ButtonFluent = React.forwardRef<HTMLButtonElement, ButtonFluentProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonFluentVariants({ variant, size, shape, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </Comp>
    )
  }
)
ButtonFluent.displayName = 'ButtonFluent'

export { ButtonFluent, buttonFluentVariants }
