
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowDownCircle, ArrowUpCircle, Server } from 'lucide-react';

interface ApiIntegrationDirectionIndicatorProps {
  type: 'internal' | 'external';
  isPublished?: boolean;
  className?: string;
}

const ApiIntegrationDirectionIndicator: React.FC<ApiIntegrationDirectionIndicatorProps> = ({
  type,
  isPublished = false,
  className = ""
}) => {
  if (type === 'external') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <ArrowDownCircle className="h-4 w-4 text-green-500" />
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Consuming
        </Badge>
      </div>
    );
  }

  if (type === 'internal' && isPublished) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <ArrowUpCircle className="h-4 w-4 text-blue-500" />
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Publishing
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Server className="h-4 w-4 text-gray-500" />
      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
        Internal
      </Badge>
    </div>
  );
};

export default ApiIntegrationDirectionIndicator;
