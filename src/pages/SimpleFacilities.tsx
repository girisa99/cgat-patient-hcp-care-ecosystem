import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SimpleFacilities: React.FC = () => {
  console.log('🏢 Simple Facilities page rendering');

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Facilities Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Facilities management functionality available here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleFacilities;