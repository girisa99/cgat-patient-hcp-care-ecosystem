
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Patients = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Patient Management</h2>
        <p className="text-muted-foreground">
          Manage patient records and care coordination
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Patient management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Patients;
