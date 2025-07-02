
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Upload, 
  FileText, 
  Code, 
  Share,
  Zap,
  CheckCircle,
  Settings,
  Globe,
  Archive
} from 'lucide-react';
import { useUnifiedPageData } from '@/hooks/useUnifiedPageData';

export const PostmanIntegrationTab: React.FC = () => {
  const { apiServices } = useUnifiedPageData();
  const [selectedApis, setSelectedApis] = useState<string[]>([]);

  console.log('🚀 Postman Integration Tab with collection management');

  const handleGenerateCollection = async (apiId: string) => {
    const api = apiServices.data.find(a => a.id === apiId);
    if (!api) return;

    const collection = {
      info: {
        name: `${api.name} - API Collection`,
        description: api.description || 'API endpoints collection',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        version: api.version || '1.0.0'
      },
      variable: [
        {
          key: 'baseUrl',
          value: api.base_url || `{{protocol}}://{{host}}/api/v1/${api.id}`,
          type: 'string'
        }
      ],
      item: Array.from({ length: api.endpoints_count || 3 }, (_, i) => ({
        name: `Endpoint ${i + 1}`,
        request: {
          method: 'GET',
          header: [
            { key: 'Content-Type', value: 'application/json' },
            { key: 'Authorization', value: 'Bearer {{api_key}}' }
          ],
          url: {
            raw: `{{baseUrl}}/endpoint-${i + 1}`,
            host: ['{{baseUrl}}'],
            path: [`endpoint-${i + 1}`]
          }
        }
      }))
    };

    const blob = new Blob([JSON.stringify(collection, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${api.name}-postman-collection.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Postman Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Postman Integration</h3>
          <p className="text-sm text-muted-foreground">
            Generate, manage, and sync Postman collections for all APIs
          </p>
        </div>
        <Button>
          <Archive className="h-4 w-4 mr-2" />
          Generate All Collections
        </Button>
      </div>

      {/* Postman Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{apiServices.data.length}</div>
            <p className="text-xs text-muted-foreground">Available for export</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-600" />
              Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1,234</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-600" />
              Active Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {apiServices.data.filter(api => api.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Share className="h-4 w-4 text-purple-600" />
              Shared Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">45</div>
            <p className="text-xs text-muted-foreground">Public collections</p>
          </CardContent>
        </Card>
      </div>

      {/* Postman Integration Tabs */}
      <Tabs defaultValue="collections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="collections">
          <PostmanCollectionsTab apis={apiServices.data} onGenerateCollection={handleGenerateCollection} />
        </TabsContent>

        <TabsContent value="environments">
          <PostmanEnvironmentsTab />
        </TabsContent>

        <TabsContent value="workspaces">
          <PostmanWorkspacesTab />
        </TabsContent>

        <TabsContent value="settings">
          <PostmanSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Postman Collections Tab
const PostmanCollectionsTab: React.FC<{ 
  apis: any[], 
  onGenerateCollection: (apiId: string) => void 
}> = ({ apis, onGenerateCollection }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          API Collections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {apis.map((api) => (
            <div key={api.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{api.name}</h4>
                    <Badge variant={api.status === 'active' ? 'default' : 'secondary'}>
                      {api.status}
                    </Badge>
                    <Badge variant="outline">
                      v{api.version}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{api.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Endpoints: {api.endpoints_count || 0}</span>
                    <span>Category: {api.category}</span>
                    <span>Type: {api.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onGenerateCollection(api.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Collection
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Postman Environments Tab
const PostmanEnvironmentsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Environment Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Development Environment</h4>
                <Badge variant="outline">Template</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base URL:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">https://api-dev.healthcare.com</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Key:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{{dev_api_key}}'}</code>
                </div>
              </div>
              <Button size="sm" className="mt-3">
                <Download className="h-4 w-4 mr-2" />
                Export Environment
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Production Environment</h4>
                <Badge variant="outline">Template</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base URL:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">https://api.healthcare.com</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Key:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{{prod_api_key}}'}</code>
                </div>
              </div>
              <Button size="sm" className="mt-3">
                <Download className="h-4 w-4 mr-2" />
                Export Environment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Postman Workspaces Tab
const PostmanWorkspacesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Public Workspaces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Healthcare API Workspace</h4>
                <Badge variant="default">Public</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Complete collection of healthcare APIs for developers
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span>12 APIs</span>
                <span>247 Members</span>
                <span>1,234 Forks</span>
              </div>
              <Button size="sm" variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                View Workspace
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Developer Examples</h4>
                <Badge variant="secondary">Community</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Code examples and best practices from the community
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span>25 Examples</span>
                <span>89 Contributors</span>
                <span>567 Downloads</span>
              </div>
              <Button size="sm" variant="outline">
                <Code className="h-4 w-4 mr-2" />
                Browse Examples
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Postman Settings Tab
const PostmanSettingsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Integration Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Postman API Key</label>
            <Input type="password" placeholder="Enter your Postman API key" />
            <p className="text-xs text-muted-foreground mt-1">
              Required for automatic collection sync and workspace management
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Default Workspace</label>
            <Input placeholder="healthcare-apis-workspace" />
            <p className="text-xs text-muted-foreground mt-1">
              Collections will be automatically synced to this workspace
            </p>
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="font-medium text-sm">Auto-sync Collections</p>
              <p className="text-xs text-muted-foreground">
                Automatically update Postman collections when APIs change
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="font-medium text-sm">Collection Templates</p>
              <p className="text-xs text-muted-foreground">
                Use custom templates for generated collections
              </p>
            </div>
            <Button variant="outline" size="sm">
              Manage Templates
            </Button>
          </div>

          <Button className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Save Integration Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded">
            <span className="text-sm">Include authentication examples</span>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <span className="text-sm">Generate environment variables</span>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <span className="text-sm">Include response examples</span>
            <input type="checkbox" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
