import * as React from "react"

type ToastProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactElement
  variant?: 'default' | 'destructive'
  duration?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

type ToastActionElement = React.ReactElement

export type {
  ToastProps,
  ToastActionElement,
}