
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ApiEmptyStateProps {
  title: string;
  type: 'internal' | 'external' | 'published';
  icon: React.ReactNode;
}

export const ApiEmptyState: React.FC<ApiEmptyStateProps> = ({ title, type, icon }) => {
  const getEmptyMessage = () => {
    switch (type) {
      case 'internal':
        return "No internal APIs detected yet.";
      case 'external':
        return "No external APIs configured yet.";
      case 'published':
        return "No APIs published yet.";
      default:
        return "No APIs found.";
    }
  };

  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex justify-center">
            {icon}
          </div>
          <div className="space-y-3">
            <h4 className="text-lg font-medium">No {title}</h4>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              {getEmptyMessage()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
