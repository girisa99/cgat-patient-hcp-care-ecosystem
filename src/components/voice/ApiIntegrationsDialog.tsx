import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Cloud, 
  Webhook, 
  Plus, 
  TestTube, 
  Edit, 
  Trash2,
  ExternalLink,
  Activity,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { useForm } from 'react-hook-form';

interface ApiIntegrationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: 'internal' | 'external' | 'webhooks';
}

interface ApiIntegrationForm {
  name: string;
  type: string;
  direction: string;
  purpose: string;
  category: string;
  base_url: string;
  description: string;
}

interface WebhookForm {
  name: string;
  url: string;
  events: string;
  description: string;
}

export const ApiIntegrationsDialog = ({ open, onOpenChange, initialTab = 'internal' }: ApiIntegrationsDialogProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const {
    apiIntegrations,
    apiEndpoints,
    isLoading,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testIntegration,
    isCreating,
    isUpdating,
    isDeleting,
    isTesting
  } = useApiIntegrations();

  const integrationForm = useForm<ApiIntegrationForm>({
    defaultValues: {
      name: '',
      type: 'REST',
      direction: 'bidirectional',
      purpose: 'integration',
      category: 'internal',
      base_url: '',
      description: ''
    }
  });

  const webhookForm = useForm<WebhookForm>({
    defaultValues: {
      name: '',
      url: '',
      events: '',
      description: ''
    }
  });

  const handleCreateIntegration = (data: ApiIntegrationForm) => {
    createIntegration.mutate({
      ...data,
      status: 'active',
      endpoints_count: 0
    });
    integrationForm.reset();
    setShowAddForm(false);
  };

  const handleCreateWebhook = (data: WebhookForm) => {
    // For now, create as an integration with webhook type
    createIntegration.mutate({
      name: data.name,
      type: 'webhook',
      direction: 'inbound',
      purpose: 'webhook',
      category: 'external',
      base_url: data.url,
      description: data.description,
      status: 'active',
      endpoints_count: 1,
      webhook_config: {
        url: data.url,
        events: data.events.split(',').map(e => e.trim())
      }
    });
    webhookForm.reset();
    setShowAddForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'webhook': return <Webhook className="h-4 w-4" />;
      case 'graphql': return <Cloud className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const internalApis = apiIntegrations?.filter(api => 
    api.category === 'internal' || api.direction === 'internal'
  ) || [];

  const externalApis = apiIntegrations?.filter(api => 
    api.category === 'external' || api.direction === 'external' || api.category === 'third-party'
  ) || [];

  const webhooks = apiIntegrations?.filter(api => 
    api.type === 'webhook'
  ) || [];

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-center p-8">Loading API integrations...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            API Integrations & Connectors Management
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'internal' | 'external' | 'webhooks')} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="internal" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Internal APIs ({internalApis.length})
            </TabsTrigger>
            <TabsTrigger value="external" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              External APIs ({externalApis.length})
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Webhooks ({webhooks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="internal" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Internal API Integrations</h3>
                <p className="text-sm text-muted-foreground">Manage internal system APIs and services</p>
              </div>
              <Button onClick={() => setShowAddForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Internal API
              </Button>
            </div>

            {showAddForm && activeTab === 'internal' && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Internal API Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={integrationForm.handleSubmit(handleCreateIntegration)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>API Name</Label>
                        <Input 
                          {...integrationForm.register('name', { required: true })}
                          placeholder="e.g., User Management API"
                        />
                      </div>
                      <div>
                        <Label>API Type</Label>
                        <Select 
                          value={integrationForm.watch('type')} 
                          onValueChange={(value) => integrationForm.setValue('type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="REST">REST API</SelectItem>
                            <SelectItem value="GraphQL">GraphQL</SelectItem>
                            <SelectItem value="gRPC">gRPC</SelectItem>
                            <SelectItem value="SOAP">SOAP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Base URL</Label>
                        <Input 
                          {...integrationForm.register('base_url')}
                          placeholder="https://api.internal.com/v1"
                        />
                      </div>
                      <div>
                        <Label>Purpose</Label>
                        <Select 
                          value={integrationForm.watch('purpose')} 
                          onValueChange={(value) => integrationForm.setValue('purpose', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="integration">Integration</SelectItem>
                            <SelectItem value="authentication">Authentication</SelectItem>
                            <SelectItem value="data-sync">Data Sync</SelectItem>
                            <SelectItem value="monitoring">Monitoring</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea 
                        {...integrationForm.register('description')}
                        placeholder="Describe the API functionality and use case"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={isCreating}>
                        {isCreating ? 'Creating...' : 'Create API Integration'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {internalApis.map((api) => (
                <Card key={api.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(api.type)}
                        <div>
                          <h4 className="font-medium">{api.name}</h4>
                          <p className="text-xs text-muted-foreground">{api.type} • {api.purpose}</p>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(api.status)}>
                        {api.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {api.base_url && (
                        <div className="text-sm">
                          <span className="font-medium">Base URL:</span>
                          <p className="text-muted-foreground break-all">{api.base_url}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {api.endpoints_count} endpoints
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {api.direction}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => testIntegration.mutate(api.id)}
                          disabled={isTesting}
                          className="flex-1"
                        >
                          <TestTube className="h-3 w-3 mr-2" />
                          {isTesting ? 'Testing...' : 'Test'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingItem(api)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => deleteIntegration.mutate(api.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {internalApis.length === 0 && (
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Internal APIs</h3>
                <p className="text-muted-foreground text-sm mb-4">Add your first internal API integration</p>
                <Button onClick={() => setShowAddForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Internal API
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="external" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">External API Integrations</h3>
                <p className="text-sm text-muted-foreground">Manage third-party API connections and services</p>
              </div>
              <Button onClick={() => setShowAddForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add External API
              </Button>
            </div>

            {showAddForm && activeTab === 'external' && (
              <Card>
                <CardHeader>
                  <CardTitle>Add External API Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={integrationForm.handleSubmit((data) => handleCreateIntegration({
                    ...data,
                    category: 'external'
                  }))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>API Name</Label>
                        <Input 
                          {...integrationForm.register('name', { required: true })}
                          placeholder="e.g., Stripe Payment API"
                        />
                      </div>
                      <div>
                        <Label>API Type</Label>
                        <Select 
                          value={integrationForm.watch('type')} 
                          onValueChange={(value) => integrationForm.setValue('type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="REST">REST API</SelectItem>
                            <SelectItem value="GraphQL">GraphQL</SelectItem>
                            <SelectItem value="SDK">SDK</SelectItem>
                            <SelectItem value="OAuth">OAuth</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Base URL</Label>
                        <Input 
                          {...integrationForm.register('base_url')}
                          placeholder="https://api.external-service.com"
                        />
                      </div>
                      <div>
                        <Label>Purpose</Label>
                        <Select 
                          value={integrationForm.watch('purpose')} 
                          onValueChange={(value) => integrationForm.setValue('purpose', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="payment">Payment Processing</SelectItem>
                            <SelectItem value="communication">Communication</SelectItem>
                            <SelectItem value="analytics">Analytics</SelectItem>
                            <SelectItem value="storage">File Storage</SelectItem>
                            <SelectItem value="ai-ml">AI/ML Services</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea 
                        {...integrationForm.register('description')}
                        placeholder="Describe the external API and its integration purpose"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={isCreating}>
                        {isCreating ? 'Creating...' : 'Create External API'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {externalApis.map((api) => (
                <Card key={api.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cloud className="h-4 w-4" />
                        <div>
                          <h4 className="font-medium">{api.name}</h4>
                          <p className="text-xs text-muted-foreground">{api.type} • {api.purpose}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(api.status)}>
                          {api.status}
                        </Badge>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {api.base_url && (
                        <div className="text-sm">
                          <span className="font-medium">Base URL:</span>
                          <p className="text-muted-foreground break-all">{api.base_url}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          External Service
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {api.direction}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => testIntegration.mutate(api.id)}
                          disabled={isTesting}
                          className="flex-1"
                        >
                          <TestTube className="h-3 w-3 mr-2" />
                          {isTesting ? 'Testing...' : 'Test'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingItem(api)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => deleteIntegration.mutate(api.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {externalApis.length === 0 && (
              <div className="text-center py-12">
                <Cloud className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No External APIs</h3>
                <p className="text-muted-foreground text-sm mb-4">Connect to external services and APIs</p>
                <Button onClick={() => setShowAddForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add External API
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Webhook Configurations</h3>
                <p className="text-sm text-muted-foreground">Manage webhook endpoints and event handlers</p>
              </div>
              <Button onClick={() => setShowAddForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Webhook
              </Button>
            </div>

            {showAddForm && activeTab === 'webhooks' && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Webhook Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={webhookForm.handleSubmit(handleCreateWebhook)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Webhook Name</Label>
                        <Input 
                          {...webhookForm.register('name', { required: true })}
                          placeholder="e.g., Payment Success Webhook"
                        />
                      </div>
                      <div>
                        <Label>Webhook URL</Label>
                        <Input 
                          {...webhookForm.register('url', { required: true })}
                          placeholder="https://your-app.com/webhook/payment"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Events (comma-separated)</Label>
                      <Input 
                        {...webhookForm.register('events')}
                        placeholder="payment.success, payment.failed, user.created"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea 
                        {...webhookForm.register('description')}
                        placeholder="Describe the webhook purpose and events it handles"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={isCreating}>
                        {isCreating ? 'Creating...' : 'Create Webhook'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {webhooks.map((webhook) => (
                <Card key={webhook.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Webhook className="h-4 w-4" />
                        <div>
                          <h4 className="font-medium">{webhook.name}</h4>
                          <p className="text-xs text-muted-foreground">Webhook Endpoint</p>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(webhook.status)}>
                        {webhook.status === 'active' ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="font-medium">URL:</span>
                        <p className="text-muted-foreground break-all">{webhook.base_url}</p>
                      </div>
                      
                      {webhook.webhook_config?.events && (
                        <div className="flex flex-wrap gap-1">
                          {webhook.webhook_config.events.map((event: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => testIntegration.mutate(webhook.id)}
                          disabled={isTesting}
                          className="flex-1"
                        >
                          <TestTube className="h-3 w-3 mr-2" />
                          {isTesting ? 'Testing...' : 'Test'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingItem(webhook)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => deleteIntegration.mutate(webhook.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {webhooks.length === 0 && (
              <div className="text-center py-12">
                <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Webhooks</h3>
                <p className="text-muted-foreground text-sm mb-4">Configure webhook endpoints for event handling</p>
                <Button onClick={() => setShowAddForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Webhook
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};