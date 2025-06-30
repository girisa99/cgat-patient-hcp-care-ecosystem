
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, CheckCircle, AlertTriangle, Info } from 'lucide-react';
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
    
    // Basic validation - check if it looks like JSON
    if (!cleanedInput.startsWith('{') && !cleanedInput.startsWith('[')) {
      throw new Error('Input does not appear to be valid JSON. JSON must start with { or [');
    }
    
    if (!cleanedInput.endsWith('}') && !cleanedInput.endsWith(']')) {
      throw new Error('Input does not appear to be valid JSON. JSON must end with } or ]');
    }
    
    // Try to parse as single JSON object
    try {
      const parsed = JSON.parse(cleanedInput);
      console.log('✅ JSON validated and cleaned successfully');
      return parsed;
    } catch (error: any) {
      console.error('❌ JSON parse error:', error);
      
      // Provide more specific error information
      let errorMessage = `JSON parsing failed: ${error.message}`;
      
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
          
          errorMessage = `JSON parsing failed at line ${lineNumber}, column ${columnNumber}. Context: "${context}". Original error: ${error.message}`;
        }
      }
      
      // Check for common JSON errors and provide suggestions
      if (error.message.includes('Expected property name')) {
        errorMessage += '\n\nTip: Make sure all property names are enclosed in double quotes (not single quotes).';
      } else if (error.message.includes('Unexpected token')) {
        errorMessage += '\n\nTip: Check for missing commas, extra commas, or unescaped characters.';
      } else if (error.message.includes('Unexpected end')) {
        errorMessage += '\n\nTip: Check that all opening brackets { and [ have matching closing brackets } and ].';
      }
      
      throw new Error(errorMessage);
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

  const loadSampleData = () => {
    const sampleJson = `{
  "therapies": [
    {
      "name": "CAR-T Cell Therapy",
      "therapy_type": "cell_gene_therapy",
      "description": "Chimeric Antigen Receptor T-cell therapy for cancer treatment"
    }
  ],
  "manufacturers": [
    {
      "name": "BioTech Manufacturing Inc",
      "manufacturer_type": "contract_manufacturing",
      "headquarters_location": "Boston, MA",
      "quality_certifications": ["GMP", "ISO 13485"],
      "manufacturing_capabilities": ["cell_therapy", "gene_therapy"],
      "partnership_tier": "premium"
    }
  ],
  "services": [
    {
      "name": "Cold Chain Logistics",
      "service_type": "logistics",
      "description": "Temperature-controlled distribution and storage",
      "capabilities": ["transportation", "storage", "monitoring"],
      "geographic_coverage": ["US", "EU"]
    }
  ]
}`;
    setJsonInput(sampleJson);
    setValidationError('');
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
          <div className="flex items-center justify-between">
            <Label htmlFor="json-input">JSON Market Data</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadSampleData}
              className="text-xs"
            >
              Load Sample Data
            </Button>
          </div>
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
                <pre className="mt-1 text-red-700 whitespace-pre-wrap text-xs">{validationError}</pre>
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
            <Info className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">JSON Format Requirements:</p>
              <ul className="mt-1 text-xs space-y-1">
                <li>• Must be valid JSON format with proper syntax</li>
                <li>• Property names must be enclosed in double quotes</li>
                <li>• Supports: therapies, manufacturers, modalities, services, service_providers</li>
                <li>• Click "Load Sample Data" to see the expected format</li>
                <li>• Duplicate records (by name) will be automatically skipped</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
