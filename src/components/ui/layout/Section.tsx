
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../card';

interface SectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  variant?: 'default' | 'card' | 'bordered';
  className?: string;
  contentClassName?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  variant = 'default',
  className,
  contentClassName,
}) => {
  const headerContent = (title || subtitle || headerActions) && (
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1">
        {title && (
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {headerActions && (
        <div className="flex items-center gap-2 ml-4">
          {headerActions}
        </div>
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className={cn('', className)}>
        {(title || subtitle || headerActions) && (
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {title && <CardTitle className="text-xl">{title}</CardTitle>}
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
              {headerActions && (
                <div className="flex items-center gap-2 ml-4">
                  {headerActions}
                </div>
              )}
            </div>
          </CardHeader>
        )}
        <CardContent className={cn('', contentClassName)}>
          {children}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'bordered') {
    return (
      <div className={cn('border rounded-lg p-6', className)}>
        {headerContent}
        <div className={cn('', contentClassName)}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('', className)}>
      {headerContent}
      <div className={cn('', contentClassName)}>
        {children}
      </div>
    </div>
  );
};
