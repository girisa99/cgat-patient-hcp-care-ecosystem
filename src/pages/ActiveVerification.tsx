
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, CheckCircle, AlertTriangle, RefreshCw,
  AlertCircle, Activity
} from "lucide-react";
import { useMasterAuth } from '@/hooks/useMasterAuth';
import AppLayout from '@/components/layout/AppLayout';
import { getErrorMessage } from '@/utils/errorHandling';

const ActiveVerification = () => {
  const { user: authUser, userRoles, isAuthenticated } = useMasterAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleRefresh = () => {
    console.log('🔄 Refreshing verification data...');
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  if (!isAuthenticated) {
    return (
      <AppLayout title="Active Verification">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 shadow-sm bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Authentication Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700">
                You need to be logged in to view verification data.
              </p>
            </CardContent>
           </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Active Verification">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Active Verification
              </h1>
              <p className="text-lg text-gray-600">
                System verification and compliance monitoring
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-0 shadow-sm bg-red-50 border-red-200 mb-6">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Verification Error</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{getErrorMessage(error)}</p>
              <Button onClick={handleRefresh} className="mt-4" variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Verified</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Active</div>
              <p className="text-xs text-muted-foreground">
                Monitoring enabled
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alerts</CardTitle>
              <Activity className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">0</div>
              <p className="text-xs text-muted-foreground">
                No active alerts
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ActiveVerification;
