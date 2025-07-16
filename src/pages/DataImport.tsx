
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Upload, FileText, Globe, History, AlertCircle } from "lucide-react";
import { useMasterAuth } from '@/hooks/useMasterAuth';
import AppLayout from '@/components/layout/AppLayout';
import { getErrorMessage } from '@/utils/errorHandling';
import { CsvImportTab } from '@/components/data-import/tabs/CsvImportTab';
import { JsonImportTab } from '@/components/data-import/tabs/JsonImportTab';
import { ApiImportTab } from '@/components/data-import/tabs/ApiImportTab';
import { ImportHistory } from '@/components/data-import/ImportHistory';

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
      <AppLayout title="Data Import">
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
                You need to be logged in to access data import.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Data Import">
      <div className="max-w-7xl mx-auto">
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
            <Tabs defaultValue="csv" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="csv" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>CSV Import</span>
                </TabsTrigger>
                <TabsTrigger value="json" className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>JSON Import</span>
                </TabsTrigger>
                <TabsTrigger value="api" className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>API Import</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center space-x-2">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="csv" className="mt-6">
                <CsvImportTab />
              </TabsContent>
              
              <TabsContent value="json" className="mt-6">
                <JsonImportTab />
              </TabsContent>
              
              <TabsContent value="api" className="mt-6">
                <ApiImportTab />
              </TabsContent>
              
              <TabsContent value="history" className="mt-6">
                <ImportHistory />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DataImport;
