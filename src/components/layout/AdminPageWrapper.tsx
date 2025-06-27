
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className
}) => {
  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {trend && (
          <div className={cn(
            "text-xs font-medium mt-1",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend.isPositive ? "↗" : "↘"} {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface AdminStatsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export const AdminStatsGrid: React.FC<AdminStatsGridProps> = ({
  children,
  columns = 4,
  className
}) => {
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
  };

  return (
    <div className={cn(
      'grid gap-4',
      gridClasses[columns],
      className
    )}>
      {children}
    </div>
  );
};

interface AdminPageWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  className?: string;
  showStats?: boolean;
  statsContent?: ReactNode;
  contentPadding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'contained' | 'full-width';
}

export const AdminPageWrapper: React.FC<AdminPageWrapperProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  className,
  showStats = false,
  statsContent,
  contentPadding = 'md',
  variant = 'default'
}) => {
  const paddingClasses = {
    none: 'px-6 py-4', // Minimal padding even for "none"
    sm: 'px-6 py-4',
    md: 'px-6 py-6',
    lg: 'px-8 py-8'
  };

  const containerClasses = {
    default: 'space-y-6',
    contained: 'space-y-6 max-w-7xl mx-auto',
    'full-width': 'space-y-6 w-full'
  };

  return (
    <div className={cn(containerClasses[variant], paddingClasses[contentPadding], className)}>
      {/* Page Header */}
      {(title || subtitle || headerActions) && (
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1 min-w-0">
            {title && (
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-base text-muted-foreground max-w-3xl">
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Stats Section */}
      {showStats && statsContent && (
        <div className="w-full">
          {statsContent}
        </div>
      )}

      {/* Main Content */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};
