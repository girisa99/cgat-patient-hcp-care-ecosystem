
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Facilities = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Facilities Management</h2>
        <p className="text-muted-foreground">
          Manage healthcare facilities and locations
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Facility management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Facilities;
