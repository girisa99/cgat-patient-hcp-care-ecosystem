
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  stats?: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
}

/**
 * Reusable page header component for consistent page layouts
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  actions,
  stats
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              {description && (
                <p className="text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          {actions && <div>{actions}</div>}
        </div>
      </CardHeader>
      
      {stats && stats.length > 0 && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${stat.color || 'text-blue-600'}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
