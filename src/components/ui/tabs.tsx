import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    level?: 'parent' | 'child'
  }
>(({ className, level = 'parent', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      level === 'parent' 
        ? "flex items-center justify-start flex-nowrap gap-3 md:gap-5 lg:gap-6 p-4 md:p-6 bg-gradient-to-r from-background via-muted/20 to-background border-b-2 border-primary/10 overflow-x-auto scrollbar-hide min-h-[64px] md:min-h-[80px] shadow-sm"
        : "flex items-center justify-start flex-nowrap gap-2.5 md:gap-3.5 p-3 md:p-4 bg-gradient-to-r from-muted/30 to-muted/10 border border-border/30 rounded-lg overflow-x-auto scrollbar-hide backdrop-blur-sm",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    level?: 'parent' | 'child'
  }
>(({ className, level = 'parent', ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      level === 'parent'
        ? "flex items-center gap-2.5 md:gap-3 px-5 md:px-7 lg:px-8 py-3 md:py-3.5 text-sm md:text-base font-semibold rounded-xl transition-all duration-300 ease-in-out hover:bg-muted/60 hover:scale-105 border-2 border-transparent ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary/30 data-[state=active]:shadow-lg data-[state=active]:scale-110 min-w-fit backdrop-blur-sm"
        : "flex items-center gap-2 md:gap-2.5 px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-medium text-foreground rounded-lg transition-all duration-200 hover:bg-background/60 hover:scale-105 border border-transparent ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary/20 data-[state=active]:shadow-md data-[state=active]:scale-105 min-w-fit",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    level?: 'parent' | 'child'
  }
>(({ className, level = 'parent', ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      level === 'parent'
        ? "mt-8 p-8 bg-gradient-to-br from-background to-muted/5 rounded-2xl border border-border/40 shadow-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-in"
        : "mt-6 p-6 bg-gradient-to-br from-background to-muted/5 rounded-lg border border-border/30 shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-in",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }