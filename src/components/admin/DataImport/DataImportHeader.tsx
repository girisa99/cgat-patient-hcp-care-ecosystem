
import React from 'react';
import { Badge } from '@/components/ui/badge';

export const DataImportHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Real Data Import & Management</h2>
        <p className="text-muted-foreground">
          Import and manage real market data from multiple sources
        </p>
      </div>
      <Badge variant="outline" className="text-sm">
        Live Database Connection
      </Badge>
    </div>
  );
};
