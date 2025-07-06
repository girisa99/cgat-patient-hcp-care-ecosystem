
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Upload, RefreshCw, AlertCircle } from "lucide-react";
import { useMasterAuth } from '@/hooks/useMasterAuth';
import DashboardHeader from "@/components/layout/DashboardHeader";
import { getErrorMessage } from '@/utils/errorHandling';

const DataImport = () => {
  const { isAuthenticated } = useMasterAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-0 shadow-sm bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Authentication Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700">
                You need to be logged in to access data import.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Import</h1>
          <p className="text-lg text-gray-600">Import and manage your data</p>
        </div>

        {error && (
          <Card className="border-0 shadow-sm bg-red-50 border-red-200 mb-6">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Import Error</span>
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

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Data Import Tools</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="font-semibold mb-2">Ready to Import</h3>
              <p className="text-sm text-gray-500 mb-4">
                Upload your data files to get started
              </p>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataImport;
