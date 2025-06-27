
import React from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Settings = () => {
  return (
    <StandardizedDashboardLayout
      showPageHeader={true}
      pageTitle="Settings"
      pageSubtitle="Configure system settings and preferences"
    >
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Settings functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </StandardizedDashboardLayout>
  );
};

export default Settings;
