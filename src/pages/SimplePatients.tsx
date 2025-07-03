import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SimplePatients: React.FC = () => {
  console.log('🏥 Simple Patients page rendering');

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Patient Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Patient management functionality available here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplePatients;