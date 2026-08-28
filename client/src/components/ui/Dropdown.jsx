import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check, ChevronRight, Circle } from 'lucide-react'
import { cn } from '@/lib/utils.js'

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuGroup = DropdownMenuPrimitive.Group
const DropdownMenuPortal = DropdownMenuPrimitive.Portal
const DropdownMenuSub = DropdownMenuPrimitive.Sub
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuContent = ({ className, sideOffset = 4, ...props }) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[10rem] overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 p-1 shadow-xl',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
)

const DropdownMenuItem = ({ className, inset, icon: Icon, ...props }) => (
  <DropdownMenuPrimitive.Item
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-300',
      'outline-none transition-colors hover:bg-neutral-800 hover:text-neutral-100',
      'focus:bg-neutral-800 focus:text-neutral-100',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className
    )}
    {...props}
  >
    {Icon && <Icon className="h-4 w-4 text-neutral-500" />}
    {props.children}
  </DropdownMenuPrimitive.Item>
)

const DropdownMenuLabel = ({ className, inset, ...props }) => (
  <DropdownMenuPrimitive.Label
    className={cn('px-2 py-1.5 text-xs font-semibold text-neutral-500', inset && 'pl-8', className)}
    {...props}
  />
)

const DropdownMenuSeparator = ({ className, ...props }) => (
  <DropdownMenuPrimitive.Separator
    className={cn('my-1 h-px bg-neutral-800', className)}
    {...props}
  />
)

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuRadioGroup,
}
