
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Import, Upload, Database, FileText, CheckCircle, AlertTriangle, Code, Globe } from 'lucide-react';
import { useDataImport } from '@/hooks/useDataImport';

const DataImport: React.FC = () => {
  const { 
    isImporting, 
    importProgress, 
    importResults, 
    importCSVData,
    importJSONData,
    getImportStats 
  } = useDataImport();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'users' | 'facilities' | 'modules'>('users');
  const [activeTab, setActiveTab] = useState('csv');
  const [jsonData, setJsonData] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const stats = getImportStats();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleCSVImport = async () => {
    if (!selectedFile) return;
    
    try {
      await importCSVData(selectedFile, importType);
    } catch (error) {
      console.error('CSV Import failed:', error);
    }
  };

  const handleJSONImport = async () => {
    if (!jsonData.trim()) return;
    
    try {
      const parsedData = JSON.parse(jsonData);
      const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
      await importJSONData(dataArray, importType);
    } catch (error) {
      console.error('JSON Import failed:', error);
    }
  };

  const handleAPIImport = async () => {
    if (!apiEndpoint.trim()) return;
    
    try {
      const response = await fetch(apiEndpoint);
      const data = await response.json();
      const dataArray = Array.isArray(data) ? data : [data];
      await importJSONData(dataArray, importType);
    } catch (error) {
      console.error('API Import failed:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Data Import</h1>
        <p className="text-muted-foreground">
          Import and manage data from various sources - CSV, JSON, and API endpoints
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Imports</CardTitle>
            <Import className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalImports}</div>
            <p className="text-xs text-muted-foreground">
              {stats.successfulImports} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records Imported</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecordsImported}</div>
            <p className="text-xs text-muted-foreground">
              Total records processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((stats.successfulImports / stats.totalImports) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Import success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isImporting ? 'Active' : 'Ready'}
            </div>
            <p className="text-xs text-muted-foreground">
              System status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Import Interface with Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Import Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Import Type</label>
              <select
                value={importType}
                onChange={(e) => setImportType(e.target.value as any)}
                className="w-full p-2 border rounded-md"
                disabled={isImporting}
              >
                <option value="users">Users</option>
                <option value="facilities">Facilities</option>
                <option value="modules">Modules</option>
              </select>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="csv" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CSV
                </TabsTrigger>
                <TabsTrigger value="json" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  JSON
                </TabsTrigger>
                <TabsTrigger value="api" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  API
                </TabsTrigger>
              </TabsList>

              <TabsContent value="csv" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    disabled={isImporting}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                {selectedFile && (
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-sm font-medium">{selectedFile.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCSVImport}
                  disabled={!selectedFile || isImporting}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isImporting ? 'Importing CSV...' : 'Import CSV'}
                </Button>
              </TabsContent>

              <TabsContent value="json" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">JSON Data</label>
                  <textarea
                    value={jsonData}
                    onChange={(e) => setJsonData(e.target.value)}
                    placeholder='{"name": "Example", "email": "example@email.com"}'
                    disabled={isImporting}
                    className="w-full p-2 border rounded-md h-32 font-mono text-sm"
                  />
                </div>

                <Button
                  onClick={handleJSONImport}
                  disabled={!jsonData.trim() || isImporting}
                  className="w-full"
                >
                  <Code className="h-4 w-4 mr-2" />
                  {isImporting ? 'Importing JSON...' : 'Import JSON'}
                </Button>
              </TabsContent>

              <TabsContent value="api" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">API Endpoint URL</label>
                  <input
                    type="url"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    placeholder="https://api.example.com/users"
                    disabled={isImporting}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <Button
                  onClick={handleAPIImport}
                  disabled={!apiEndpoint.trim() || isImporting}
                  className="w-full"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {isImporting ? 'Importing from API...' : 'Import from API'}
                </Button>
              </TabsContent>
            </Tabs>

            {isImporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            {importResults ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Import Completed</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{importResults.recordsProcessed}</div>
                    <div className="text-sm text-muted-foreground">Records Processed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{importResults.recordsImported}</div>
                    <div className="text-sm text-muted-foreground">Successfully Imported</div>
                  </div>
                </div>

                {importResults.errors && importResults.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">Warnings</span>
                    </div>
                    <div className="space-y-1">
                      {importResults.errors.map((error: string, index: number) => (
                        <div key={index} className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <Import className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No import results yet</p>
                <p className="text-sm">Start an import to see results here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataImport;
