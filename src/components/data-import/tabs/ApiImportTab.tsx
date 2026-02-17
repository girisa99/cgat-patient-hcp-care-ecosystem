import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DataPreviewTable } from '../DataPreviewTable';
import { SchemaGenerator } from '../SchemaGenerator';
import { ImportProgress } from '../ImportProgress';
import { useConsolidatedDataImport } from '@/hooks/useConsolidatedDataImport';
import { Upload, Play, Plus, X, Globe } from 'lucide-react';

interface ApiHeader {
  key: string;
  value: string;
}

export const ApiImportTab: React.FC = () => {
  const {
    validateData,
    importJSONData,
    isImporting,
    importProgress
  } = useConsolidatedDataImport();

  const [apiUrl, setApiUrl] = useState('');
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [headers, setHeaders] = useState<ApiHeader[]>([
    { key: 'Content-Type', value: 'application/json' }
  ]);
  const [requestBody, setRequestBody] = useState('');
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'apikey'>('none');
  const [authValue, setAuthValue] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(300);
  
  const [apiData, setApiData] = useState<Array<Record<string, unknown>>>([]);
  const [schema, setSchema] = useState<Record<string, string>>({});
  const [isEditingSchema, setIsEditingSchema] = useState(false);
  const [errors, setErrors] = useState<Array<{ message: string; row?: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const generateSchemaFromData = (data: Array<Record<string, unknown>>): Record<string, string> => {
    if (data.length === 0) return {};
    
    const schema: Record<string, string> = {};
    const allKeys = new Set<string>();
    
    data.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => allKeys.add(key));
      }
    });
    
    allKeys.forEach(key => {
      const values = data
        .map(row => row[key])
        .filter(val => val !== null && val !== undefined);
      
      if (values.length === 0) {
        schema[key] = 'string';
        return;
      }
      
      const firstValue = values[0];
      
      if (typeof firstValue === 'number') {
        schema[key] = 'number';
      } else if (typeof firstValue === 'boolean') {
        schema[key] = 'boolean';
      } else if (Array.isArray(firstValue)) {
        schema[key] = 'array';
      } else if (typeof firstValue === 'object') {
        schema[key] = 'json';
      } else if (typeof firstValue === 'string') {
        if (firstValue.includes('@')) {
          schema[key] = 'email';
        } else if (!isNaN(Date.parse(firstValue))) {
          schema[key] = 'date';
        } else if (firstValue.startsWith('http')) {
          schema[key] = 'url';
        } else {
          schema[key] = 'string';
        }
      } else {
        schema[key] = 'string';
      }
    });
    
    return schema;
  };

  const testApiConnection = async () => {
    if (!apiUrl.trim()) {
      setErrors([{ message: 'API URL is required' }]);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const requestHeaders: Record<string, string> = {};
      
      // Add custom headers
      headers.forEach(header => {
        if (header.key.trim() && header.value.trim()) {
          requestHeaders[header.key] = header.value;
        }
      });

      // Add authentication
      if (authType === 'bearer' && authValue.trim()) {
        requestHeaders['Authorization'] = `Bearer ${authValue}`;
      } else if (authType === 'apikey' && authValue.trim()) {
        requestHeaders['X-API-Key'] = authValue;
      }

      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (method === 'POST' && requestBody.trim()) {
        requestOptions.body = requestBody;
      }

      const response = await fetch(apiUrl, requestOptions);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let dataArray: Array<Record<string, unknown>> = [];

      // Handle different response structures
      if (Array.isArray(data)) {
        dataArray = data;
      } else if (typeof data === 'object' && data !== null) {
        const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
        
        if (arrayKeys.length > 0) {
          dataArray = data[arrayKeys[0]];
        } else {
          dataArray = [data];
        }
      }

      setApiData(dataArray);
      setLastFetch(new Date());
      
      if (dataArray.length > 0) {
        const generatedSchema = generateSchemaFromData(dataArray.slice(0, 10));
        setSchema(generatedSchema);
      }

    } catch (error) {
      setErrors([{ message: `Failed to fetch data: ${error}` }]);
      setApiData([]);
      setSchema({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (apiData.length === 0) return;
    
    try {
      const validation = validateData(apiData, 'api');
      if (!validation.isValid) {
        const errorMessages = validation.errors?.map(err => ({ message: err })) || [];
        setErrors(errorMessages);
        return;
      }
      
      await importJSONData(apiData, 'api');
    } catch (error) {
      setErrors([{ message: `Import failed: ${error}` }]);
    }
  };

  const handleExportSchema = () => {
    const schemaJSON = JSON.stringify(schema, null, 2);
    const blob = new Blob([schemaJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api-schema.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadExampleApi = () => {
    setApiUrl('https://jsonplaceholder.typicode.com/users');
    setMethod('GET');
    setAuthType('none');
    setRequestBody('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>API Configuration</span>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={loadExampleApi}>
              Load Example
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={method} onValueChange={(value: 'GET' | 'POST') => setMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-3 space-y-2">
              <Label>API URL</Label>
              <Input
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com/data"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Authentication</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={authType} onValueChange={(value: 'none' | 'bearer' | 'apikey') => setAuthType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="apikey">API Key</SelectItem>
                </SelectContent>
              </Select>
              
              {authType !== 'none' && (
                <div className="col-span-2">
                  <Input
                    value={authValue}
                    onChange={(e) => setAuthValue(e.target.value)}
                    placeholder={authType === 'bearer' ? 'Enter bearer token' : 'Enter API key'}
                    type="password"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Headers</Label>
              <Button variant="outline" size="sm" onClick={addHeader}>
                <Plus className="h-4 w-4 mr-1" />
                Add Header
              </Button>
            </div>
            <div className="space-y-2">
              {headers.map((header, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={header.key}
                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    placeholder="Header key"
                    className="flex-1"
                  />
                  <Input
                    value={header.value}
                    onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    placeholder="Header value"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeHeader(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {method === 'POST' && (
            <div className="space-y-2">
              <Label>Request Body (JSON)</Label>
              <Textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder='{"key": "value"}'
                className="min-h-[100px] font-mono text-sm"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh">Auto-refresh</Label>
              {autoRefresh && (
                <div className="flex items-center space-x-2 ml-4">
                  <Label className="text-sm">Every</Label>
                  <Input
                    type="number"
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="w-20"
                    min={60}
                    max={3600}
                  />
                  <Label className="text-sm">seconds</Label>
                </div>
              )}
            </div>
            
            <Button 
              onClick={testApiConnection}
              disabled={isLoading || !apiUrl.trim()}
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>{isLoading ? 'Testing...' : 'Test API'}</span>
            </Button>
          </div>

          {lastFetch && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Badge variant="outline">Last fetched: {lastFetch.toLocaleTimeString()}</Badge>
              {apiData.length > 0 && (
                <Badge variant="outline">{apiData.length} records</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isImporting && (
        <ImportProgress
          isImporting={isImporting}
          progress={typeof importProgress === 'object' && importProgress.total > 0 
            ? Math.round((importProgress.current / importProgress.total) * 100) 
            : 0}
          currentStep="Processing..."
          totalRecords={apiData.length}
          processedRecords={typeof importProgress === 'object' ? importProgress.current : 0}
          errors={errors}
          status={errors.length > 0 ? 'error' : 'processing'}
        />
      )}

      {apiData.length > 0 && (
        <>
          <SchemaGenerator
            schema={schema}
            onSchemaUpdate={setSchema}
            onExportSchema={handleExportSchema}
            isEditing={isEditingSchema}
            onToggleEditing={() => setIsEditingSchema(!isEditingSchema)}
          />

          <DataPreviewTable
            data={apiData}
            schema={schema}
            maxRows={10}
          />

          <div className="flex justify-end space-x-2">
            <Button
              onClick={handleImport}
              disabled={isImporting || apiData.length === 0}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Import {apiData.length} Records</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};