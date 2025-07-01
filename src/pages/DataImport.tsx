
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Import, FileText, Database, Upload, Users, Building2, Globe, Code } from 'lucide-react';
import { useDataImportPage } from '@/hooks/useDataImportPage';
import { JsonImportTab } from '@/components/admin/DataImport/JsonImportTab';
import { CsvImportTab } from '@/components/admin/DataImport/CsvImportTab';
import { ApiEndpointsTab } from '@/components/admin/DataImport/ApiEndpointsTab';

/**
 * Data Import Page - LOCKED IMPLEMENTATION
 * Uses dedicated useDataImportPage hook for consistent data access
 * DO NOT MODIFY - This page is locked for stability
 */
const DataImport: React.FC = () => {
  const { 
    importUsers, 
    importFacilities, 
    parseCSV, 
    validateData, 
    isImporting, 
    importProgress,
    meta 
  } = useDataImportPage();

  console.log('🔒 Data Import Page - LOCKED VERSION active with hook version:', meta.hookVersion);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Import</h1>
        <p className="text-gray-600 mt-2">
          Import and manage data using multiple formats and methods
        </p>
      </div>

      {/* LOCKED STATUS INDICATOR */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <h3 className="font-semibold text-green-900">🔒 Data Import System Locked & Stable</h3>
        </div>
        <div className="text-sm text-green-700">
          <p><strong>Data Source:</strong> {meta.dataSource}</p>
          <p><strong>Version:</strong> {meta.version} | <strong>Hook Version:</strong> {meta.hookVersion}</p>
          <p><strong>Supported Types:</strong> {meta.supportedTypes.join(', ')}</p>
          <p className="text-xs text-green-600 mt-1">
            Uses Consolidated Hooks: {meta.usesConsolidatedHooks ? 'Yes' : 'No'} | 
            Single Source Validated: {meta.singleSourceValidated ? '✅' : '❌'}
          </p>
        </div>
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

      {/* Tabbed Interface */}
      <Tabs defaultValue="json-import" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="json-import" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            JSON Import
          </TabsTrigger>
          <TabsTrigger value="csv-import" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            CSV Import
          </TabsTrigger>
          <TabsTrigger value="api-access" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            API Access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="json-import">
          <JsonImportTab />
        </TabsContent>

        <TabsContent value="csv-import">
          <CsvImportTab />
        </TabsContent>

        <TabsContent value="api-access">
          <ApiEndpointsTab />
        </TabsContent>
      </Tabs>

      {/* Import Progress */}
      {isImporting && (
        <Card>
          <CardHeader>
            <CardTitle>Import Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing data import...</span>
                <span>{Math.round(importProgress)}%</span>
              </div>
              <Progress value={importProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

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
