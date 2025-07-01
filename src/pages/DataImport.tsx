
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Import, FileText, Database, Upload, Users, Building2 } from 'lucide-react';
import { useConsolidatedDataImport } from '@/hooks/useConsolidatedDataImport';

const DataImport: React.FC = () => {
  const { 
    importUsers, 
    importFacilities, 
    parseCSV, 
    validateData, 
    isImporting, 
    importProgress,
    meta 
  } = useConsolidatedDataImport();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'users' | 'facilities'>('users');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  console.log('📊 Data Import page loaded with consolidated system:', meta.version);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        const data = parseCSV(csv);
        setCsvData(data);
        
        // Validate data
        const errors = validateData(data, importType);
        setValidationErrors(errors);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!csvData.length) return;

    try {
      if (importType === 'users') {
        await importUsers(csvData);
      } else if (importType === 'facilities') {
        await importFacilities(csvData);
      }
      
      // Reset form
      setSelectedFile(null);
      setCsvData([]);
      setValidationErrors([]);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const importTypes = [
    {
      type: 'users' as const,
      title: 'User Data Import',
      description: 'Import user records from CSV files',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      type: 'facilities' as const,
      title: 'Facility Data Import',
      description: 'Import healthcare facility information',
      icon: Building2,
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Import</h1>
        <p className="text-gray-600 mt-2">
          Import data using the consolidated data import system
        </p>
      </div>

      {/* System Info */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
            <Database className="h-5 w-5" />
            Consolidated Data Import System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>System:</strong> {meta.dataSource}</p>
            <p><strong>Version:</strong> {meta.version}</p>
            <p><strong>Supported Types:</strong> {meta.supportedTypes.join(', ')}</p>
            <p><strong>Uses Consolidated Hooks:</strong> {meta.usesConsolidatedHooks ? 'Yes' : 'No'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Import Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Import Type</CardTitle>
          <CardDescription>Choose the type of data you want to import</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {importTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card 
                  key={type.type}
                  className={`cursor-pointer transition-all ${
                    importType === type.type 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setImportType(type.type)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${type.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{type.title}</CardTitle>
                        <CardDescription>{type.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Select a CSV file to import {importType} data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={isImporting}
          />
          
          {selectedFile && (
            <div className="text-sm text-gray-600">
              Selected: {selectedFile.name} ({csvData.length} records)
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Validation Errors:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {isImporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing {importType}...</span>
                <span>{Math.round(importProgress)}%</span>
              </div>
              <Progress value={importProgress} className="w-full" />
            </div>
          )}

          <Button 
            onClick={handleImport}
            disabled={!csvData.length || validationErrors.length > 0 || isImporting}
            className="w-full"
          >
            <Import className="h-4 w-4 mr-2" />
            {isImporting ? 'Importing...' : `Import ${csvData.length} ${importType}`}
          </Button>
        </CardContent>
      </Card>

      {/* Import History */}
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>Recent data import operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Import className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No import operations yet</p>
            <p className="text-sm">Start your first import to see it here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataImport;
