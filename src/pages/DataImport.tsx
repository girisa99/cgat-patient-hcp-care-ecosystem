
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Database, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Download,
  RefreshCw,
  Settings
} from 'lucide-react';

const DataImport: React.FC = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Mock data for demonstration
  const importStats = {
    totalImports: 45,
    successfulImports: 42,
    failedImports: 3,
    dataRecords: 15420
  };

  const recentImports = [
    {
      id: '1',
      fileName: 'patient_data_2024.csv',
      type: 'Patient Records',
      status: 'completed',
      records: 1250,
      importedAt: '2024-01-15 14:30',
      duration: '2m 15s'
    },
    {
      id: '2',
      fileName: 'facility_updates.xlsx',
      type: 'Facility Data',
      status: 'completed',
      records: 85,
      importedAt: '2024-01-15 12:00',
      duration: '45s'
    },
    {
      id: '3',
      fileName: 'user_export.json',
      type: 'User Data',
      status: 'failed',
      records: 0,
      importedAt: '2024-01-15 09:30',
      duration: '10s',
      error: 'Invalid JSON format'
    }
  ];

  const supportedFormats = [
    { format: 'CSV', description: 'Comma-separated values', icon: FileText },
    { format: 'Excel', description: 'Microsoft Excel files (.xlsx, .xls)', icon: FileText },
    { format: 'JSON', description: 'JavaScript Object Notation', icon: Database },
    { format: 'XML', description: 'Extensible Markup Language', icon: FileText }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full";
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'processing':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <MainLayout>
      <PageContainer
        title="Data Import"
        subtitle="Import and manage data from various sources and formats"
        headerActions={
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            New Import
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Imports</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{importStats.totalImports}</div>
                <p className="text-xs text-muted-foreground">
                  All time imports
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{importStats.successfulImports}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((importStats.successfulImports / importStats.totalImports) * 100)}% success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{importStats.failedImports}</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Records Imported</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{importStats.dataRecords.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Data records processed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Import Tabs */}
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upload">Upload Data</TabsTrigger>
              <TabsTrigger value="history">Import History</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Area */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upload File</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">Drop files here to upload</p>
                      <p className="text-sm text-gray-500 mb-4">
                        or click to browse files
                      </p>
                      <Button variant="outline">
                        Choose Files
                      </Button>
                    </div>
                    
                    {uploadProgress > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Supported Formats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Supported Formats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {supportedFormats.map((format, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <format.icon className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">{format.format}</div>
                            <div className="text-sm text-gray-500">{format.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Imports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentImports.map((importItem) => (
                      <div key={importItem.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(importItem.status)}
                            <div>
                              <h3 className="font-medium">{importItem.fileName}</h3>
                              <p className="text-sm text-gray-600">{importItem.type}</p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span>Records: {importItem.records}</span>
                                <span>Duration: {importItem.duration}</span>
                                <span>{importItem.importedAt}</span>
                              </div>
                              {importItem.error && (
                                <p className="text-sm text-red-600 mt-1">
                                  Error: {importItem.error}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={getStatusBadge(importItem.status)}>
                              {importItem.status}
                            </span>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            {importItem.status === 'failed' && (
                              <Button variant="outline" size="sm">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Import Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Import templates will help standardize your data</p>
                    <Button variant="outline">
                      Create Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Import Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Default Settings</h3>
                      <p className="text-sm text-gray-600">Configure default import behavior and validation rules</p>
                    </div>
                    <Button variant="outline">
                      Configure Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default DataImport;
