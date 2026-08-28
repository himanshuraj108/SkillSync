import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import { cn } from '@/lib/utils.js'

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = ({ className, children, ...props }) => (
  <SelectPrimitive.Trigger
    className={cn(
      'flex h-9 w-full items-center justify-between rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2',
      'text-sm text-neutral-100 placeholder:text-neutral-500',
      'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-950 focus:border-transparent',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[placeholder]:text-neutral-500',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon>
      <ChevronDown className="h-4 w-4 text-neutral-400" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
)

const SelectContent = ({ className, children, position = 'popper', ...props }) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      className={cn(
        'relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-neutral-700 bg-neutral-900 text-neutral-100 shadow-lg',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        position === 'popper' && 'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.ScrollUpButton className="flex items-center justify-center py-1 text-neutral-400">
        <ChevronUp className="h-4 w-4" />
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className="flex items-center justify-center py-1 text-neutral-400">
        <ChevronDown className="h-4 w-4" />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
)

const SelectLabel = ({ className, ...props }) => (
  <SelectPrimitive.Label
    className={cn('px-2 py-1.5 text-xs font-semibold text-neutral-500', className)}
    {...props}
  />
)

const SelectItem = ({ className, children, ...props }) => (
  <SelectPrimitive.Item
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
      'text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100',
      'focus:bg-neutral-800 focus:text-neutral-100',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-3.5 w-3.5 text-indigo-400" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
)

const SelectSeparator = ({ className, ...props }) => (
  <SelectPrimitive.Separator
    className={cn('mx-1 my-1 h-px bg-neutral-800', className)}
    {...props}
  />
)

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator }
