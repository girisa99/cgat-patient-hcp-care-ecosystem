import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  console.log('❌ Not Found page rendering');

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Page Not Found</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>404 - Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>The page you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Go back to dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;