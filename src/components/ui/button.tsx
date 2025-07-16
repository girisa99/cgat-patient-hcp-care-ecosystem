import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning' | 'info'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs'
  asChild?: boolean
  loading?: boolean
  icon?: React.ComponentType<{ className?: string }>
  iconPosition?: 'left' | 'right'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, loading = false, icon: Icon, iconPosition = 'left', children, disabled, ...props }, ref) => {
    const variantClasses = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
      // Enhanced variants for better consolidation
      success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
      warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
      info: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
    };

    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
      xs: "h-8 rounded px-2 text-xs" // Additional compact size
    };

    const isDisabled = disabled || loading;

    const buttonContent = (
      <>
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {Icon && !loading && iconPosition === 'left' && (
          <Icon className={children ? "h-4 w-4 mr-2" : "h-4 w-4"} />
        )}
        {children}
        {Icon && !loading && iconPosition === 'right' && (
          <Icon className={children ? "h-4 w-4 ml-2" : "h-4 w-4"} />
        )}
      </>
    );

    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    const allClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`;

    if (asChild) {
      return (
        <div ref={ref as any} className={allClasses} {...props as any}>
          {buttonContent}
        </div>
      );
    }

    return (
      <button
        className={allClasses}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {buttonContent}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }