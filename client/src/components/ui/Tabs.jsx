import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils.js'

const Tabs = TabsPrimitive.Root

const TabsList = ({ className, ...props }) => (
  <TabsPrimitive.List
    className={cn(
      'inline-flex items-center gap-1 border-b border-neutral-800 w-full',
      className
    )}
    {...props}
  />
)

const TabsTrigger = ({ className, ...props }) => (
  <TabsPrimitive.Trigger
    className={cn(
      'inline-flex items-center gap-1.5 px-1 pb-2.5 pt-1 text-sm font-medium text-neutral-500',
      'border-b-2 border-transparent transition-colors',
      'hover:text-neutral-300',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:border-indigo-500 data-[state=active]:text-neutral-100',
      className
    )}
    {...props}
  />
)

const TabsContent = ({ className, ...props }) => (
  <TabsPrimitive.Content
    className={cn(
      'mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
      className
    )}
    {...props}
  />
)

export { Tabs, TabsList, TabsTrigger, TabsContent }
