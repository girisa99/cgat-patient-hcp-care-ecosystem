
/**
 * Detected Modules List Component
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DetectedModuleCard } from './DetectedModuleCard';
import { AutoModuleConfig } from '@/utils/schema/types';

interface DetectedModulesListProps {
  modules: AutoModuleConfig[];
  onAutoRegisterAll: () => void;
  onDownloadCode: (module: AutoModuleConfig) => void;
}

export const DetectedModulesList: React.FC<DetectedModulesListProps> = ({
  modules,
  onAutoRegisterAll,
  onDownloadCode
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Detected Modules</CardTitle>
          <Button onClick={onAutoRegisterAll} size="sm">
            Auto-Register All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {modules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No new modules detected. Click "Scan Schema" to check for new tables.
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((module, index) => (
              <DetectedModuleCard
                key={index}
                module={module}
                onDownloadCode={onDownloadCode}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
