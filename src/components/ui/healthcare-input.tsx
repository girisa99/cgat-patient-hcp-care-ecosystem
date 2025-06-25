
import * as React from "react"
import { cn } from "@/lib/utils"

const HealthcareInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm",
          "transition-all duration-200",
          "placeholder:text-slate-500",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:border-blue-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-slate-700 dark:bg-slate-900 dark:placeholder:text-slate-400 dark:focus-visible:ring-blue-400",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
HealthcareInput.displayName = "HealthcareInput"

export { HealthcareInput }
