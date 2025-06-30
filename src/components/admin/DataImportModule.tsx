import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Database, FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { useDataImport } from '@/hooks/useDataImport';
import { useJsonDataImport } from '@/hooks/useJsonDataImport';
import { useToast } from '@/hooks/use-toast';

const AVAILABLE_TABLES = [
  { value: 'therapies', label: 'Therapies', description: 'Therapy types and classifications' },
  { value: 'manufacturers', label: 'Manufacturers', description: 'Pharmaceutical manufacturers' },
  { value: 'modalities', label: 'Modalities', description: 'Treatment modalities' },
  { value: 'products', label: 'Products', description: 'Therapeutic products' },
  { value: 'services', label: 'Services', description: 'Healthcare services' },
  { value: 'service_providers', label: 'Service Providers', description: 'Service provider companies' },
  { value: 'service_provider_capabilities', label: 'Service Capabilities', description: 'Provider capabilities' },
  { value: 'clinical_trials', label: 'Clinical Trials', description: 'Clinical trial data' },
  { value: 'commercial_products', label: 'Commercial Products', description: 'Commercialized products' }
];

export const DataImportModule: React.FC = () => {
  const { loadSeedData, importCSVData, isLoading: csvLoading } = useDataImport();
  const { loadJsonData, isLoading: jsonLoading } = useJsonDataImport();
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('');

  const isLoading = csvLoading || jsonLoading;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (validTypes.includes(file.type) || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        toast({
          title: "File Selected",
          description: `Ready to import: ${file.name}`,
        });
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV or Excel file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCSVImport = async () => {
    if (!selectedFile || !selectedTable) {
      toast({
        title: "Missing Information",
        description: "Please select both a file and a table.",
        variant: "destructive",
      });
      return;
    }

    await importCSVData(selectedFile, selectedTable);
    setSelectedFile(null);
    setSelectedTable('');
  };

  const handleJsonImport = async () => {
    if (!jsonInput.trim()) {
      toast({
        title: "Missing JSON Data",
        description: "Please enter JSON data to import.",
        variant: "destructive",
      });
      return;
    }

    try {
      const jsonData = JSON.parse(jsonInput);
      const results = await loadJsonData(jsonData);
      
      toast({
        title: "JSON Import Successful!",
        description: `Imported: ${results.therapies} therapies, ${results.manufacturers} manufacturers, ${results.modalities} modalities, ${results.services} services, ${results.service_providers} providers`,
      });
      
      setJsonInput('');
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON format and try again.",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = (tableName: string) => {
    const templates: Record<string, string> = {
      therapies: 'name,therapy_type,description,indication_areas,regulatory_status,is_active\n"CAR-T Cell Therapy","cell_gene_therapy","Chimeric Antigen Receptor T-Cell Therapy","Oncology;Hematology","FDA Approved",true',
      manufacturers: 'name,manufacturer_type,headquarters_location,quality_certifications,manufacturing_capabilities,partnership_tier,is_active\n"Gilead Sciences","biopharmaceutical","Foster City, CA","FDA;EMA;GMP","Cell Therapy;Gene Therapy","tier_1",true',
      modalities: 'name,modality_type,description,manufacturing_complexity,is_active\n"Autologous CAR-T","cell_therapy","Patient-derived T-cell therapy","high",true',
      products: 'name,product_type,indication_areas,is_active\n"Kymriah","commercial","Acute Lymphoblastic Leukemia;Diffuse Large B-Cell Lymphoma",true',
      services: 'name,service_type,description,capabilities,geographic_coverage,is_active\n"Cold Chain Logistics","logistics","Specialized cold chain management","Temperature monitoring;Real-time tracking","North America;Europe",true',
      service_providers: 'name,provider_type,specializations,geographic_coverage,certifications,is_active\n"Cryoport Systems","logistics","Cold Chain;Cell & Gene Therapy","Global","GDP;IATA;ISPE",true'
    };

    const csvContent = templates[tableName] || 'No template available for this table';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${tableName}_template.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Template Downloaded",
      description: `CSV template for ${tableName} has been downloaded.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Import & Management</h2>
          <p className="text-muted-foreground">
            Load and manage onboarding system data through multiple methods
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Real Database Connection
        </Badge>
      </div>

      <Tabs defaultValue="json-import" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="json-import">JSON Import</TabsTrigger>
          <TabsTrigger value="seed-data">Seed Data</TabsTrigger>
          <TabsTrigger value="csv-import">CSV Import</TabsTrigger>
          <TabsTrigger value="api-endpoints">API Access</TabsTrigger>
        </TabsList>

        <TabsContent value="json-import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>JSON Data Import</span>
              </CardTitle>
              <CardDescription>
                Import comprehensive market data from JSON format. Perfect for bulk data loading with real market information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="json-input">JSON Data</Label>
                <Textarea
                  id="json-input"
                  placeholder="Paste your JSON data here..."
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleJsonImport}
                  disabled={!jsonInput.trim() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Importing...' : 'Import JSON Data'}
                </Button>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">JSON Import Features:</p>
                    <ul className="mt-1 text-xs space-y-1">
                      <li>• Supports therapies, manufacturers, modalities, services, and service providers</li>
                      <li>• Automatically handles relationships and foreign keys</li>
                      <li>• Real market data with pricing, contact info, and regulatory details</li>
                      <li>• Validates data structure before import</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seed-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Load Seed Data</span>
              </CardTitle>
              <CardDescription>
                Populate the database with comprehensive sample data for therapies, manufacturers, services, and more.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">3 Therapies</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">3 Manufacturers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">2 Modalities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">2 Products</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">5 Services</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">3 Providers</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={loadSeedData} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Loading...' : 'Load All Seed Data'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  This will safely add sample data without affecting existing records
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv-import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>CSV/Excel Import</span>
              </CardTitle>
              <CardDescription>
                Import data from CSV or Excel files into specific database tables.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="table-select">Target Table</Label>
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a table" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_TABLES.map((table) => (
                        <SelectItem key={table.value} value={table.value}>
                          <div>
                            <div className="font-medium">{table.label}</div>
                            <div className="text-xs text-muted-foreground">{table.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-upload">Select File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                  />
                </div>
              </div>

              {selectedFile && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <Badge variant="secondary">{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button 
                  onClick={handleCSVImport}
                  disabled={!selectedFile || !selectedTable || isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Importing...' : 'Import Data'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => selectedTable && downloadTemplate(selectedTable)}
                  disabled={!selectedTable}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Template
                </Button>
              </div>

              {selectedTable && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Import Guidelines:</p>
                      <ul className="mt-1 text-xs space-y-1">
                        <li>• Use semicolons (;) to separate multiple values in array fields</li>
                        <li>• JSON fields should be properly formatted JSON strings</li>
                        <li>• Boolean fields accept: true/false or 1/0</li>
                        <li>• Download the template to see the expected format</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>API Endpoints</span>
              </CardTitle>
              <CardDescription>
                Access data programmatically through REST API endpoints.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {AVAILABLE_TABLES.map((table) => (
                  <div key={table.value} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{table.label}</h3>
                      <Badge variant="outline">REST API</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{table.description}</p>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs font-mono">
                        <Badge variant="secondary">GET</Badge>
                        <span>/rest/v1/{table.value}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs font-mono">
                        <Badge variant="secondary">POST</Badge>
                        <span>/rest/v1/{table.value}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs font-mono">
                        <Badge variant="secondary">PATCH</Badge>
                        <span>/rest/v1/{table.value}?id=eq.{'{id}'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-gray-50 border rounded-lg">
                <h3 className="font-medium mb-2">Authentication</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  All API requests require authentication. Include the following headers:
                </p>
                <div className="space-y-1 text-xs font-mono bg-white p-2 rounded border">
                  <div>Authorization: Bearer {'<your-access-token>'}</div>
                  <div>apikey: {'<supabase-anon-key>'}</div>
                  <div>Content-Type: application/json</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
