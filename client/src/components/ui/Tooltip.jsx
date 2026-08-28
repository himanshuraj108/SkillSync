import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils.js'

const TooltipProvider = TooltipPrimitive.Provider

function Tooltip({ content, children, side = 'top', align = 'center', delayDuration = 400 }) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={6}
            className={cn(
              'z-50 overflow-hidden rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1.5',
              'text-xs text-neutral-200 shadow-md',
              'animate-in fade-in-0 zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2'
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-neutral-700" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipProvider>
  )
}

export { Tooltip, TooltipProvider }
