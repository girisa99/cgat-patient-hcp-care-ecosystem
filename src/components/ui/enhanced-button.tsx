
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  variant = 'default',
  size = 'default',
  loading = false,
  loadingText = 'Loading...',
  className,
  disabled,
  children,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={cn(
        // Enhanced focus styles for accessibility
        'focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none',
        // Improved hover effects
        'transition-all duration-200 ease-in-out',
        'hover:scale-105 active:scale-95',
        // Better disabled state
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        className
      )}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      <span className={loading ? 'sr-only' : ''}>
        {loading ? loadingText : children}
      </span>
      {loading && <span aria-live="polite">{loadingText}</span>}
    </Button>
  );
};
