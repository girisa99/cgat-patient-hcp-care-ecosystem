
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'error' | string;
  children?: React.ReactNode;
}

/**
 * Reusable status badge component for consistent status display
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  const getVariant = () => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getColor = () => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return '';
    }
  };

  return (
    <Badge variant={getVariant()} className={getColor()}>
      {children || status}
    </Badge>
  );
};
