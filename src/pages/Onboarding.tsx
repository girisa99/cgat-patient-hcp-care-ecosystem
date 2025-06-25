
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Onboarding = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Onboarding Management</h2>
        <p className="text-muted-foreground">
          Manage user and facility onboarding processes
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Onboarding management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
