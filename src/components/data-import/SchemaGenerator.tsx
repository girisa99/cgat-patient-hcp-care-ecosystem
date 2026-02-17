import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Edit3 } from 'lucide-react';

interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  nullable: boolean;
}

interface SchemaGeneratorProps {
  schema: Record<string, string>;
  onSchemaUpdate: (schema: Record<string, string>) => void;
  onExportSchema: () => void;
  isEditing: boolean;
  onToggleEditing: () => void;
}

const typeOptions = [
  'string', 'number', 'boolean', 'date', 'email', 'url', 'uuid', 'json',
  'mcp-request', 'mcp-response', 'mcp-resource', 'mcp-tool',
  'sml-schema', 'sml-validation'
];

export const SchemaGenerator: React.FC<SchemaGeneratorProps> = ({
  schema,
  onSchemaUpdate,
  onExportSchema,
  isEditing,
  onToggleEditing
}) => {
  const handleFieldTypeChange = (fieldName: string, newType: string) => {
    onSchemaUpdate({
      ...schema,
      [fieldName]: newType
    });
  };

  const handleFieldNameChange = (oldName: string, newName: string) => {
    if (newName === oldName) return;
    
    const newSchema = { ...schema };
    newSchema[newName] = newSchema[oldName];
    delete newSchema[oldName];
    onSchemaUpdate(newSchema);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>Generated Schema</span>
            <Badge variant="outline">{Object.keys(schema).length} fields</Badge>
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onToggleEditing}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? 'Done Editing' : 'Edit Schema'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onExportSchema}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(schema).map(([fieldName, fieldType]) => (
            <div key={fieldName} className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={fieldName}
                    onChange={(e) => handleFieldNameChange(fieldName, e.target.value)}
                    className="font-medium"
                  />
                ) : (
                  <span className="font-medium">{fieldName}</span>
                )}
              </div>
              <div className="w-32">
                {isEditing ? (
                  <Select 
                    value={fieldType}
                    onValueChange={(value) => handleFieldTypeChange(fieldName, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary">{fieldType}</Badge>
                )}
              </div>
            </div>
          ))}
          
          {Object.keys(schema).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Upload data to automatically generate schema
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};