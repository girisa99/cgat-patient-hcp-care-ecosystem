import React, { useState } from 'react';
import { ApiSummary } from '@/types/api';
import ExternalApiConfigDialog from './ExternalApiConfigDialog';
import ExternalApiAnalyticsDialog from './ExternalApiAnalyticsDialog';

export const useApiDialogManager = () => {
  const [showConfigDialog, setShowConfigDialog] = useState<boolean>(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState<boolean>(false);
  const [configApi, setConfigApi] = useState<ApiSummary | null>(null);
  const [analyticsApi, setAnalyticsApi] = useState<ApiSummary | null>(null);

  const handleConfigureApi = (api: ApiSummary) => {
    setConfigApi(api);
    setShowConfigDialog(true);
  };

  const handleViewAnalytics = (api: ApiSummary) => {
    setAnalyticsApi(api);
    setShowAnalyticsDialog(true);
  };

  const ApiDialogs = () => (
    <>
      <ExternalApiConfigDialog
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
        api={configApi}
      />
      <ExternalApiAnalyticsDialog
        open={showAnalyticsDialog}
        onOpenChange={setShowAnalyticsDialog}
        api={analyticsApi}
      />
    </>
  );

  return {
    handleConfigureApi,
    handleViewAnalytics,
    ApiDialogs
  };
};
