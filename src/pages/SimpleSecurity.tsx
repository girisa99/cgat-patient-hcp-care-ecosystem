import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SimpleSecurity: React.FC = () => {
  console.log('🔒 Simple Security page rendering');

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Security Dashboard</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Security monitoring and management functionality available here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleSecurity;