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
  CheckCircle, AlertCircle, Clock, Zap, Loader2, Plus,
  Brain, TestTube, Trash2, Eye
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
  
  // Debug state changes
  React.useEffect(() => {
    console.log('🔍 Dialog state changed:', { showCreateConnector, showConnectorWizard });
  }, [showCreateConnector, showConnectorWizard]);
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
  
  // State for connector operations
  const [viewingConnector, setViewingConnector] = useState<any>(null);
  const [testingConnector, setTestingConnector] = useState<string | null>(null);

  // Use the connector metrics hook
  const { 
    connectors: dbConnectors, 
    isLoadingConnectors: connectorsLoading, 
    refetchConnectors,
    createConnector,
    updateConnector,
    deleteConnector,
    testConnector
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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Database Connectors Grid */}
          {connectorsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dbConnectors
                  ?.filter(connector => {
                    const matchesSearch = connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                         connector.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                         connector.category.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesCategory = selectedCategory === 'All' || connector.status === selectedCategory;
                    return matchesSearch && matchesCategory;
                  })
                  ?.map((connector) => (
                    <Card key={connector.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              {connector.type === 'database' && <Database className="h-6 w-6 text-primary" />}
                              {connector.type === 'api' && <Globe className="h-6 w-6 text-primary" />}
                              {connector.type === 'messaging' && <MessageSquare className="h-6 w-6 text-primary" />}
                              {connector.type === 'file_system' && <FileText className="h-6 w-6 text-primary" />}
                              {connector.type === 'external_service' && <Server className="h-6 w-6 text-primary" />}
                              {connector.type === 'ai_model' && <Brain className="h-6 w-6 text-primary" />}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{connector.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{connector.category}</Badge>
                                <Badge variant="outline" className="text-xs">{connector.type}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {connector.status === 'active' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {connector.status === 'inactive' && <AlertCircle className="h-4 w-4 text-gray-500" />}
                            {connector.status === 'testing' && <Clock className="h-4 w-4 text-yellow-500" />}
                            {connector.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                            <Badge className={
                              connector.status === 'active' ? 'bg-green-100 text-green-800' :
                              connector.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                              connector.status === 'error' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {connector.status}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription className="mt-3">
                          {connector.description || 'No description available'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {connector.base_url && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Base URL</h4>
                            <p className="text-xs font-mono bg-muted p-2 rounded truncate">
                              {connector.base_url}
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Authentication</h4>
                          <Badge variant="secondary" className="text-xs">
                            {connector.auth_type.toUpperCase()}
                          </Badge>
                        </div>

                        {/* Usage Stats */}
                        <div className="pt-2 border-t">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Usage: {connector.usage_count || 0}</span>
                            <span>Success: {connector.success_rate || 0}%</span>
                          </div>
                          {connector.last_tested && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Last tested: {new Date(connector.last_tested).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={async () => {
                              setTestingConnector(connector.id);
                              try {
                                await testConnector.mutateAsync(connector.id);
                                toast({
                                  title: "✅ Test Successful",
                                  description: `Connection to ${connector.name} is working properly.`
                                });
                              } catch (error) {
                                toast({
                                  title: "❌ Test Failed",
                                  description: `Failed to connect to ${connector.name}. Check configuration.`,
                                  variant: "destructive"
                                });
                              } finally {
                                setTestingConnector(null);
                              }
                            }}
                            disabled={testingConnector === connector.id}
                            className="flex-1"
                          >
                            {testingConnector === connector.id ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <TestTube className="h-3 w-3 mr-1" />
                            )}
                            Test
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setViewingConnector(connector)}
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setConfiguring(connector.id)}
                            className="flex-1"
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete ${connector.name}? This action cannot be undone.`)) {
                                try {
                                  await deleteConnector.mutateAsync(connector.id);
                                  toast({
                                    title: "✅ Connector Deleted",
                                    description: `${connector.name} has been permanently deleted.`
                                  });
                                } catch (error) {
                                  toast({
                                    title: "❌ Delete Failed",
                                    description: `Failed to delete ${connector.name}. Please try again.`,
                                    variant: "destructive"
                                  });
                                }
                              }
                            }}
                            disabled={deleteConnector.isPending}
                          >
                            {deleteConnector.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {(!dbConnectors || dbConnectors.length === 0) && (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">No connectors found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first connector to get started with system integrations.
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
            </>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Connector</CardTitle>
              <CardDescription>
                Set up new system integrations and data connectors for your agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Quick Create Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => {
                    console.log('🔘 Brand Library button clicked');
                    setShowCreateConnector(true);
                    setCreateMode('missing');
                    setSelectedMissingConnector('');
                  }}
                  variant="outline"
                  className="flex items-center gap-2 p-6 h-auto"
                >
                  <Plus className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">Brand Library</div>
                    <div className="text-sm text-muted-foreground">Popular services & APIs</div>
                  </div>
                </Button>
                <Button 
                  onClick={() => {
                    console.log('🔘 Custom Connector button clicked');
                    setShowCreateConnector(true);
                    setCreateMode('custom');
                    setSelectedMissingConnector('');
                  }}
                  className="flex items-center gap-2 p-6 h-auto"
                >
                  <Zap className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">Custom Connector</div>
                    <div className="text-sm opacity-90">Build your own integration</div>
                  </div>
                </Button>
                <Button 
                  onClick={() => {
                    console.log('🔘 Enhanced Wizard button clicked');
                    setShowConnectorWizard(true);
                  }}
                  variant="outline"
                  className="flex items-center gap-2 p-6 h-auto"
                >
                  <Workflow className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">Enhanced Wizard</div>
                    <div className="text-sm text-muted-foreground">Full guided setup</div>
                  </div>
                </Button>
              </div>

              {/* Connector Type Categories */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quick Create by Type</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a connector type below to see available options and brands
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Database Connectors */}
                  <Card className="hover:shadow-md transition-shadow cursor-pointer" 
                        onClick={() => {
                          setShowCreateConnector(true);
                          setCreateMode('missing');
                          setSearchTerm('database');
                        }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Database className="h-8 w-8 text-blue-500" />
                        <div>
                          <h4 className="font-medium">Database</h4>
                          <Badge variant="outline" className="text-xs">Data Storage</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Oracle, MySQL, PostgreSQL, MongoDB, Redis, etc.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Connect to relational and NoSQL databases
                      </div>
                    </CardContent>
                  </Card>

                  {/* REST API Connectors */}
                  <Card className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setShowCreateConnector(true);
                          setCreateMode('missing');
                          setSearchTerm('api');
                        }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Globe className="h-8 w-8 text-green-500" />
                        <div>
                          <h4 className="font-medium">REST API</h4>
                          <Badge variant="outline" className="text-xs">Web Services</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        HTTP REST endpoints, webhooks, GraphQL
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Integrate with web APIs and services
                      </div>
                    </CardContent>
                  </Card>

                  {/* Messaging Connectors */}
                  <Card className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setShowCreateConnector(true);
                          setCreateMode('missing');
                          setSearchTerm('messaging');
                        }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <MessageSquare className="h-8 w-8 text-purple-500" />
                        <div>
                          <h4 className="font-medium">Messaging</h4>
                          <Badge variant="outline" className="text-xs">Communication</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Kafka, RabbitMQ, SQS, Teams, Slack
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Message queues and chat platforms
                      </div>
                    </CardContent>
                  </Card>

                  {/* File System Connectors */}
                  <Card className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setShowCreateConnector(true);
                          setCreateMode('missing');
                          setSearchTerm('file');
                        }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="h-8 w-8 text-orange-500" />
                        <div>
                          <h4 className="font-medium">File System</h4>
                          <Badge variant="outline" className="text-xs">Storage</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        FTP, SFTP, S3, Google Drive, SharePoint
                      </p>
                      <div className="text-xs text-muted-foreground">
                        File storage and document systems
                      </div>
                    </CardContent>
                  </Card>

                  {/* External Services */}
                  <Card className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setShowCreateConnector(true);
                          setCreateMode('missing');
                          setSearchTerm('external');
                        }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Server className="h-8 w-8 text-indigo-500" />
                        <div>
                          <h4 className="font-medium">External Service</h4>
                          <Badge variant="outline" className="text-xs">Third-party</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Salesforce, Workday, SAP, ServiceNow
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Enterprise applications and services
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Models */}
                  <Card className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setShowCreateConnector(true);
                          setCreateMode('missing');
                          setSearchTerm('ai');
                        }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Brain className="h-8 w-8 text-pink-500" />
                        <div>
                          <h4 className="font-medium">AI Model</h4>
                          <Badge variant="outline" className="text-xs">Machine Learning</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        OpenAI, Anthropic, Cohere, Azure AI
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Language models and AI services
                      </div>
                    </CardContent>
                  </Card>
                  
                </div>
              </div>

              {/* Internal APIs Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Internal APIs</h3>
                  <Badge variant="secondary">System Generated</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  APIs and services created within your system
                </p>
                
                {assignableConnectors && assignableConnectors.filter(c => c.type === 'internal').length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignableConnectors
                      .filter(c => c.type === 'internal')
                      .map((api) => (
                        <Card key={api.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <Globe className="h-6 w-6 text-blue-500" />
                              <div>
                                <h4 className="font-medium">{api.name}</h4>
                                <Badge variant="outline" className="text-xs">Internal API</Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {api.description || 'Internal system API'}
                            </p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                toast({
                                  title: "Internal API",
                                  description: `"${api.name}" is available for connector assignment.`
                                });
                              }}
                              className="w-full"
                            >
                              <Settings className="h-3 w-3 mr-2" />
                              Configure
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h4 className="font-medium text-muted-foreground mb-2">No Internal APIs Found</h4>
                      <p className="text-sm text-muted-foreground">
                        Internal APIs will appear here when they are created in your system.
                      </p>
                    </CardContent>
                  </Card>
                )}
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

      {/* View Connector Details Dialog */}
      <Dialog open={!!viewingConnector} onOpenChange={() => setViewingConnector(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingConnector?.type === 'database' && <Database className="h-5 w-5" />}
              {viewingConnector?.type === 'api' && <Globe className="h-5 w-5" />}
              {viewingConnector?.type === 'messaging' && <MessageSquare className="h-5 w-5" />}
              {viewingConnector?.type === 'file_system' && <FileText className="h-5 w-5" />}
              {viewingConnector?.type === 'external_service' && <Server className="h-5 w-5" />}
              {viewingConnector?.type === 'ai_model' && <Brain className="h-5 w-5" />}
              {viewingConnector?.name || 'Connector Details'}
            </DialogTitle>
            <DialogDescription>
              Detailed information and configuration for this connector
            </DialogDescription>
          </DialogHeader>
          
          {viewingConnector && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm text-muted-foreground">{viewingConnector.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm text-muted-foreground">{viewingConnector.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center gap-2">
                    {viewingConnector.status === 'active' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {viewingConnector.status === 'inactive' && <AlertCircle className="h-4 w-4 text-gray-500" />}
                    {viewingConnector.status === 'testing' && <Clock className="h-4 w-4 text-yellow-500" />}
                    {viewingConnector.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <Badge className={
                      viewingConnector.status === 'active' ? 'bg-green-100 text-green-800' :
                      viewingConnector.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                      viewingConnector.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {viewingConnector.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Authentication</Label>
                  <p className="text-sm text-muted-foreground">{viewingConnector.auth_type}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {viewingConnector.description || 'No description available'}
                </p>
              </div>

              {/* Base URL */}
              {viewingConnector.base_url && (
                <div>
                  <Label className="text-sm font-medium">Base URL</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1 break-all">
                    {viewingConnector.base_url}
                  </p>
                </div>
              )}

              {/* Usage Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted rounded">
                  <p className="text-2xl font-bold text-primary">{viewingConnector.usage_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Usage</p>
                </div>
                <div className="text-center p-3 bg-muted rounded">
                  <p className="text-2xl font-bold text-green-600">{viewingConnector.success_rate || 0}%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
                <div className="text-center p-3 bg-muted rounded">
                  <p className="text-sm font-medium text-muted-foreground">
                    {viewingConnector.last_tested 
                      ? new Date(viewingConnector.last_tested).toLocaleDateString()
                      : 'Never tested'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">Last Tested</p>
                </div>
              </div>

              {/* Configuration */}
              {viewingConnector.configuration && Object.keys(viewingConnector.configuration).length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Configuration</Label>
                  <pre className="text-xs bg-muted p-3 rounded mt-1 overflow-auto max-h-32">
                    {JSON.stringify(viewingConnector.configuration, null, 2)}
                  </pre>
                </div>
              )}

              {/* Endpoints */}
              {viewingConnector.endpoints && viewingConnector.endpoints.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Endpoints</Label>
                  <div className="space-y-2 mt-2">
                    {viewingConnector.endpoints.map((endpoint: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                        <Badge variant="outline" className="text-xs">{endpoint.method || 'GET'}</Badge>
                        <span className="font-mono">{endpoint.path || endpoint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingConnector(null)}>
              Close
            </Button>
            <Button onClick={() => {
              setViewingConnector(null);
              setConfiguring(viewingConnector?.id);
            }}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Connector
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Connector Dialog */}
      <Dialog open={showCreateConnector} onOpenChange={setShowCreateConnector}>
        <DialogContent className="sm:max-w-[600px] z-[9999]">
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
                      {getMissingConnectorSuggestions()
                        .filter(brand => {
                          // Filter by search term if it was set from clicking a connector type
                          if (searchTerm) {
                            return brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   brand.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   brand.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   brand.type.toLowerCase().includes(searchTerm.toLowerCase());
                          }
                          return true;
                        })
                        .map((brand) => (
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
                    setSearchTerm(''); // Clear search term
                    
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