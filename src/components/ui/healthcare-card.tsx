
import * as React from "react"
import { cn } from "@/lib/utils"

const HealthcareCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm",
      "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50",
      "transition-all duration-200 hover:shadow-md",
      className
    )}
    {...props}
  />
))
HealthcareCard.displayName = "HealthcareCard"

const HealthcareCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6 pb-4",
      "border-b border-slate-100 dark:border-slate-800",
      className
    )}
    {...props}
  />
))
HealthcareCardHeader.displayName = "HealthcareCardHeader"

const HealthcareCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-50",
      className
    )}
    {...props}
  />
))
HealthcareCardTitle.displayName = "HealthcareCardTitle"

const HealthcareCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-slate-600 dark:text-slate-400 leading-relaxed",
      className
    )}
    {...props}
  />
))
HealthcareCardDescription.displayName = "HealthcareCardDescription"

const HealthcareCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-4", className)} {...props} />
))
HealthcareCardContent.displayName = "HealthcareCardContent"

export { 
  HealthcareCard, 
  HealthcareCardHeader, 
  HealthcareCardTitle, 
  HealthcareCardDescription, 
  HealthcareCardContent 
}
