/**
 * DATA INTEGRATION PANEL
 * Shows integration options for enrollment data with existing tables
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDataIntegration } from '@/hooks/useDataIntegration';
import { Input } from '@/components/ui/input';
import { Download, Upload, Database, FileJson, FileSpreadsheet, Zap } from 'lucide-react';

interface DataIntegrationPanelProps {
  moduleType: 'patient' | 'treatment_center' | 'customer' | 'manufacturer';
  onDataUpdate?: (data: any) => void;
}

const moduleTableMapping = {
  patient: 'profiles',
  treatment_center: 'treatment_center_onboarding', 
  customer: 'profiles',
  manufacturer: 'profiles'
};

export const DataIntegrationPanel: React.FC<DataIntegrationPanelProps> = ({
  moduleType,
  onDataUpdate
}) => {
  const [selectedTable, setSelectedTable] = useState(moduleTableMapping[moduleType]);
  const [importData, setImportData] = useState<any[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  
  const {
    isProcessing,
    progress,
    importFromJSON,
    importFromCSV,
    exportToJSON,
    exportToCSV,
    updateRecord
  } = useDataIntegration();

  const handleJSONImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setImportData(Array.isArray(data) ? data : [data]);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    }
  };

  const executeJSONImport = async () => {
    if (importData.length === 0) return;
    
    try {
      const result = await importFromJSON(importData, {
        tableName: selectedTable,
        moduleType,
        format: 'json'
      });
      
      if (onDataUpdate) {
        onDataUpdate(result);
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const executeCSVImport = async () => {
    if (!csvFile) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csvContent = e.target?.result as string;
        const result = await importFromCSV(csvContent, {
          tableName: selectedTable,
          moduleType,
          format: 'csv'
        });
        
        if (onDataUpdate) {
          onDataUpdate(result);
        }
      } catch (error) {
        console.error('CSV import failed:', error);
      }
    };
    reader.readAsText(csvFile);
  };

  const handleExportJSON = async () => {
    await exportToJSON(selectedTable);
  };

  const handleExportCSV = async () => {
    await exportToCSV(selectedTable);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Integration - {moduleType.replace('_', ' ').toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Table Selection */}
        <div className="space-y-2">
          <Label htmlFor="table-select">Target Table</Label>
          <Select value={selectedTable} onValueChange={setSelectedTable}>
            <SelectTrigger>
              <SelectValue placeholder="Select target table" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profiles">Profiles</SelectItem>
              <SelectItem value="treatment_center_onboarding">Treatment Centers</SelectItem>
              <SelectItem value="facilities">Facilities</SelectItem>
              <SelectItem value="agents">Agents</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs">
            Current: {selectedTable}
          </Badge>
        </div>

        {/* Progress Indicator */}
        {isProcessing && (
          <div className="space-y-2">
            <Label>Processing...</Label>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Import Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="font-medium">Import Data</span>
          </div>
          
          {/* JSON Import */}
          <div className="space-y-2">
            <Label htmlFor="json-import">JSON Import</Label>
            <div className="flex gap-2">
              <Input
                id="json-import"
                type="file"
                accept=".json"
                onChange={handleJSONImport}
                disabled={isProcessing}
              />
              <Button 
                onClick={executeJSONImport}
                disabled={importData.length === 0 || isProcessing}
                size="sm"
              >
                <FileJson className="h-4 w-4 mr-1" />
                Import
              </Button>
            </div>
            {importData.length > 0 && (
              <Badge variant="secondary">{importData.length} records loaded</Badge>
            )}
          </div>

          {/* CSV Import */}
          <div className="space-y-2">
            <Label htmlFor="csv-import">CSV Import</Label>
            <div className="flex gap-2">
              <Input
                id="csv-import"
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                disabled={isProcessing}
              />
              <Button 
                onClick={executeCSVImport}
                disabled={!csvFile || isProcessing}
                size="sm"
              >
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                Import
              </Button>
            </div>
            {csvFile && (
              <Badge variant="secondary">{csvFile.name}</Badge>
            )}
          </div>
        </div>

        {/* Export Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="font-medium">Export Data</span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleExportJSON}
              disabled={isProcessing}
              variant="outline"
              size="sm"
            >
              <FileJson className="h-4 w-4 mr-1" />
              Export JSON
            </Button>
            <Button 
              onClick={handleExportCSV}
              disabled={isProcessing}
              variant="outline"
              size="sm"
            >
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* API Integration Info */}
        <div className="space-y-2 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="font-medium text-sm">API Integration</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Agent enrollment data automatically syncs with the <code>{selectedTable}</code> table. 
            All changes made through the conversational agent will update the database in real-time.
          </p>
          <Badge variant="outline" className="text-xs">
            Real-time sync enabled
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataIntegrationPanel;