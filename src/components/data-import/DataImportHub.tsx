import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, FileSpreadsheet, Database, Globe, 
  Download, RefreshCw, CheckCircle, Clock,
  AlertCircle, TrendingUp
} from "lucide-react";
import { CsvImportTab } from './tabs/CsvImportTab';
import { JsonImportTab } from './tabs/JsonImportTab';
import { ApiImportTab } from './tabs/ApiImportTab';
import { ImportHistory } from './ImportHistory';
import { useConsolidatedDataImport } from '@/hooks/useConsolidatedDataImport';

const DataImportHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('csv');
  
  const {
    isImporting,
    importProgress,
    importResults,
    importHistory,
    getImportStats
  } = useConsolidatedDataImport();

  const stats = getImportStats();

  const tabs = [
    {
      id: 'csv',
      label: 'CSV/Excel',
      icon: FileSpreadsheet,
      component: CsvImportTab,
      description: 'Import data from CSV or Excel files with flexible schema detection'
    },
    {
      id: 'json',
      label: 'JSON',
      icon: Database,
      component: JsonImportTab,
      description: 'Import structured JSON data with automatic validation'
    },
    {
      id: 'api',
      label: 'API Import',
      icon: Globe,
      component: ApiImportTab,
      description: 'Connect to external APIs and import data automatically'
    },
    {
      id: 'history',
      label: 'Import History',
      icon: Clock,
      component: ImportHistory,
      description: 'View and manage previous import sessions'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Data Import Hub</h1>
          <p className="text-gray-600">Flexible data import with schema detection and validation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Templates
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Imports</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalImports}</p>
              </div>
              <Upload className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Successful</p>
                <p className="text-2xl font-bold text-green-900">{stats.successfulImports}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Failed</p>
                <p className="text-2xl font-bold text-red-900">{stats.failedImports}</p>
              </div>
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Records Imported</p>
                <p className="text-2xl font-bold text-purple-900">
                  {importHistory.reduce((sum, session) => sum + (session.recordsProcessed || 0), 0)}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Import Status */}
      {isImporting && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Import in Progress</h3>
                <p className="text-sm text-blue-700">
                  {importProgress.current} of {importProgress.total} records processed
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">
                  {Math.round((importProgress.current / importProgress.total) * 100)}%
                </div>
                <div className="w-32 bg-blue-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(importProgress.current / importProgress.total) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Import Results */}
      {stats.lastImport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Last Import Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Source</p>
                <p className="font-semibold">{stats.lastImport.source}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Records</p>
                <p className="font-semibold">{stats.lastImport.recordsProcessed}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant={stats.lastImport.status === 'success' ? 'default' : 'destructive'}>
                  {stats.lastImport.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="font-semibold">{new Date(stats.lastImport.completedAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1 h-auto p-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="flex flex-col items-center gap-1 py-3 px-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <IconComponent className="h-5 w-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map((tab) => {
          const TabComponent = tab.component;
          return (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{tab.description}</p>
                </CardHeader>
                <CardContent>
                  <TabComponent />
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default DataImportHub;