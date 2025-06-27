
import React from 'react';
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
  title = "User Management",
  description = "Manage user accounts and permissions",
  showAlert = false,
  alertMessage
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section - Left Aligned */}
        <div className="mb-8 text-left">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">{title}</h1>
          <p className="text-lg text-gray-600">{description}</p>
          
          {showAlert && alertMessage && (
            <Alert className="mt-6 bg-blue-50 border-blue-200">
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
