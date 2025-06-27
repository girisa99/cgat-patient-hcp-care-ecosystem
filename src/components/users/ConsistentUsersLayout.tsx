
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ConsistentUsersLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showAlert?: boolean;
  alertMessage?: string;
}

export const ConsistentUsersLayout: React.FC<ConsistentUsersLayoutProps> = ({
  children,
  title = "Users Management (Unified)",
  description = "Manage user accounts, roles, permissions using unified data source",
  showAlert = false,
  alertMessage
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">{title}</h1>
              <p className="text-lg text-gray-600 mt-2">{description}</p>
            </div>
          </div>
          
          {showAlert && alertMessage && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {alertMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
};
