
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  hoverable?: boolean;
  loading?: boolean;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  title,
  description,
  children,
  className,
  variant = 'default',
  hoverable = false,
  loading = false,
}) => {
  const cardVariants = {
    default: 'border bg-card text-card-foreground shadow-sm',
    elevated: 'border bg-card text-card-foreground shadow-lg hover:shadow-xl transition-shadow duration-300',
    outlined: 'border-2 border-primary/20 bg-card/50 text-card-foreground',
    gradient: 'border bg-gradient-to-br from-card to-card/80 text-card-foreground shadow-md'
  };

  const hoverEffects = hoverable 
    ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer' 
    : '';

  if (loading) {
    return (
      <Card className={cn(cardVariants[variant], className)}>
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-3 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        cardVariants[variant],
        hoverEffects,
        'rounded-lg border-0 shadow-md',
        className
      )}
      role={hoverable ? 'button' : undefined}
      tabIndex={hoverable ? 0 : undefined}
    >
      {(title || description) && (
        <CardHeader className="pb-3">
          {title && (
            <CardTitle className="text-lg font-semibold leading-tight">
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
};
