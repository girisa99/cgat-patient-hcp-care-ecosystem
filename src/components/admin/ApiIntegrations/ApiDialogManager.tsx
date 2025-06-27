
import React, { useState } from 'react';
import ExternalApiConfigDialog from './ExternalApiConfigDialog';
import ExternalApiAnalyticsDialog from './ExternalApiAnalyticsDialog';

export const useApiDialogManager = () => {
  const [showConfigDialog, setShowConfigDialog] = useState<boolean>(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState<boolean>(false);
  const [configApi, setConfigApi] = useState<any>(null);
  const [analyticsApi, setAnalyticsApi] = useState<any>(null);

  const handleConfigureApi = (api: any) => {
    setConfigApi(api);
    setShowConfigDialog(true);
  };

  const handleViewAnalytics = (api: any) => {
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
