
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { useJsonDataImport } from '@/hooks/useJsonDataImport';
import { useToast } from '@/hooks/use-toast';

export const JsonImportTab: React.FC = () => {
  const { loadJsonData, isLoading } = useJsonDataImport();
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  const validateAndCleanJson = (input: string) => {
    console.log('🔍 Starting JSON validation and cleanup...');
    
    // Remove common formatting issues
    let cleanedInput = input.trim();
    
    // Remove any BOM (Byte Order Mark)
    cleanedInput = cleanedInput.replace(/^\uFEFF/, '');
    
    // Check for multiple JSON objects and wrap them in array if needed
    const jsonObjects = [];
    let currentPos = 0;
    let braceCount = 0;
    let inString = false;
    let escaped = false;
    let objectStart = -1;
    
    for (let i = 0; i < cleanedInput.length; i++) {
      const char = cleanedInput[i];
      
      if (!inString) {
        if (char === '{') {
          if (braceCount === 0) {
            objectStart = i;
          }
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0 && objectStart !== -1) {
            // Found complete JSON object
            const objectStr = cleanedInput.substring(objectStart, i + 1);
            jsonObjects.push(objectStr);
            objectStart = -1;
          }
        } else if (char === '"') {
          inString = true;
        }
      } else {
        if (char === '"' && !escaped) {
          inString = false;
        }
        escaped = (char === '\\' && !escaped);
      }
    }
    
    console.log('📊 Found JSON objects:', jsonObjects.length);
    
    // If we found multiple objects, try to parse each one
    if (jsonObjects.length > 1) {
      console.log('🔄 Multiple JSON objects detected, attempting to parse individually...');
      
      const parsedObjects = [];
      for (let i = 0; i < jsonObjects.length; i++) {
        try {
          const parsed = JSON.parse(jsonObjects[i]);
          parsedObjects.push(parsed);
          console.log(`✅ Successfully parsed object ${i + 1}`);
        } catch (error) {
          console.error(`❌ Failed to parse object ${i + 1}:`, error);
          throw new Error(`Invalid JSON in object ${i + 1}: ${error.message}`);
        }
      }
      
      // Try to merge objects if they have the same structure
      if (parsedObjects.length > 0) {
        const firstObj = parsedObjects[0];
        if (typeof firstObj === 'object' && firstObj !== null) {
          // Merge all objects
          const mergedObject = {};
          for (const obj of parsedObjects) {
            Object.assign(mergedObject, obj);
          }
          return mergedObject;
        }
      }
    }
    
    // Try to parse as single JSON object
    try {
      return JSON.parse(cleanedInput);
    } catch (error) {
      console.error('❌ JSON parse error:', error);
      
      // Provide more specific error information
      if (error.message.includes('position')) {
        const match = error.message.match(/position (\d+)/);
        if (match) {
          const position = parseInt(match[1]);
          const lines = cleanedInput.substring(0, position).split('\n');
          const lineNumber = lines.length;
          const columnNumber = lines[lines.length - 1].length + 1;
          const contextStart = Math.max(0, position - 50);
          const contextEnd = Math.min(cleanedInput.length, position + 50);
          const context = cleanedInput.substring(contextStart, contextEnd);
          
          throw new Error(
            `JSON parsing failed at line ${lineNumber}, column ${columnNumber}. ` +
            `Context around error: "${context}". ` +
            `Original error: ${error.message}`
          );
        }
      }
      
      throw error;
    }
  };

  const handleJsonImport = async () => {
    console.log('🔍 Starting JSON validation process...');
    setValidationError('');
    
    if (!jsonInput.trim()) {
      console.log('❌ Empty JSON input detected');
      toast({
        title: "Missing JSON Data",
        description: "Please enter JSON data to import.",
        variant: "destructive",
      });
      return;
    }

    console.log('📝 JSON input length:', jsonInput.length);
    console.log('📝 First 200 characters:', jsonInput.substring(0, 200));
    console.log('📝 Last 200 characters:', jsonInput.substring(Math.max(0, jsonInput.length - 200)));

    try {
      console.log('🔄 Attempting to validate and clean JSON...');
      const jsonData = validateAndCleanJson(jsonInput);
      console.log('✅ JSON validated and cleaned successfully');
      console.log('📊 Parsed data structure:', Object.keys(jsonData));
      console.log('📊 Full parsed data sample:', JSON.stringify(jsonData).substring(0, 500));
      
      const results = await loadJsonData(jsonData);
      
      toast({
        title: "JSON Import Successful!",
        description: `Imported: ${results.therapies} therapies, ${results.manufacturers} manufacturers, ${results.modalities} modalities, ${results.services} services, ${results.service_providers} providers`,
      });
      
      setJsonInput('');
    } catch (error: any) {
      console.error('❌ Error during JSON import:', error);
      setValidationError(error.message);
      
      toast({
        title: "Import Failed",
        description: `Import failed: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleJsonInputChange = (value: string) => {
    setJsonInput(value);
    setValidationError('');
    console.log('📝 JSON input changed, new length:', value.length);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Real Market Data Import</span>
        </CardTitle>
        <CardDescription>
          Import comprehensive real market data from JSON format. Upload actual market information for therapies, manufacturers, services, and providers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="json-input">JSON Market Data</Label>
          <Textarea
            id="json-input"
            placeholder="Paste your real market data JSON here..."
            value={jsonInput}
            onChange={(e) => handleJsonInputChange(e.target.value)}
            rows={15}
            className="font-mono text-sm"
          />
        </div>

        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800">JSON Validation Error:</p>
                <p className="mt-1 text-red-700 whitespace-pre-wrap">{validationError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button 
            onClick={handleJsonImport}
            disabled={!jsonInput.trim() || isLoading}
            className="flex-1"
          >
            {isLoading ? 'Importing Real Data...' : 'Import Market Data'}
          </Button>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Real Data Import Features:</p>
              <ul className="mt-1 text-xs space-y-1">
                <li>• Processes actual market data for therapies, manufacturers, modalities, services, and providers</li>
                <li>• Automatically validates and cleans JSON formatting issues</li>
                <li>• Handles multiple JSON objects and common formatting problems</li>
                <li>• Provides detailed error information for troubleshooting</li>
                <li>• Maintains data integrity and relationships</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
