
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Download, 
  FileText, 
  Users, 
  Building, 
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { useConsolidatedDataImport } from '@/hooks/useConsolidatedDataImport';
import { useMasterDataImport } from '@/hooks/useMasterDataImport';

const DataImport: React.FC = () => {
  const [activeTab, setActiveTab] = useState('import');
  
  // Use both hooks for comprehensive functionality
  const consolidatedImport = useConsolidatedDataImport();
  const masterImport = useMasterDataImport();
  
  // Use consolidated import as primary source
  const {
    isImporting,
    importResults,
    importHistory,
    importProgress,
    importUsers,
    importFacilities,
    importModules,
    importCSVData,
    importJSONData,
    getImportStats
  } = consolidatedImport;

  console.log('📦 Data Import - Using Consolidated Single Source of Truth');

  const handleUserImport = async () => {
    await importUsers();
  };

  const handleFacilityImport = async () => {
    await importFacilities();
  };

  const handleModuleImport = async () => {
    await importModules();
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const text = await file.text();
      await importCSVData(text);
    }
  };

  const handleJSONUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const text = await file.text();
      const data = JSON.parse(text);
      await importJSONData(data);
    }
  };

  const handleExportData = () => {
    // Export functionality
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Type,Count,Status,Source,Timestamp\n"
      + importHistory.map(item => 
          `"${item.type}","${item.count}","${item.status}","${item.source}","${item.timestamp}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_import_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = getImportStats();

  return (
    <AppLayout title="Data Import">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Data Import</h1>
            <p className="text-muted-foreground">Import and export data across all modules</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleExportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Badge variant="secondary" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              {stats.totalImports} imports
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Imports</p>
                  <p className="text-2xl font-bold">{stats.totalImports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Successful</p>
                  <p className="text-2xl font-bold">{stats.successfulImports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold">{stats.failedImports}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="import">Import Data</TabsTrigger>
            <TabsTrigger value="export">Export Data</TabsTrigger>
            <TabsTrigger value="history">Import History</TabsTrigger>
          </TabsList>

          <TabsContent value="import">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Import */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Quick Import
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleUserImport}
                    disabled={isImporting}
                    className="w-full flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    {isImporting ? 'Importing...' : 'Import Users'}
                  </Button>
                  
                  <Button 
                    onClick={handleFacilityImport}
                    disabled={isImporting}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <Building className="h-4 w-4" />
                    Import Facilities
                  </Button>
                  
                  <Button 
                    onClick={handleModuleImport}
                    disabled={isImporting}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Import Modules
                  </Button>
                </CardContent>
              </Card>

              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>File Upload</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">CSV Import</label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      disabled={isImporting}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">JSON Import</label>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleJSONUpload}
                      disabled={isImporting}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Import Progress */}
            {isImporting && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <div>
                      <h3 className="font-semibold">Import in Progress</h3>
                      <p className="text-sm text-muted-foreground">Progress: {importProgress}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Results */}
            {importResults.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recent Import Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {importResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">{result.type}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {result.count} records
                          </span>
                        </div>
                        <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                          {result.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex flex-col items-center gap-2">
                    <Users className="h-6 w-6" />
                    <span>Export Users</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 flex flex-col items-center gap-2">
                    <Building className="h-6 w-6" />
                    <span>Export Facilities</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 flex flex-col items-center gap-2">
                    <Package className="h-6 w-6" />
                    <span>Export Modules</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Import History</CardTitle>
              </CardHeader>
              <CardContent>
                {importHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No import history available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {importHistory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">{item.type}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {item.count} records
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <Badge variant={item.status === 'success' ? 'default' : 'destructive'}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Data Source Verification */}
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-sm font-medium text-green-700">
                ✅ Single Source of Truth Active - Consolidated Data Import
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Data Source: useConsolidatedDataImport | Imports: {stats.totalImports} | Version: v3.0.0
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DataImport;
