
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

const AVAILABLE_TABLES = [
  { value: 'therapies', label: 'Therapies', description: 'Therapy types and classifications' },
  { value: 'manufacturers', label: 'Manufacturers', description: 'Pharmaceutical manufacturers' },
  { value: 'modalities', label: 'Modalities', description: 'Treatment modalities' },
  { value: 'products', label: 'Products', description: 'Therapeutic products' },
  { value: 'services', label: 'Services', description: 'Healthcare services' },
  { value: 'service_providers', label: 'Service Providers', description: 'Service provider companies' },
  { value: 'clinical_trials', label: 'Clinical Trials', description: 'Clinical trial data' },
  { value: 'commercial_products', label: 'Commercial Products', description: 'Commercialized products' }
];

export const ApiEndpointsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>API Endpoints for Real Data</span>
        </CardTitle>
        <CardDescription>
          Access real market data programmatically through REST API endpoints.
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
  );
};
