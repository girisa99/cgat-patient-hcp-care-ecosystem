import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SimpleModules: React.FC = () => {
  console.log('📦 Simple Modules page rendering');

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Modules Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Modules management functionality available here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleModules;