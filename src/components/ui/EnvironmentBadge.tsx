/**
 * Environment Badge Component
 * Displays current environment indicator (hidden in production)
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { environmentService } from '@/services/environmentService';
import { cn } from '@/lib/utils';

interface EnvironmentBadgeProps {
  className?: string;
  position?: 'fixed' | 'inline';
}

export const EnvironmentBadge: React.FC<EnvironmentBadgeProps> = ({ 
  className,
  position = 'inline' 
}) => {
  const { label, color, show } = environmentService.getEnvironmentBadge();
  
  if (!show) {
    return null;
  }

  const baseClasses = cn(
    'text-white text-xs font-bold tracking-wider shadow-lg',
    color,
    position === 'fixed' && 'fixed bottom-4 right-4 z-[9999]',
    className
  );

  return (
    <Badge className={baseClasses}>
      {label}
    </Badge>
  );
};

export default EnvironmentBadge;
