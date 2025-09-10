/**
 * Schema-Aware Import Dialog
 * Handles dynamic column creation and flexible mapping
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Database, Plus, MapPin, CheckCircle } from 'lucide-react';
import { useSchemaAwareImport } from '@/hooks/useSchemaAwareImport';

interface SchemaAwareImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Array<Record<string, any>>;
  tableName: string;
  onImportComplete?: (results: any[]) => void;
}

export const SchemaAwareImportDialog: React.FC<SchemaAwareImportDialogProps> = ({
  open,
  onOpenChange,
  data,
  tableName,
  onImportComplete
}) => {
  const {
    analyzeDataSchema,
    schemaAnalysis,
    isAnalyzing,
    importWithSchemaMapping,
    isImporting
  } = useSchemaAwareImport();

  const [createMissingColumns, setCreateMissingColumns] = useState(true);
  const [customMapping, setCustomMapping] = useState<Array<{
    sourceField: string;
    targetColumn: string;
    dataType: string;
    isNewColumn: boolean;
  }>>([]);

  useEffect(() => {
    if (open && data.length > 0) {
      analyzeDataSchema(data, tableName);
    }
  }, [open, data, tableName]);

  useEffect(() => {
    if (schemaAnalysis?.mappingSuggestions) {
      setCustomMapping(schemaAnalysis.mappingSuggestions.map(m => ({
        sourceField: m.sourceField,
        targetColumn: m.targetColumn,
        dataType: m.dataType,
        isNewColumn: m.isNewColumn || false
      })));
    }
  }, [schemaAnalysis]);

  const handleImport = async () => {
    try {
      const results = await importWithSchemaMapping(data, {
        table: tableName,
        createMissingColumns,
        schemaMapping: customMapping,
        batchSize: 100
      });
      
      onImportComplete?.(results);
      onOpenChange(false);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const updateMapping = (index: number, field: string, value: string) => {
    const updated = [...customMapping];
    updated[index] = { ...updated[index], [field]: value };
    setCustomMapping(updated);
  };

  const dataTypes = [
    'text', 'integer', 'numeric', 'boolean', 'uuid', 
    'timestamp with time zone', 'jsonb', 'text[]'
  ];

  if (!schemaAnalysis) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Analyzing Data Schema...</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Schema-Aware Import: {tableName}</span>
          </DialogTitle>
          <DialogDescription>
            Configure how your data fields map to database columns. New columns can be created automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Schema Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Schema Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {schemaAnalysis.existingColumns.length}
                  </div>
                  <div className="text-sm text-gray-600">Existing Columns</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {schemaAnalysis.newFields.length}
                  </div>
                  <div className="text-sm text-gray-600">New Fields</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {data.length}
                  </div>
                  <div className="text-sm text-gray-600">Records</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Import Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="create-columns"
                  checked={createMissingColumns}
                  onCheckedChange={setCreateMissingColumns}
                />
                <Label htmlFor="create-columns">
                  Automatically create missing columns
                </Label>
                {schemaAnalysis.newFields.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {schemaAnalysis.newFields.length} new columns
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* New Fields Warning */}
          {schemaAnalysis.newFields.length > 0 && !createMissingColumns && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-orange-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {schemaAnalysis.newFields.length} fields will be ignored without column creation
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {schemaAnalysis.newFields.map(field => (
                    <Badge key={field} variant="outline" className="text-orange-600">
                      {field}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Field Mapping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Field Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-600">
                  <div>Source Field</div>
                  <div>Target Column</div>
                  <div>Data Type</div>
                  <div>Status</div>
                </div>
                
                {customMapping.map((mapping, index) => (
                  <div key={mapping.sourceField} className="grid grid-cols-4 gap-2 items-center">
                    <div className="font-mono text-sm">
                      {mapping.sourceField}
                    </div>
                    
                    <Input
                      value={mapping.targetColumn}
                      onChange={(e) => updateMapping(index, 'targetColumn', e.target.value)}
                      className="h-8"
                    />
                    
                    <Select
                      value={mapping.dataType}
                      onValueChange={(value) => updateMapping(index, 'dataType', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dataTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center space-x-1">
                      {mapping.isNewColumn ? (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Plus className="h-3 w-3" />
                          <span>New</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Exists</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Import Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={isImporting || customMapping.length === 0}
              className="flex items-center space-x-2"
            >
              {isImporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Database className="h-4 w-4" />
              )}
              <span>
                Import {data.length} Records
                {createMissingColumns && schemaAnalysis.newFields.length > 0 && 
                  ` + Create ${schemaAnalysis.newFields.length} Columns`
                }
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};