
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Shield, 
  Database, 
  Code, 
  Copy,
  BookOpen,
  Key,
  FileText,
  Link
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiIntegrationDetails } from '@/hooks/usePublishedApiDetails';

interface ApiDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiDetails: ApiIntegrationDetails | null;
  isLoading: boolean;
}

const ApiDetailsDialog = ({ open, onOpenChange, apiDetails, isLoading }: ApiDetailsDialogProps) => {
  const { toast } = useToast();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied",
      description: "Code has been copied to clipboard",
    });
  };

  if (!apiDetails) return null;

  const jsExample = `// JavaScript SDK Example
import { ${apiDetails.name.replace(/\s+/g, '')}Client } from '@healthcare-api/${apiDetails.name.toLowerCase().replace(/\s+/g, '-')}-sdk';

const client = new ${apiDetails.name.replace(/\s+/g, '')}Client({
  apiKey: 'YOUR_API_KEY',
  baseUrl: '${apiDetails.base_url || 'https://api.healthcare.com'}'
});

// Fetch patient data
const patients = await client.patients.list({
  limit: 10,
  filters: { active: true }
});

// Create new patient
const newPatient = await client.patients.create({
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01'
});`;

  const curlExample = `# cURL Example
curl -X GET "${apiDetails.base_url || 'https://api.healthcare.com'}/v1/patients" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json"

# Create patient
curl -X POST "${apiDetails.base_url || 'https://api.healthcare.com'}/v1/patients" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01"
  }'`;

  const pythonExample = `# Python Example
import requests
from healthcare_api import HealthcareClient

# Using SDK
client = HealthcareClient(
    api_key='YOUR_API_KEY',
    base_url='${apiDetails.base_url || 'https://api.healthcare.com'}'
)

# Fetch patients
patients = client.patients.list(limit=10, active=True)

# Using requests directly
headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    '${apiDetails.base_url || 'https://api.healthcare.com'}/v1/patients',
    headers=headers
)

data = response.json()`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {apiDetails.name}
            <Badge variant="outline">v{apiDetails.version}</Badge>
            <Badge variant="secondary">{apiDetails.category}</Badge>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="p-8 text-center">Loading API details...</div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="authentication">Auth</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="schema">Schema</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Basic Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Name:</strong> {apiDetails.name}</div>
                        <div><strong>Version:</strong> {apiDetails.version}</div>
                        <div><strong>Category:</strong> {apiDetails.category}</div>
                        {apiDetails.base_url && (
                          <div><strong>Base URL:</strong> {apiDetails.base_url}</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Endpoints:</strong> {apiDetails.endpoints.length}</div>
                        <div><strong>RLS Policies:</strong> {apiDetails.rls_policies.length}</div>
                        <div><strong>Data Mappings:</strong> {apiDetails.data_mappings.length}</div>
                        <div><strong>Database Tables:</strong> {apiDetails.database_schema.tables.length}</div>
                      </div>
                    </div>
                  </div>
                  
                  {apiDetails.description && (
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{apiDetails.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-4">
              <div className="space-y-3">
                {apiDetails.endpoints.map((endpoint) => (
                  <Card key={endpoint.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{endpoint.method}</Badge>
                          <code className="text-sm bg-muted px-2 py-1 rounded">{endpoint.url}</code>
                        </div>
                        <div className="flex gap-1">
                          {endpoint.is_public && (
                            <Badge variant="secondary" className="text-xs">Public</Badge>
                          )}
                          {endpoint.authentication && (
                            <Badge variant="outline" className="text-xs">Auth Required</Badge>
                          )}
                        </div>
                      </div>
                      <h5 className="font-medium">{endpoint.name}</h5>
                      <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="authentication" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Authentication Process
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">How to Get Started</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">1</span>
                        <span>Register for a developer account</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">2</span>
                        <span>Submit an application for API access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">3</span>
                        <span>Wait for approval (typically 1-2 business days)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">4</span>
                        <span>Receive your API key via email</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">5</span>
                        <span>Start making API calls</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Authentication Method</h4>
                    <div className="bg-muted p-3 rounded-lg">
                      <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Include your API key in the Authorization header of every request.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Row-Level Security Policies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {apiDetails.rls_policies.map((policy) => (
                      <div key={policy.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{policy.policy_name}</h5>
                          <Badge variant="outline">{policy.operation}</Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <div><strong>Table:</strong> {policy.table_name}</div>
                          <div><strong>Condition:</strong> <code className="bg-muted px-1 rounded">{policy.condition}</code></div>
                          {policy.description && (
                            <div><strong>Description:</strong> {policy.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Mappings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {apiDetails.data_mappings.map((mapping) => (
                      <div key={mapping.id} className="border rounded-lg p-3">
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <strong>Mapping:</strong>
                            <code className="bg-blue-50 text-blue-700 px-1 rounded">{mapping.source_field}</code>
                            <span>→</span>
                            <code className="bg-green-50 text-green-700 px-1 rounded">{mapping.target_table}.{mapping.target_field}</code>
                          </div>
                          {mapping.transformation && (
                            <div><strong>Transformation:</strong> {mapping.transformation}</div>
                          )}
                          {mapping.validation && (
                            <div><strong>Validation:</strong> {mapping.validation}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schema" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Schema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apiDetails.database_schema.tables.map((table) => (
                      <div key={table.name} className="border rounded-lg p-4">
                        <h5 className="font-medium mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {table.name}
                        </h5>
                        
                        <div className="mb-3">
                          <h6 className="text-sm font-medium mb-2">Columns</h6>
                          <div className="space-y-1">
                            {table.columns.map((column) => (
                              <div key={column.name} className="flex items-center gap-2 text-sm">
                                <code className="bg-muted px-1 rounded">{column.name}</code>
                                <Badge variant="outline" className="text-xs">{column.type}</Badge>
                                {!column.nullable && <Badge variant="secondary" className="text-xs">NOT NULL</Badge>}
                                {column.description && (
                                  <span className="text-muted-foreground">- {column.description}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {table.foreign_keys.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium mb-2">Foreign Keys</h6>
                            <div className="space-y-1">
                              {table.foreign_keys.map((fk, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <Link className="h-3 w-3" />
                                  <code className="bg-muted px-1 rounded">{fk.column}</code>
                                  <span>→</span>
                                  <code className="bg-muted px-1 rounded">{fk.references_table}.{fk.references_column}</code>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      JavaScript/Node.js
                      <Button size="sm" variant="outline" onClick={() => handleCopyCode(jsExample)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                      <code>{jsExample}</code>
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      cURL
                      <Button size="sm" variant="outline" onClick={() => handleCopyCode(curlExample)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                      <code>{curlExample}</code>
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Python
                      <Button size="sm" variant="outline" onClick={() => handleCopyCode(pythonExample)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                      <code>{pythonExample}</code>
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>SDK Installation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-2">JavaScript/Node.js</h5>
                      <div className="bg-muted p-3 rounded-lg">
                        <code className="text-sm">npm install @healthcare-api/{apiDetails.name.toLowerCase().replace(/\s+/g, '-')}-sdk</code>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Python</h5>
                      <div className="bg-muted p-3 rounded-lg">
                        <code className="text-sm">pip install healthcare-api-{apiDetails.name.toLowerCase().replace(/\s+/g, '-')}</code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApiDetailsDialog;
