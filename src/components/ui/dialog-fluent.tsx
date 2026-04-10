'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { Acrylic } from './acrylic'

const DialogFluent = DialogPrimitive.Root

const DialogFluentTrigger = DialogPrimitive.Trigger

const DialogFluentPortal = DialogPrimitive.Portal

const DialogFluentClose = DialogPrimitive.Close

const DialogFluentOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50',
      'bg-black/40 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))
DialogFluentOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogFluentContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    acrylic?: boolean
  }
>(({ className, size = 'md', acrylic = true, children, ...props }, ref) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  }

  return (
    <DialogFluentPortal>
      <DialogFluentOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
          'w-full',
          sizeClasses[size],
          'duration-200 ease-spring',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          className
        )}
        {...props}
      >
        <Acrylic
          intensity="heavy"
          className={cn(
            'rounded-[var(--radius-large)]',
            'shadow-dialog',
            'overflow-hidden'
          )}
        >
          {children}
        </Acrylic>
      </DialogPrimitive.Content>
    </DialogFluentPortal>
  )
})
DialogFluentContent.displayName = DialogPrimitive.Content.displayName

const DialogFluentHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5',
      'px-6 py-4',
      'border-b border-[var(--fluent-stroke-rest)]',
      className
    )}
    {...props}
  />
)
DialogFluentHeader.displayName = 'DialogFluentHeader'

const DialogFluentFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      'px-6 py-4',
      'border-t border-[var(--fluent-stroke-rest)]',
      'bg-[var(--fluent-fill-subtle)]',
      className
    )}
    {...props}
  />
)
DialogFluentFooter.displayName = 'DialogFluentFooter'

const DialogFluentTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      'text-[var(--fluent-text-primary)]',
      className
    )}
    {...props}
  />
))
DialogFluentTitle.displayName = DialogPrimitive.Title.displayName

const DialogFluentDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-[var(--fluent-text-secondary)]', className)}
    {...props}
  />
))
DialogFluentDescription.displayName = DialogPrimitive.Description.displayName

export {
  DialogFluent,
  DialogFluentPortal,
  DialogFluentOverlay,
  DialogFluentClose,
  DialogFluentTrigger,
  DialogFluentContent,
  DialogFluentHeader,
  DialogFluentFooter,
  DialogFluentTitle,
  DialogFluentDescription,
}
