import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, Database, MessageSquare, Globe, Settings, 
  Stethoscope, ShieldCheck, CreditCard, FileText,
  Building, Workflow, GitBranch, Server, Phone,
  CheckCircle, AlertCircle, Clock, Zap, Loader2, Plus
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useConnectorMetrics } from '@/hooks/useConnectorMetrics';
import { ConnectorCreationWizard } from './enhanced-connector/ConnectorCreationWizard';
import { CONNECTOR_BRANDS, searchConnectorBrands } from './enhanced-connector/ConnectorBrandRegistry';
import { useConnectorAssignments } from '@/hooks/useConnectorAssignments';

interface Connector {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<any>;
  description: string;
  status: 'connected' | 'available' | 'configuring';
  apiEndpoint?: string;
  authMethod: 'api_key' | 'oauth' | 'basic' | 'token';
  documentation?: string;
  capabilities: string[];
  rateLimit?: string;
  cost: 'Free' | 'Paid' | 'Enterprise';
  usage_count?: number;
  success_rate?: number;
}

const initialConnectors: Connector[] = [
  // Language Models & Gen AI
  {
    id: 'openai-gpt4',
    name: 'OpenAI GPT-4',
    category: 'Language Models',
    icon: Bot,
    description: 'Advanced language model for conversation and text generation',
    status: 'connected',
    apiEndpoint: 'https://api.openai.com/v1',
    authMethod: 'api_key',
    capabilities: ['Text Generation', 'Conversation', 'Code Generation', 'Analysis'],
    rateLimit: '10,000 tokens/min',
    cost: 'Paid',
    usage_count: 1247,
    success_rate: 98.5
  },
  {
    id: 'anthropic-claude',
    name: 'Anthropic Claude',
    category: 'Language Models',
    icon: Bot,
    description: 'Constitutional AI for safe and helpful AI assistance',
    status: 'available',
    apiEndpoint: 'https://api.anthropic.com/v1',
    authMethod: 'api_key',
    capabilities: ['Conversation', 'Analysis', 'Writing', 'Reasoning'],
    rateLimit: '5,000 tokens/min',
    cost: 'Paid'
  },
  // CRM Systems
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'CRM Systems',
    icon: Building,
    description: 'Customer relationship management and sales automation',
    status: 'connected',
    apiEndpoint: 'https://api.salesforce.com/v2',
    authMethod: 'oauth',
    capabilities: ['Contact Management', 'Lead Tracking', 'Opportunity Management', 'Reporting'],
    rateLimit: '1,000 calls/hour',
    cost: 'Enterprise',
    usage_count: 842,
    success_rate: 99.2
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'CRM Systems',
    icon: Building,
    description: 'Inbound marketing, sales, and customer service platform',
    status: 'available',
    apiEndpoint: 'https://api.hubapi.com/crm/v3',
    authMethod: 'api_key',
    capabilities: ['Contact Management', 'Email Marketing', 'Lead Scoring', 'Analytics'],
    rateLimit: '40,000 calls/day',
    cost: 'Paid'
  },
  // Databases
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'Databases',
    icon: Database,
    description: 'Advanced open source relational database',
    status: 'connected',
    authMethod: 'basic',
    capabilities: ['CRUD Operations', 'Complex Queries', 'Transactions', 'JSON Support'],
    cost: 'Free',
    usage_count: 2103,
    success_rate: 99.8
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'Databases',
    icon: Database,
    description: 'Document-oriented NoSQL database',
    status: 'available',
    apiEndpoint: 'mongodb://connection-string',
    authMethod: 'basic',
    capabilities: ['Document Storage', 'Aggregation', 'Indexing', 'Replication'],
    cost: 'Free'
  },
  // Healthcare APIs
  {
    id: 'epic-fhir',
    name: 'Epic FHIR',
    category: 'Healthcare APIs',
    icon: Stethoscope,
    description: 'Healthcare interoperability standard for patient data exchange',
    status: 'connected',
    apiEndpoint: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
    authMethod: 'oauth',
    capabilities: ['Patient Records', 'Appointments', 'Medications', 'Lab Results'],
    rateLimit: '1,000 calls/hour',
    cost: 'Enterprise',
    usage_count: 456,
    success_rate: 97.1
  },
  {
    id: 'cerner-smart',
    name: 'Cerner SMART',
    category: 'Healthcare APIs',
    icon: Stethoscope,
    description: 'SMART on FHIR platform for healthcare app integration',
    status: 'available',
    apiEndpoint: 'https://fhir-myrecord.cerner.com/r4',
    authMethod: 'oauth',
    capabilities: ['Clinical Data', 'Patient Portal', 'Provider Workflow', 'Analytics'],
    rateLimit: '2,000 calls/hour',
    cost: 'Enterprise'
  }
];

export const SystemConnectors = () => {
  console.log('🔍 SystemConnectors component rendered!');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [connectors, setConnectors] = useState<Connector[]>(initialConnectors);
  const [showCreateConnector, setShowCreateConnector] = useState(false);
  const [showConnectorWizard, setShowConnectorWizard] = useState(false);
  const [createMode, setCreateMode] = useState<'missing' | 'custom'>('missing');
  const [selectedMissingConnector, setSelectedMissingConnector] = useState('');
  const [newConnector, setNewConnector] = useState({
    name: '',
    category: '',
    description: '',
    apiEndpoint: '',
    authMethod: 'api_key' as const,
    capabilities: [] as string[],
    cost: 'Free' as const
  });

  // Use the connector metrics hook
  const { 
    connectors: dbConnectors, 
    isLoadingConnectors: connectorsLoading, 
    refetchConnectors,
    createConnector
  } = useConnectorMetrics();

  // Use the assignments hook for assignment functionality
  const {
    assignments,
    availableConnectors: assignableConnectors,
    assignConnector,
    updateAssignment,
    removeAssignment,
    getTaskAssignment,
    getAssignmentsByType
  } = useConnectorAssignments();

  // Log database connectors for debugging
  React.useEffect(() => {
    console.log('SystemConnectors: Database connectors updated:', dbConnectors);
    console.log('SystemConnectors: Total connectors found:', dbConnectors?.length || 0);
    if (dbConnectors?.length === 0) {
      console.log('🚨 No database connectors found! Make sure you create some connectors first.');
    }
  }, [dbConnectors]);

  const categories = ['All', 'Language Models', 'CRM Systems', 'Databases', 'Healthcare APIs', 'Communication', 'Insurance', 'Development', 'Automation', 'Analytics'];

  // Filter connectors based on search and category
  const filteredConnectors = connectors.filter(connector => {
    const matchesSearch = connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connector.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || connector.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get suggestions for missing connectors
  const getMissingConnectorSuggestions = () => {
    const existingNames = connectors.map(c => c.name.toLowerCase());
    return CONNECTOR_BRANDS.filter(brand => 
      !existingNames.includes(brand.name.toLowerCase())
    ).slice(0, 20);
  };

  const getStatusIcon = (status: Connector['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'configuring': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'available': return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: Connector['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'configuring': return 'bg-yellow-100 text-yellow-800';
      case 'available': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCostColor = (cost: Connector['cost']) => {
    switch (cost) {
      case 'Free': return 'bg-green-100 text-green-800';
      case 'Paid': return 'bg-blue-100 text-blue-800';
      case 'Enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">System Connectors</h2>
        <p className="text-muted-foreground">Configure, create, and assign integrations with external systems</p>
        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✅ <strong>Consolidated System!</strong> This is your one-stop hub for all connector functionality: 
            Browse existing connectors, create new ones, configure settings, and assign them to tasks.
          </p>
        </div>
      </div>

      {/* Consolidated Action Tabs */}
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse & Configure</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="wizard">Enhanced Wizard</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search connectors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Connectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConnectors.map((connector) => {
              const IconComponent = connector.icon;
              
              return (
                <Card key={connector.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-8 w-8 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{connector.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{connector.category}</Badge>
                            <Badge className={getCostColor(connector.cost)}>{connector.cost}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(connector.status)}
                        <Badge className={getStatusColor(connector.status)}>
                          {connector.status}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="mt-3">
                      {connector.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {connector.apiEndpoint && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">API Endpoint</h4>
                        <p className="text-xs font-mono bg-muted p-2 rounded truncate">
                          {connector.apiEndpoint}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Authentication</h4>
                      <Badge variant="secondary" className="text-xs">
                        {connector.authMethod.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {connector.rateLimit && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Rate Limit</h4>
                        <p className="text-xs text-muted-foreground">{connector.rateLimit}</p>
                      </div>
                    )}

                    {/* Capabilities */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Capabilities</h4>
                      <div className="flex flex-wrap gap-1">
                        {connector.capabilities.slice(0, 3).map((capability, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                        {connector.capabilities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{connector.capabilities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Usage Stats */}
                    {connector.usage_count !== undefined && (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Usage: {connector.usage_count.toLocaleString()}</span>
                          {connector.success_rate !== undefined && (
                            <span>Success: {connector.success_rate}%</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {connector.status === 'available' && (
                        <Button 
                          size="sm" 
                          onClick={() => setConfiguring(connector.id)}
                          className="flex-1"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                      )}
                      {connector.status === 'connected' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setConfiguring(connector.id)}
                          className="flex-1"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Settings
                        </Button>
                      )}
                      {connector.documentation && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(connector.documentation, '_blank')}
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredConnectors.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No connectors found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your search terms or category filter, or create a new connector.
                </p>
                <Button 
                  onClick={() => setShowCreateConnector(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Connector
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Connector</CardTitle>
              <CardDescription>
                Add integrations to expand your system's capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => {
                    setShowCreateConnector(true);
                    setCreateMode('missing');
                    setSelectedMissingConnector('');
                  }}
                  variant="outline"
                  className="flex items-center gap-2 p-6 h-auto"
                >
                  <Plus className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">Add from Library</div>
                    <div className="text-sm text-muted-foreground">Choose from popular services</div>
                  </div>
                </Button>
                <Button 
                  onClick={() => {
                    setShowCreateConnector(true);
                    setCreateMode('custom');
                    setSelectedMissingConnector('');
                  }}
                  className="flex items-center gap-2 p-6 h-auto"
                >
                  <Zap className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">Create Custom</div>
                    <div className="text-sm opacity-90">Build your own integration</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wizard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Connector Wizard</CardTitle>
              <CardDescription>
                Use our advanced wizard to create fully configured connectors with automatic testing and validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowConnectorWizard(true)}
                className="flex items-center gap-2"
                size="lg"
              >
                <Workflow className="h-5 w-5" />
                Launch Enhanced Wizard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connector Assignments</CardTitle>
              <CardDescription>
                Manage which connectors are assigned to specific tasks and workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignments && assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{assignment.task_id}</h4>
                        <p className="text-sm text-muted-foreground">{assignment.task_type}</p>
                        <p className="text-sm text-muted-foreground">
                          Assigned to: {assignment.connector?.name || 'Unknown'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateAssignment.mutate({
                            assignmentId: assignment.id,
                            updates: { assignment_config: assignment.assignment_config }
                          })}
                          disabled={updateAssignment.isPending}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => removeAssignment.mutate(assignment.id)}
                          disabled={removeAssignment.isPending}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No assignments yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Connector assignments will appear here when you assign connectors to specific tasks.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Connector Dialog */}
      <Dialog open={showCreateConnector} onOpenChange={setShowCreateConnector}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {createMode === 'missing' ? 'Add Connector from Library' : 'Create Custom Connector'}
            </DialogTitle>
            <DialogDescription>
              {createMode === 'missing' 
                ? 'Choose from our library of popular service integrations'
                : 'Create a custom connector for your specific integration needs'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {createMode === 'missing' ? (
              <>
                <div>
                  <Label htmlFor="connector-select">Select a connector to add</Label>
                  <Select value={selectedMissingConnector} onValueChange={setSelectedMissingConnector}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a connector..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getMissingConnectorSuggestions().map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          <div className="flex items-center gap-2">
                            <span>{brand.name}</span>
                            <Badge variant="outline" className="text-xs">{brand.category}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedMissingConnector && (
                  <div className="p-4 bg-muted rounded-lg">
                    {(() => {
                      const selected = getMissingConnectorSuggestions().find(b => b.id === selectedMissingConnector);
                      return selected ? (
                        <div>
                          <h4 className="font-medium">{selected.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{selected.category}</Badge>
                            <Badge variant="outline">{selected.type}</Badge>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Connector Name</Label>
                    <Input
                      id="name"
                      value={newConnector.name}
                      onChange={(e) => setNewConnector(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., My API Service"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newConnector.category} onValueChange={(value) => setNewConnector(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c !== 'All').map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newConnector.description}
                    onChange={(e) => setNewConnector(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this connector does..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="endpoint">API Endpoint (optional)</Label>
                    <Input
                      id="endpoint"
                      value={newConnector.apiEndpoint}
                      onChange={(e) => setNewConnector(prev => ({ ...prev, apiEndpoint: e.target.value }))}
                      placeholder="https://api.example.com/v1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="auth">Authentication Method</Label>
                    <Select value={newConnector.authMethod} onValueChange={(value: any) => setNewConnector(prev => ({ ...prev, authMethod: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="api_key">API Key</SelectItem>
                        <SelectItem value="oauth">OAuth</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                        <SelectItem value="token">Bearer Token</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateConnector(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (createMode === 'missing' && selectedMissingConnector) {
                  const selectedConnector = getMissingConnectorSuggestions().find(b => b.id === selectedMissingConnector);
                  if (!selectedConnector) return;
                  
                  try {
                    await createConnector.mutateAsync({
                      name: selectedConnector.name,
                      description: selectedConnector.description,
                      type: selectedConnector.type,
                      category: selectedConnector.category,
                      status: 'inactive',
                      base_url: selectedConnector.baseUrl || '',
                      auth_type: selectedConnector.authTypes[0],
                      configuration: { 
                        commonEndpoints: selectedConnector.commonEndpoints || [],
                        authTypes: selectedConnector.authTypes
                      },
                      endpoints: [],
                      usage_count: 0,
                      success_rate: 0
                    });
                    
                    setSelectedMissingConnector('');
                    setShowCreateConnector(false);
                    
                    toast({
                      title: "✅ Connector Added Successfully",
                      description: `"${selectedConnector.name}" has been added. Configure it to start connecting.`,
                    });
                    
                  } catch (error) {
                    console.error('Failed to add connector:', error);
                    toast({
                      title: "Error",
                      description: "Failed to add connector. Please try again.",
                      variant: "destructive"
                    });
                  }
                } else {
                  if (!newConnector.name.trim() || !newConnector.category) {
                    toast({
                      title: "Validation Error",
                      description: "Please fill in the connector name and category.",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                   try {
                     await createConnector.mutateAsync({
                       name: newConnector.name,
                       description: newConnector.description || 'Custom connector',
                       type: 'external_service',
                       category: newConnector.category,
                       status: 'inactive',
                       base_url: newConnector.apiEndpoint,
                       auth_type: newConnector.authMethod,
                       configuration: {},
                       endpoints: [],
                       usage_count: 0,
                       success_rate: 0
                     });
                     
                      // Connector is now created in Supabase and will be available system-wide
                     
                     setNewConnector({
                       name: '',
                       category: '',
                       description: '',
                       apiEndpoint: '',
                       authMethod: 'api_key',
                       capabilities: [],
                       cost: 'Free'
                     });
                     setShowCreateConnector(false);
                     
                     toast({
                       title: "✅ Connector Created Successfully",
                       description: `"${newConnector.name}" has been created and is now available in the wizard.`,
                     });
                    
                  } catch (error) {
                    console.error('Failed to create connector:', error);
                    toast({
                      title: "Error",
                      description: "Failed to create connector. Please try again.",
                      variant: "destructive"
                    });
                  }
                }
              }}
              disabled={createConnector.isPending}
            >
              {createConnector.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {createMode === 'missing' ? 'Add Connector' : 'Create Connector'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Connector Creation Wizard */}
      {showConnectorWizard && (
        <ConnectorCreationWizard
          isOpen={showConnectorWizard}
          onClose={() => {
            console.log('Closing wizard');
            setShowConnectorWizard(false);
          }}
          onConnectorCreated={(newConnector) => {
            console.log('Connector created via wizard:', newConnector);
            setShowConnectorWizard(false);
            setShowCreateConnector(false);
            // Refresh the connectors list
            refetchConnectors?.();
            toast({
              title: "✅ Connector Created via Wizard",
              description: `"${newConnector.name}" has been fully configured and is ready to use.`,
            });
          }}
          agentId="current-session"
          availableActions={[
            { id: 'data-fetch', name: 'Fetch Data', type: 'read', category: 'data', description: 'Retrieve data from external systems' },
            { id: 'data-update', name: 'Update Records', type: 'write', category: 'data', description: 'Update records in external systems' },
            { id: 'data-create', name: 'Create Records', type: 'write', category: 'data', description: 'Create new records in external systems' },
            { id: 'status-check', name: 'Health Check', type: 'read', category: 'monitoring', description: 'Check system status and health' },
            { id: 'notification-send', name: 'Send Notification', type: 'action', category: 'communication', description: 'Send notifications or messages' }
          ]}
        />
      )}
    </div>
  );
};