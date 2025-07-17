import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploadZone } from '../FileUploadZone';
import { DataPreviewTable } from '../DataPreviewTable';
import { SchemaGenerator } from '../SchemaGenerator';
import { ImportProgress } from '../ImportProgress';
import { useConsolidatedDataImport } from '@/hooks/useConsolidatedDataImport';
import { Upload, FileText } from 'lucide-react';

export const JsonImportTab: React.FC = () => {
  const {
    validateData,
    importJSONData,
    isImporting,
    importProgress,
    importResults
  } = useConsolidatedDataImport();

  const [files, setFiles] = useState<File[]>([]);
  const [jsonText, setJsonText] = useState('');
  const [parsedData, setParsedData] = useState<Array<Record<string, unknown>>>([]);
  const [schema, setSchema] = useState<Record<string, string>>({});
  const [autoDetectSchema, setAutoDetectSchema] = useState(true);
  const [isEditingSchema, setIsEditingSchema] = useState(false);
  const [errors, setErrors] = useState<Array<{ message: string; row?: number }>>([]);
  const [inputMethod, setInputMethod] = useState<'file' | 'paste'>('file');

  const handleFileDrop = async (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      const file = newFiles[0];
      const text = await file.text();
      setJsonText(text);
      parseJSON(text);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (newFiles.length === 0) {
      setJsonText('');
      setParsedData([]);
      setSchema({});
      setErrors([]);
    }
  };

  const parseJSON = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      let dataArray: Array<Record<string, unknown>> = [];

      // Handle different JSON structures
      if (Array.isArray(parsed)) {
        dataArray = parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        // If it's an object, try to find array properties
        const arrayKeys = Object.keys(parsed).filter(key => Array.isArray(parsed[key]));
        
        if (arrayKeys.length > 0) {
          // Use the first array found
          dataArray = parsed[arrayKeys[0]];
        } else {
          // Convert single object to array
          dataArray = [parsed];
        }
      }

      setParsedData(dataArray);
      
      if (autoDetectSchema && dataArray.length > 0) {
        const generatedSchema = generateSchemaFromData(dataArray.slice(0, 10));
        setSchema(generatedSchema);
      }
      
      setErrors([]);
    } catch (error) {
      setErrors([{ message: `Invalid JSON: ${error}` }]);
      setParsedData([]);
      setSchema({});
    }
  };

  const generateSchemaFromData = (data: Array<Record<string, unknown>>): Record<string, string> => {
    if (data.length === 0) return {};
    
    const schema: Record<string, string> = {};
    
    // Get all possible keys from all objects
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
      
      // Determine type based on values
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
        // Check for special string types
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

  const handleTextChange = (text: string) => {
    setJsonText(text);
    if (text.trim()) {
      parseJSON(text);
    } else {
      setParsedData([]);
      setSchema({});
      setErrors([]);
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    
    try {
      const validation = validateData(parsedData, 'json');
      if (!validation.isValid) {
        const errorMessages = validation.errors?.map(err => ({ message: err })) || [];
        setErrors(errorMessages);
        return;
      }
      
      await importJSONData(parsedData, 'json');
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
    a.download = 'schema.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatExample = () => {
    const example = {
      data: [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          active: true,
          created_at: "2024-01-01T00:00:00Z"
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          active: false,
          created_at: "2024-01-02T00:00:00Z"
        }
      ]
    };
    
    setJsonText(JSON.stringify(example, null, 2));
    parseJSON(JSON.stringify(example));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>JSON Import Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-detect"
              checked={autoDetectSchema}
              onCheckedChange={setAutoDetectSchema}
            />
            <Label htmlFor="auto-detect">Auto-detect schema from data</Label>
          </div>
        </CardContent>
      </Card>

      <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as 'file' | 'paste')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Upload File</TabsTrigger>
          <TabsTrigger value="paste">Paste JSON</TabsTrigger>
        </TabsList>
        
        <TabsContent value="file" className="space-y-4">
          <FileUploadZone
            onFileDrop={handleFileDrop}
            acceptedTypes={['.json', 'application/json']}
            uploadedFiles={files}
            onRemoveFile={handleRemoveFile}
          />
        </TabsContent>
        
        <TabsContent value="paste" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>JSON Data</span>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={formatExample}>
                  Load Example
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jsonText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Paste your JSON data here..."
                className="min-h-[200px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isImporting && (
        <ImportProgress
          isImporting={isImporting}
          progress={typeof importProgress === 'number' ? importProgress : 0}
          currentStep="Processing..."
          totalRecords={parsedData.length}
          processedRecords={0}
          errors={errors}
          status={errors.length > 0 ? 'error' : 'processing'}
        />
      )}

      {parsedData.length > 0 && (
        <>
          <SchemaGenerator
            schema={schema}
            onSchemaUpdate={setSchema}
            onExportSchema={handleExportSchema}
            isEditing={isEditingSchema}
            onToggleEditing={() => setIsEditingSchema(!isEditingSchema)}
          />

          <DataPreviewTable
            data={parsedData}
            schema={schema}
            maxRows={10}
          />

          <div className="flex justify-end space-x-2">
            <Button
              onClick={handleImport}
              disabled={isImporting || parsedData.length === 0}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Import {parsedData.length} Records</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};