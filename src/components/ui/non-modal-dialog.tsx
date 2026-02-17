import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

// Non-modal dialog variant: does not block page interaction and has no blur overlay

export const NonModalDialogRoot = ({ modal = false, ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) => (
  // Ensure modal is false by default
  <DialogPrimitive.Root modal={false} {...props} />
)

export const NonModalDialogTrigger = DialogPrimitive.Trigger
export const NonModalDialogPortal = DialogPrimitive.Portal
export const NonModalDialogClose = DialogPrimitive.Close

export const NonModalDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    // Transparent, no blur, let clicks pass through to page
    className={cn("fixed inset-0 z-40 bg-transparent pointer-events-none", className)}
    {...props}
  />
))
NonModalDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

export const NonModalDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <NonModalDialogPortal>
    <NonModalDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-[101] grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </NonModalDialogPortal>
))
NonModalDialogContent.displayName = DialogPrimitive.Content.displayName
