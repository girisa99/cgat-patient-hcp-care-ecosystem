
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingStateProps {
  title: string;
  description: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ title, description }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    </div>
  );
};
