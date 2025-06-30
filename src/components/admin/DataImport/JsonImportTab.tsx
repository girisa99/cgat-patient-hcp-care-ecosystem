
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, CheckCircle } from 'lucide-react';
import { useJsonDataImport } from '@/hooks/useJsonDataImport';
import { useToast } from '@/hooks/use-toast';

export const JsonImportTab: React.FC = () => {
  const { loadJsonData, isLoading } = useJsonDataImport();
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState<string>('');

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
                <li>• Automatically validates and transforms data to match database schema</li>
                <li>• Handles real contact information, pricing, and regulatory details</li>
                <li>• Maintains data integrity and relationships</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
