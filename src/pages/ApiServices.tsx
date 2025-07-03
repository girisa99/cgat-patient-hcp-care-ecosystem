import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Settings, FileText, TestTube } from 'lucide-react';

const ApiServices: React.FC = () => {
  console.log('🌐 API Services page - Basic implementation loaded');

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">API Services</h1>
        <p className="text-gray-600">Manage API integrations and documentation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* API Registry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              API Registry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage all registered APIs in the system.
            </p>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-muted-foreground">Registered APIs</div>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Access API documentation and integration guides.
            </p>
            <div className="text-2xl font-bold text-green-600">Ready</div>
            <div className="text-sm text-muted-foreground">Documentation System</div>
          </CardContent>
        </Card>

        {/* API Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              API Testing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Test API endpoints and validate responses.
            </p>
            <div className="text-2xl font-bold text-purple-600">Available</div>
            <div className="text-sm text-muted-foreground">Testing Interface</div>
          </CardContent>
        </Card>
      </div>

      {/* Status Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">API Services Under Development</h3>
            <p className="text-blue-800 text-sm">
              The API Services functionality is being rebuilt with improved TypeScript support 
              and better integration. Core healthcare features (Users, Patients, Facilities) 
              remain fully operational.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiServices;