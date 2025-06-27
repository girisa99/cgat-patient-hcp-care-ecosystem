
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ApiIntegrationsStatsProps {
  integrations: any[];
  internalApis: any[];
  externalApis: any[];
  publishedApis: any[];
}

export const ApiIntegrationsStats: React.FC<ApiIntegrationsStatsProps> = ({
  integrations,
  internalApis,
  externalApis,
  publishedApis
}) => {
  return (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="outline">{integrations?.length || 0} Total</Badge>
      <Badge variant="default">{internalApis?.length || 0} Internal</Badge>
      <Badge variant="secondary">{externalApis?.length || 0} External</Badge>
      <Badge variant="outline">{publishedApis?.length || 0} Published</Badge>
    </div>
  );
};
