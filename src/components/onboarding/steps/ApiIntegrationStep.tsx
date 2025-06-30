import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { 
  Plus, 
  Trash2, 
  Globe, 
  Key, 
  Shield, 
  Code, 
  Database,
  Zap
} from 'lucide-react';

interface ApiIntegrationStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  authentication_required: boolean;
  rate_limit?: number;
  data_format: 'JSON' | 'XML' | 'CSV' | 'FHIR';
  is_webhook: boolean;
}

interface ApiIntegrationData {
  endpoints: ApiEndpoint[];
  authentication_methods: string[];
  data_formats: string[];
  security_requirements: {
    encryption_required: boolean;
    api_key_authentication: boolean;
    oauth2_authentication: boolean;
    ip_whitelisting: boolean;
    ssl_certificate_required: boolean;
  };
  documentation_preferences: {
    swagger_documentation: boolean;
    postman_collection: boolean;
    sdk_required: boolean;
    sandbox_environment: boolean;
  };
}

export const ApiIntegrationStep: React.FC<ApiIntegrationStepProps> = ({
  data,
  onDataChange,
}) => {
  const apiData = data.api_integration || {
    endpoints: [],
    authentication_methods: [],
    data_formats: [],
    security_requirements: {
      encryption_required: true,
      api_key_authentication: false,
      oauth2_authentication: false,
      ip_whitelisting: false,
      ssl_certificate_required: true,
    },
    documentation_preferences: {
      swagger_documentation: false,
      postman_collection: false,
      sdk_required: false,
      sandbox_environment: false,
    },
  };

  const [newEndpoint, setNewEndpoint] = useState<Partial<ApiEndpoint>>({
    name: '',
    url: '',
    method: 'GET',
    description: '',
    authentication_required: false,
    data_format: 'JSON',
    is_webhook: false,
  });

  const updateApiData = (updates: Partial<ApiIntegrationData>) => {
    onDataChange({
      api_integration: { ...apiData, ...updates },
    });
  };

  const addEndpoint = () => {
    if (newEndpoint.name && newEndpoint.url) {
      const endpoint: ApiEndpoint = {
        id: Date.now().toString(),
        name: newEndpoint.name,
        url: newEndpoint.url,
        method: newEndpoint.method || 'GET',
        description: newEndpoint.description || '',
        authentication_required: newEndpoint.authentication_required || false,
        data_format: newEndpoint.data_format || 'JSON',
        is_webhook: newEndpoint.is_webhook || false,
        rate_limit: newEndpoint.rate_limit,
      };

      updateApiData({
        endpoints: [...apiData.endpoints, endpoint],
      });

      setNewEndpoint({
        name: '',
        url: '',
        method: 'GET',
        description: '',
        authentication_required: false,
        data_format: 'JSON',
        is_webhook: false,
      });
    }
  };

  const removeEndpoint = (id: string) => {
    updateApiData({
      endpoints: apiData.endpoints.filter(endpoint => endpoint.id !== id),
    });
  };

  const updateSecurityRequirement = (key: keyof ApiIntegrationData['security_requirements'], value: boolean) => {
    updateApiData({
      security_requirements: {
        ...apiData.security_requirements,
        [key]: value,
      },
    });
  };

  const updateDocumentationPreference = (key: keyof ApiIntegrationData['documentation_preferences'], value: boolean) => {
    updateApiData({
      documentation_preferences: {
        ...apiData.documentation_preferences,
        [key]: value,
      },
    });
  };

  const authMethodOptions = [
    'API Key',
    'OAuth 2.0',
    'Bearer Token',
    'Basic Authentication',
    'JWT Token',
    'Certificate-based',
  ];

  const dataFormatOptions = [
    'JSON',
    'XML',
    'CSV',
    'FHIR',
    'HL7',
    'EDI',
  ];

  return (
    <div className="space-y-6">
      {/* API Endpoints Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>API Endpoints</span>
          </CardTitle>
          <CardDescription>
            Configure the API endpoints you need for integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Endpoint */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium">Add New Endpoint</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endpoint-name">Endpoint Name</Label>
                <Input
                  id="endpoint-name"
                  value={newEndpoint.name}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
                  placeholder="Patient Data API"
                />
              </div>
              <div>
                <Label htmlFor="endpoint-url">URL</Label>
                <Input
                  id="endpoint-url"
                  value={newEndpoint.url}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, url: e.target.value })}
                  placeholder="https://api.example.com/patients"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="endpoint-method">Method</Label>
                <Select
                  value={newEndpoint.method}
                  onValueChange={(value: any) => setNewEndpoint({ ...newEndpoint, method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="endpoint-format">Data Format</Label>
                <Select
                  value={newEndpoint.data_format}
                  onValueChange={(value: any) => setNewEndpoint({ ...newEndpoint, data_format: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JSON">JSON</SelectItem>
                    <SelectItem value="XML">XML</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                    <SelectItem value="FHIR">FHIR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="endpoint-rate-limit">Rate Limit (per minute)</Label>
                <Input
                  id="endpoint-rate-limit"
                  type="number"
                  value={newEndpoint.rate_limit || ''}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, rate_limit: parseInt(e.target.value) || undefined })}
                  placeholder="60"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="endpoint-description">Description</Label>
              <Textarea
                id="endpoint-description"
                value={newEndpoint.description}
                onChange={(e) => setNewEndpoint({ ...newEndpoint, description: e.target.value })}
                placeholder="Describe the purpose and functionality of this endpoint"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="endpoint-auth"
                  checked={newEndpoint.authentication_required}
                  onCheckedChange={(checked) => setNewEndpoint({ ...newEndpoint, authentication_required: checked })}
                />
                <Label htmlFor="endpoint-auth">Authentication Required</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="endpoint-webhook"
                  checked={newEndpoint.is_webhook}
                  onCheckedChange={(checked) => setNewEndpoint({ ...newEndpoint, is_webhook: checked })}
                />
                <Label htmlFor="endpoint-webhook">Webhook</Label>
              </div>
            </div>
            <Button onClick={addEndpoint} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Endpoint
            </Button>
          </div>

          {/* Existing Endpoints */}
          {apiData.endpoints.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Configured Endpoints</h4>
              {apiData.endpoints.map((endpoint) => (
                <Card key={endpoint.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <h5 className="font-medium">{endpoint.name}</h5>
                        {endpoint.is_webhook && <Badge variant="secondary">Webhook</Badge>}
                        {endpoint.authentication_required && <Badge variant="secondary">Auth Required</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{endpoint.url}</p>
                      {endpoint.description && (
                        <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">{endpoint.data_format}</Badge>
                        {endpoint.rate_limit && (
                          <Badge variant="outline">{endpoint.rate_limit}/min</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeEndpoint(endpoint.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authentication Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Authentication Methods</span>
          </CardTitle>
          <CardDescription>
            Select the authentication methods you want to support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {authMethodOptions.map((method) => (
              <div key={method} className="flex items-center space-x-2">
                <Checkbox
                  id={method}
                  checked={apiData.authentication_methods.includes(method)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateApiData({
                        authentication_methods: [...apiData.authentication_methods, method],
                      });
                    } else {
                      updateApiData({
                        authentication_methods: apiData.authentication_methods.filter(m => m !== method),
                      });
                    }
                  }}
                />
                <Label htmlFor={method}>{method}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Formats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Formats</span>
          </CardTitle>
          <CardDescription>
            Select the data formats you need to support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {dataFormatOptions.map((format) => (
              <div key={format} className="flex items-center space-x-2">
                <Checkbox
                  id={format}
                  checked={apiData.data_formats.includes(format)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateApiData({
                        data_formats: [...apiData.data_formats, format],
                      });
                    } else {
                      updateApiData({
                        data_formats: apiData.data_formats.filter(f => f !== format),
                      });
                    }
                  }}
                />
                <Label htmlFor={format}>{format}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Requirements</span>
          </CardTitle>
          <CardDescription>
            Configure security settings for your API integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(apiData.security_requirements).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="flex-1">
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Label>
              <Switch
                id={key}
                checked={value}
                onCheckedChange={(checked) => updateSecurityRequirement(key as any, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Documentation Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Documentation Preferences</span>
          </CardTitle>
          <CardDescription>
            Select the documentation and tools you need
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(apiData.documentation_preferences).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="flex-1">
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Label>
              <Switch
                id={key}
                checked={value}
                onCheckedChange={(checked) => updateDocumentationPreference(key as any, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
