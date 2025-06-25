
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const healthcareButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 shadow-sm hover:shadow-md",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-500 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700",
        success: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 shadow-sm hover:shadow-md",
        warning: "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500 shadow-sm hover:shadow-md",
        danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm hover:shadow-md",
        outline: "border border-slate-300 bg-transparent text-slate-900 hover:bg-slate-50 focus-visible:ring-slate-500 dark:border-slate-700 dark:text-slate-50 dark:hover:bg-slate-800",
        ghost: "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-500 dark:text-slate-300 dark:hover:bg-slate-800",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface HealthcareButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof healthcareButtonVariants> {
  asChild?: boolean
}

const HealthcareButton = React.forwardRef<HTMLButtonElement, HealthcareButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(healthcareButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
HealthcareButton.displayName = "HealthcareButton"

export { HealthcareButton, healthcareButtonVariants }
