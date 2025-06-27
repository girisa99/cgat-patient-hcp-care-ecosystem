
import React from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Onboarding = () => {
  return (
    <StandardizedDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Onboarding</h1>
          <p className="text-muted-foreground">
            Manage user onboarding processes and workflows
          </p>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Onboarding management will be available here.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardizedDashboardLayout>
  );
};

export default Onboarding;
