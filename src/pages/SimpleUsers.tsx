import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SimpleUsers: React.FC = () => {
  console.log('👥 Simple Users page rendering');

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User management functionality available here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleUsers;