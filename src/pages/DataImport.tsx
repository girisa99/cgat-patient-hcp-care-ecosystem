
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Plus, Upload, Download, FileText } from 'lucide-react';
import { useMasterData } from '@/hooks/useMasterData';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useUnifiedDevelopmentLifecycle } from '@/hooks/useUnifiedDevelopmentLifecycle';
import AccessDenied from '@/components/AccessDenied';

const DataImport: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, userRoles } = useMasterAuth();
  const { navigation } = useUnifiedDevelopmentLifecycle();
  const { 
    isLoading, 
    error, 
    refreshData, 
    stats 
  } = useMasterData();
  
  const [searchQuery, setSearchQuery] = React.useState('');

  console.log('📊 Data Import Page - Master Data Integration');

  // Role-based access guard
  if (!navigation.hasAccess('/data-import')) {
    return <AccessDenied />;
  }

  if (authLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-muted-foreground">Loading data import...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">Please log in to access data import</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600">Error loading data import: {error.message}</div>
            <Button onClick={refreshData} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Data Import & Export</h1>
        <p className="text-muted-foreground">
          Import and export data across the system
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
          <div className="text-sm text-blue-600">Total Records</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">0</div>
          <div className="text-sm text-green-600">Import Jobs</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">0</div>
          <div className="text-sm text-purple-600">Export Jobs</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{userRoles.length}</div>
          <div className="text-sm text-orange-600">Your Roles</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Data Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Drag and drop files here, or click to browse</p>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Select Files
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Import Type</label>
              <select className="w-full p-2 border rounded-md">
                <option>Users</option>
                <option>Facilities</option>
                <option>Patients</option>
                <option>Modules</option>
              </select>
            </div>
            <Button className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Start Import
            </Button>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Type</label>
              <select className="w-full p-2 border rounded-md">
                <option>All Users</option>
                <option>All Facilities</option>
                <option>All Patients</option>
                <option>System Modules</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <select className="w-full p-2 border rounded-md">
                <option>CSV</option>
                <option>JSON</option>
                <option>Excel</option>
              </select>
            </div>
            <Button className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No import/export jobs found</p>
            <p className="text-sm">Jobs will appear here once you start importing or exporting data</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataImport;
