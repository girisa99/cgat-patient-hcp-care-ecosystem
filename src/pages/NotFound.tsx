import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NotFound: React.FC = () => {
  console.log('❌ Not Found page rendering');

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Page Not Found</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>404 - Page Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The page you're looking for doesn't exist.</p>
          <a href="/" className="text-blue-600 hover:underline">Go back to dashboard</a>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;