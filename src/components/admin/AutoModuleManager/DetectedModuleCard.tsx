
/**
 * Detected Module Card Component
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Eye, AlertTriangle, Download } from 'lucide-react';
import { AutoModuleConfig } from '@/utils/schema/types';

interface DetectedModuleCardProps {
  module: AutoModuleConfig;
  onDownloadCode: (module: AutoModuleConfig) => void;
}

export const DetectedModuleCard: React.FC<DetectedModuleCardProps> = ({
  module,
  onDownloadCode
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <Check className="w-4 h-4" />;
    if (confidence >= 0.6) return <Eye className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{module.moduleName}</h3>
          <p className="text-sm text-gray-600">Table: {module.tableName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getConfidenceColor(module.confidence)}>
            {getConfidenceIcon(module.confidence)}
            {Math.round(module.confidence * 100)}%
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownloadCode(module)}
          >
            <Download className="w-4 h-4 mr-1" />
            Download Code
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm mt-3">
        <div>
          <span className="font-medium">Required Fields:</span>
          <div className="mt-1">
            {module.requiredFields.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {module.requiredFields.map(field => (
                  <Badge key={field} variant="secondary" className="text-xs">
                    {field}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-gray-500">None</span>
            )}
          </div>
        </div>
        <div>
          <span className="font-medium">Optional Fields:</span>
          <div className="mt-1">
            {module.optionalFields && module.optionalFields.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {module.optionalFields.map(field => (
                  <Badge key={field} variant="outline" className="text-xs">
                    {field}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-gray-500">None</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
