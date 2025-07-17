import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUploadZone } from '../FileUploadZone';
import { DataPreviewTable } from '../DataPreviewTable';
import { SchemaGenerator } from '../SchemaGenerator';
import { ImportProgress } from '../ImportProgress';
import { useConsolidatedDataImport } from '@/hooks/useConsolidatedDataImport';
import { Upload } from 'lucide-react';

export const CsvImportTab: React.FC = () => {
  const {
    parseCSV,
    validateData,
    importCSVData,
    isImporting,
    importProgress,
    importResults
  } = useConsolidatedDataImport();

  const [files, setFiles] = useState<File[]>([]);
  const [parsedData, setParsedData] = useState<Array<Record<string, unknown>>>([]);
  const [schema, setSchema] = useState<Record<string, string>>({});
  const [hasHeader, setHasHeader] = useState(true);
  const [delimiter, setDelimiter] = useState(',');
  const [isEditingSchema, setIsEditingSchema] = useState(false);
  const [errors, setErrors] = useState<Array<{ message: string; row?: number }>>([]);

  const handleFileDrop = async (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      const file = newFiles[0];
      const text = await file.text();
      
      try {
        const parsed = parseCSV(text);
        setParsedData(parsed);
        
        // Generate schema from first few rows
        if (parsed.length > 0) {
          const generatedSchema = generateSchemaFromData(parsed.slice(0, 10));
          setSchema(generatedSchema);
        }
        
        setErrors([]);
      } catch (error) {
        setErrors([{ message: `Failed to parse CSV: ${error}` }]);
      }
    }
  };

  const generateSchemaFromData = (data: Array<Record<string, unknown>>): Record<string, string> => {
    if (data.length === 0) return {};
    
    const schema: Record<string, string> = {};
    const firstRow = data[0];
    
    Object.keys(firstRow).forEach(key => {
      const values = data.map(row => row[key]).filter(val => val !== null && val !== undefined);
      
      if (values.length === 0) {
        schema[key] = 'string';
        return;
      }
      
      // Check if all values are numbers
      if (values.every(val => !isNaN(Number(val)))) {
        schema[key] = 'number';
      }
      // Check if all values are booleans
      else if (values.every(val => val === true || val === false || val === 'true' || val === 'false')) {
        schema[key] = 'boolean';
      }
      // Check if values look like dates
      else if (values.some(val => !isNaN(Date.parse(String(val))))) {
        schema[key] = 'date';
      }
      // Check if values look like emails
      else if (values.some(val => String(val).includes('@'))) {
        schema[key] = 'email';
      }
      // Default to string
      else {
        schema[key] = 'string';
      }
    });
    
    return schema;
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (newFiles.length === 0) {
      setParsedData([]);
      setSchema({});
      setErrors([]);
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    
    try {
      const validation = validateData(parsedData, 'csv');
      if (!validation.isValid) {
        const errorMessages = validation.errors?.map(err => ({ message: err })) || [];
        setErrors(errorMessages);
        return;
      }
      
      await importCSVData(JSON.stringify(parsedData), 'csv');
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CSV Import Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="has-header"
                checked={hasHeader}
                onCheckedChange={setHasHeader}
              />
              <Label htmlFor="has-header">First row contains headers</Label>
            </div>
            
            <div className="space-y-2">
              <Label>Delimiter</Label>
              <Select value={delimiter} onValueChange={setDelimiter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">Comma (,)</SelectItem>
                  <SelectItem value=";">Semicolon (;)</SelectItem>
                  <SelectItem value="\t">Tab</SelectItem>
                  <SelectItem value="|">Pipe (|)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <FileUploadZone
        onFileDrop={handleFileDrop}
        acceptedTypes={['.csv', 'text/csv']}
        uploadedFiles={files}
        onRemoveFile={handleRemoveFile}
      />

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