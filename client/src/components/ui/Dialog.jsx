import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils.js'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = ({ className, ...props }) => (
  <DialogPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
)

const DialogContent = ({ className, children, showClose = true, ...props }) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
        'rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2',
        'data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]',
        'focus:outline-none',
        className
      )}
      {...props}
    >
      {children}
      {showClose && (
        <DialogClose className="absolute right-4 top-4 rounded-md p-1 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
)

const DialogHeader = ({ className, ...props }) => (
  <div className={cn('mb-4 flex flex-col gap-1.5', className)} {...props} />
)

const DialogTitle = ({ className, ...props }) => (
  <DialogPrimitive.Title
    className={cn('text-base font-semibold text-neutral-100', className)}
    {...props}
  />
)

const DialogDescription = ({ className, ...props }) => (
  <DialogPrimitive.Description
    className={cn('text-sm text-neutral-400', className)}
    {...props}
  />
)

const DialogFooter = ({ className, ...props }) => (
  <div className={cn('mt-6 flex justify-end gap-3', className)} {...props} />
)

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose }
