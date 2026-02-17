/**
 * ENROLLMENT DATA IMPORT
 * Unified data import system for all enrollment modules
 */
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileSpreadsheet, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  Code,
  Globe
} from 'lucide-react';
import { useUniversalEnrollment } from '@/hooks/useUniversalEnrollment';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  processed: any[];
}

interface EnrollmentDataImportProps {
  moduleType: ModuleType;
  onImportComplete?: () => void;
}

const CSV_TEMPLATES = {
  patient: [
    'firstName', 'lastName', 'dateOfBirth', 'email', 'phone', 
    'address', 'insuranceProvider', 'medicalHistory'
  ],
  treatment_center: [
    'facilityName', 'licenseNumber', 'npiNumber', 'primaryContactEmail',
    'facilityAddress', 'accreditation', 'specialties'
  ],
  customer: [
    'companyName', 'businessType', 'primaryContactName', 'primaryContactEmail',
    'businessAddress', 'taxId', 'description'
  ],
  manufacturer: [
    'manufacturerName', 'fdaNumber', 'isoNumber', 'primaryContactEmail',
    'manufacturingAddress', 'productCategories', 'qualityCertifications'
  ]
};

export const EnrollmentDataImport: React.FC<EnrollmentDataImportProps> = ({
  moduleType,
  onImportComplete
}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiHeaders, setApiHeaders] = useState('{}');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createInstance } = useUniversalEnrollment();
  const { showSuccess, showError } = useMasterToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      previewCsvFile(file);
    }
  };

  const previewCsvFile = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });
      
      setPreviewData(preview);
    } catch (error) {
      console.error('CSV preview error:', error);
      showError('Failed to preview CSV file');
    }
  };

  const generateCsvTemplate = () => {
    const headers = CSV_TEMPLATES[moduleType];
    const csvContent = headers.join(',') + '\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${moduleType}-enrollment-template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    showSuccess('CSV template downloaded');
  };

  const validateData = (data: any[]): ImportResult => {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      processed: []
    };

    const requiredFields = CSV_TEMPLATES[moduleType].slice(0, 4); // First 4 fields are usually required

    data.forEach((row, index) => {
      const missingFields = requiredFields.filter(field => !row[field] || row[field].toString().trim() === '');
      
      if (missingFields.length === 0) {
        result.success++;
        result.processed.push({
          ...row,
          module_type: moduleType,
          submission_method: 'csv_import',
          status: 'draft',
          progress: 50
        });
      } else {
        result.failed++;
        result.errors.push(`Row ${index + 1}: Missing required fields: ${missingFields.join(', ')}`);
      }
    });

    return result;
  };

  const processCsvImport = async () => {
    if (!csvFile) {
      showError('Please select a CSV file');
      return;
    }

    try {
      setImporting(true);
      setImportProgress(0);

      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });

      setImportProgress(25);

      // Validate data
      const validation = validateData(data);
      setImportProgress(50);

      // Process valid records
      for (let i = 0; i < validation.processed.length; i++) {
        const record = validation.processed[i];
        try {
          await createInstance({
            template_id: null,
            module_type: moduleType,
            enrollment_data: record,
            submission_method: 'csv_import',
            status: 'draft',
            progress: 50,
            current_step: 'imported'
          });
          
          setImportProgress(50 + ((i + 1) / validation.processed.length) * 50);
        } catch (error) {
          validation.failed++;
          validation.success--;
          validation.errors.push(`Failed to import record ${i + 1}: ${error}`);
        }
      }

      setImportResult(validation);
      
      if (validation.success > 0) {
        showSuccess(`Successfully imported ${validation.success} records`);
        onImportComplete?.();
      }
      
      if (validation.failed > 0) {
        showError(`Failed to import ${validation.failed} records`);
      }

    } catch (error) {
      console.error('CSV import error:', error);
      showError('Failed to process CSV import');
    } finally {
      setImporting(false);
    }
  };

  const processJsonImport = async () => {
    if (!jsonData.trim()) {
      showError('Please enter JSON data');
      return;
    }

    try {
      setImporting(true);
      setImportProgress(0);

      const data = JSON.parse(jsonData);
      const dataArray = Array.isArray(data) ? data : [data];
      
      setImportProgress(25);

      // Validate data
      const validation = validateData(dataArray);
      setImportProgress(50);

      // Process valid records
      for (let i = 0; i < validation.processed.length; i++) {
        const record = validation.processed[i];
        try {
          await createInstance({
            template_id: null,
            module_type: moduleType,
            enrollment_data: record,
            submission_method: 'api_import',
            status: 'draft',
            progress: 50,
            current_step: 'imported'
          });
          
          setImportProgress(50 + ((i + 1) / validation.processed.length) * 50);
        } catch (error) {
          validation.failed++;
          validation.success--;
          validation.errors.push(`Failed to import record ${i + 1}: ${error}`);
        }
      }

      setImportResult(validation);
      
      if (validation.success > 0) {
        showSuccess(`Successfully imported ${validation.success} records`);
        onImportComplete?.();
      }

    } catch (error) {
      console.error('JSON import error:', error);
      showError('Invalid JSON data or import failed');
    } finally {
      setImporting(false);
    }
  };

  const processApiImport = async () => {
    if (!apiEndpoint.trim()) {
      showError('Please enter API endpoint');
      return;
    }

    try {
      setImporting(true);
      setImportProgress(0);

      let headers: any = {};
      try {
        headers = JSON.parse(apiHeaders);
      } catch {
        showError('Invalid headers JSON format');
        return;
      }

      setImportProgress(25);

      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const dataArray = Array.isArray(data) ? data : [data];
      
      setImportProgress(50);

      // Validate and process data (same as JSON import)
      const validation = validateData(dataArray);
      
      for (let i = 0; i < validation.processed.length; i++) {
        const record = validation.processed[i];
        try {
          await createInstance({
            template_id: null,
            module_type: moduleType,
            enrollment_data: record,
            submission_method: 'api_import',
            status: 'draft',
            progress: 50,
            current_step: 'imported'
          });
          
          setImportProgress(50 + ((i + 1) / validation.processed.length) * 50);
        } catch (error) {
          validation.failed++;
          validation.success--;
          validation.errors.push(`Failed to import record ${i + 1}: ${error}`);
        }
      }

      setImportResult(validation);
      
      if (validation.success > 0) {
        showSuccess(`Successfully imported ${validation.success} records`);
        onImportComplete?.();
      }

    } catch (error) {
      console.error('API import error:', error);
      showError('Failed to import from API: ' + error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Import</h2>
          <p className="text-muted-foreground">
            Import {moduleType.replace('_', ' ')} enrollment data from various sources
          </p>
        </div>
        <Button onClick={generateCsvTemplate} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download CSV Template
        </Button>
      </div>

      <Tabs defaultValue="csv" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          <TabsTrigger value="json">JSON Import</TabsTrigger>
          <TabsTrigger value="api">API Import</TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                CSV File Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              </div>

              {csvFile && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Selected File:</span>
                    <Badge variant="outline">{csvFile.name}</Badge>
                  </div>
                </div>
              )}

              {previewData.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview (First 5 rows)
                  </h4>
                  <div className="border rounded-lg overflow-auto max-h-64">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          {Object.keys(previewData[0]).map(key => (
                            <th key={key} className="p-2 text-left">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, index) => (
                          <tr key={index} className="border-t">
                            {Object.values(row).map((value: any, i) => (
                              <td key={i} className="p-2">{value}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <Button 
                onClick={processCsvImport} 
                disabled={!csvFile || importing} 
                className="w-full"
              >
                {importing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importing... {Math.round(importProgress)}%
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                JSON Data Import
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jsonData">JSON Data</Label>
                <Textarea
                  id="jsonData"
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  placeholder={`Paste your JSON data here...\n\nExample:\n[\n  {\n    "firstName": "John",\n    "lastName": "Doe",\n    "email": "john@example.com"\n  }\n]`}
                  className="h-64 font-mono"
                />
              </div>

              <Button 
                onClick={processJsonImport} 
                disabled={!jsonData.trim() || importing} 
                className="w-full"
              >
                {importing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importing... {Math.round(importProgress)}%
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Import JSON Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                API Data Import
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apiEndpoint">API Endpoint URL</Label>
                <Input
                  id="apiEndpoint"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://api.example.com/data"
                />
              </div>

              <div>
                <Label htmlFor="apiHeaders">Headers (JSON format)</Label>
                <Textarea
                  id="apiHeaders"
                  value={apiHeaders}
                  onChange={(e) => setApiHeaders(e.target.value)}
                  placeholder='{\n  "Authorization": "Bearer YOUR_TOKEN",\n  "Content-Type": "application/json"\n}'
                  className="h-24 font-mono"
                />
              </div>

              <Button 
                onClick={processApiImport} 
                disabled={!apiEndpoint.trim() || importing} 
                className="w-full"
              >
                {importing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importing... {Math.round(importProgress)}%
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Import from API
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {importing && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Import Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(importProgress)}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Import Errors
                </h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-32 overflow-auto">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700">{error}</div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={() => setImportResult(null)} 
              variant="outline" 
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Results
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};