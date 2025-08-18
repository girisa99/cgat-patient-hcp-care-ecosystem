
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, RefreshCw, AlertCircle } from "lucide-react";
import { useMasterAuth } from '@/hooks/useMasterAuth';
import AppLayout from '@/components/layout/AppLayout';
import { getErrorMessage } from '@/utils/errorHandling';

const Security = () => {
  const { isAuthenticated } = useMasterAuth();
  const [error] = React.useState<string | null>(null);

  return (
    <AppLayout title="Security Dashboard">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security</h1>
          <p className="text-lg text-gray-600">Manage security settings and policies</p>
        </div>

        {error && (
          <Card className="border-0 shadow-sm bg-red-50 border-red-200 mb-6">
            <CardContent>
              <p className="text-red-700">{getErrorMessage(error)}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Monitoring</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Real-time Protection</h3>
                <p className="text-sm text-muted-foreground">
                  XSS protection, input validation, and rate limiting active
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Security Hardening</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Enhanced Protection</h3>
                <p className="text-sm text-muted-foreground">
                  Session management, API security, and automated response enabled
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Security;
