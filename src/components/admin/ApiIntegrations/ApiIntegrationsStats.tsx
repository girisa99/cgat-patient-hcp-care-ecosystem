
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ApiIntegrationsStatsProps {
  totalIntegrations: number;
  internalApis: number;
  externalApis: number;
  publishedApis: number;
}

export const ApiIntegrationsStats: React.FC<ApiIntegrationsStatsProps> = ({
  totalIntegrations,
  internalApis,
  externalApis,
  publishedApis
}) => {
  return (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="outline">{totalIntegrations} Total</Badge>
      <Badge variant="default">{internalApis} Internal</Badge>
      <Badge variant="secondary">{externalApis} External</Badge>
      <Badge variant="outline">{publishedApis} Published</Badge>
    </div>
  );
};
