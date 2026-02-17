import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Link, Plus, Edit, Trash2, Settings, Database, Brain, Zap, 
  FileText, ExternalLink, CheckCircle, AlertCircle, Clock,
  Activity, GitBranch, Package, Code, Puzzle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Connector {
  id: string;
  name: string;
  type: 'api' | 'database' | 'ai_model' | 'system' | 'webhook' | 'file' | 'email';
  provider: string;
  status: 'connected' | 'available' | 'error' | 'configuring';
  description: string;
  category: string;
  capabilities: string[];
  configuration: {
    endpoint?: string;
    apiKey?: string;
    version?: string;
    authentication?: 'oauth' | 'api_key' | 'basic' | 'bearer';
    parameters?: Record<string, any>;
  };
  metadata: {
    lastTested?: string;
    responseTime?: number;
    reliability?: number;
    dataFormat?: string;
    supportedOperations?: string[];
  };
  isUniversal: boolean;
  compatibleNodes: string[];
  integrationComplexity: 'low' | 'medium' | 'high';
}

interface SmartConnectorManagerProps {
  onConnectorAction?: (action: string, data: any) => void;
  workflowContext?: {
    type: 'visual' | 'manual';
    stage: string;
    useCaseData?: any;
    capturedRequirements?: any;
  };
  selectedNode?: any;
}

export const SmartConnectorManager: React.FC<SmartConnectorManagerProps> = ({
  onConnectorAction,
  workflowContext,
  selectedNode
}) => {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [filteredConnectors, setFilteredConnectors] = useState<Connector[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingConnector, setEditingConnector] = useState<Connector | null>(null);
  const [testingConnector, setTestingConnector] = useState<string | null>(null);
  const { toast } = useToast();

  // Mock universal connectors - in production, fetch from API
  const universalConnectors: Connector[] = [
    {
      id: 'openai-gpt4',
      name: 'OpenAI GPT-4 Turbo',
      type: 'ai_model',
      provider: 'OpenAI',
      status: 'connected',
      description: 'Advanced language model for complex reasoning and healthcare applications',
      category: 'AI & Machine Learning',
      capabilities: ['text_generation', 'analysis', 'conversation', 'medical_consultation'],
      configuration: {
        endpoint: 'https://api.openai.com/v1',
        version: 'v1',
        authentication: 'bearer'
      },
      metadata: {
        lastTested: '2024-01-25T10:30:00Z',
        responseTime: 1200,
        reliability: 99.8,
        dataFormat: 'JSON',
        supportedOperations: ['chat', 'completion', 'embedding']
      },
      isUniversal: true,
      compatibleNodes: ['agent', 'decision', 'touchpoint'],
      integrationComplexity: 'low'
    },
    {
      id: 'anthropic-claude',
      name: 'Anthropic Claude-3 Sonnet',
      type: 'ai_model',
      provider: 'Anthropic',
      status: 'available',
      description: 'Highly capable AI assistant with strong reasoning and safety features',
      category: 'AI & Machine Learning',
      capabilities: ['analysis', 'reasoning', 'writing', 'code_generation'],
      configuration: {
        endpoint: 'https://api.anthropic.com/v1',
        version: 'v1',
        authentication: 'api_key'
      },
      metadata: {
        responseTime: 800,
        reliability: 99.9,
        dataFormat: 'JSON',
        supportedOperations: ['messages', 'completion']
      },
      isUniversal: true,
      compatibleNodes: ['agent', 'decision', 'analysis'],
      integrationComplexity: 'low'
    },
    {
      id: 'salesforce-api',
      name: 'Salesforce CRM API',
      type: 'api',
      provider: 'Salesforce',
      status: 'connected',
      description: 'Complete customer relationship management with healthcare extensions',
      category: 'CRM & Customer Data',
      capabilities: ['customer_data', 'lead_management', 'case_management', 'analytics'],
      configuration: {
        endpoint: 'https://your-instance.salesforce.com/services/data',
        version: 'v58.0',
        authentication: 'oauth'
      },
      metadata: {
        lastTested: '2024-01-25T09:15:00Z',
        responseTime: 350,
        reliability: 99.5,
        dataFormat: 'JSON',
        supportedOperations: ['query', 'create', 'update', 'delete']
      },
      isUniversal: true,
      compatibleNodes: ['customer', 'touchpoint', 'decision'],
      integrationComplexity: 'medium'
    },
    {
      id: 'supabase-db',
      name: 'Supabase Database',
      type: 'database',
      provider: 'Supabase',
      status: 'connected',
      description: 'PostgreSQL database with real-time capabilities and built-in authentication',
      category: 'Database & Storage',
      capabilities: ['real_time', 'authentication', 'storage', 'edge_functions'],
      configuration: {
        endpoint: 'https://your-project.supabase.co',
        version: 'v1',
        authentication: 'bearer'
      },
      metadata: {
        lastTested: '2024-01-25T11:00:00Z',
        responseTime: 150,
        reliability: 99.9,
        dataFormat: 'JSON',
        supportedOperations: ['select', 'insert', 'update', 'delete', 'rpc']
      },
      isUniversal: true,
      compatibleNodes: ['customer', 'agent', 'decision', 'storage'],
      integrationComplexity: 'low'
    },
    {
      id: 'fhir-api',
      name: 'FHIR Healthcare API',
      type: 'api',
      provider: 'HL7 FHIR',
      status: 'available',
      description: 'Healthcare data exchange using FHIR R4 standards for interoperability',
      category: 'Healthcare & Medical',
      capabilities: ['patient_data', 'clinical_records', 'interoperability', 'compliance'],
      configuration: {
        endpoint: 'https://hapi.fhir.org/baseR4',
        version: 'R4',
        authentication: 'basic'
      },
      metadata: {
        responseTime: 500,
        reliability: 98.5,
        dataFormat: 'FHIR JSON',
        supportedOperations: ['read', 'search', 'create', 'update']
      },
      isUniversal: true,
      compatibleNodes: ['patient', 'clinical', 'records'],
      integrationComplexity: 'high'
    },
    {
      id: 'stripe-payments',
      name: 'Stripe Payment Processing',
      type: 'api',
      provider: 'Stripe',
      status: 'available',
      description: 'Complete payment processing for healthcare services and subscriptions',
      category: 'Payment & Billing',
      capabilities: ['payment_processing', 'subscriptions', 'invoicing', 'compliance'],
      configuration: {
        endpoint: 'https://api.stripe.com/v1',
        version: 'v1',
        authentication: 'bearer'
      },
      metadata: {
        responseTime: 200,
        reliability: 99.99,
        dataFormat: 'JSON',
        supportedOperations: ['charge', 'refund', 'subscription', 'customer']
      },
      isUniversal: true,
      compatibleNodes: ['payment', 'billing', 'customer'],
      integrationComplexity: 'medium'
    },
    {
      id: 'twilio-communications',
      name: 'Twilio Communication Platform',
      type: 'api',
      provider: 'Twilio',
      status: 'available',
      description: 'Multi-channel communication including SMS, voice, video, and chat',
      category: 'Communication & Messaging',
      capabilities: ['sms', 'voice', 'video', 'chat', 'notifications'],
      configuration: {
        endpoint: 'https://api.twilio.com/2010-04-01',
        version: '2010-04-01',
        authentication: 'basic'
      },
      metadata: {
        responseTime: 300,
        reliability: 99.95,
        dataFormat: 'JSON/XML',
        supportedOperations: ['send_sms', 'make_call', 'video_room', 'chat']
      },
      isUniversal: true,
      compatibleNodes: ['communication', 'notification', 'touchpoint'],
      integrationComplexity: 'medium'
    },
    {
      id: 'sendgrid-email',
      name: 'SendGrid Email Service',
      type: 'email',
      provider: 'SendGrid',
      status: 'available',
      description: 'Reliable email delivery with templates and analytics for healthcare communications',
      category: 'Communication & Messaging',
      capabilities: ['email_delivery', 'templates', 'analytics', 'automation'],
      configuration: {
        endpoint: 'https://api.sendgrid.com/v3',
        version: 'v3',
        authentication: 'bearer'
      },
      metadata: {
        responseTime: 250,
        reliability: 99.9,
        dataFormat: 'JSON',
        supportedOperations: ['send_email', 'templates', 'lists', 'analytics']
      },
      isUniversal: true,
      compatibleNodes: ['email', 'notification', 'marketing'],
      integrationComplexity: 'low'
    }
  ];

  useEffect(() => {
    setConnectors(universalConnectors);
    filterConnectors(universalConnectors, activeTab, searchTerm);
  }, []);

  useEffect(() => {
    filterConnectors(connectors, activeTab, searchTerm);
  }, [connectors, activeTab, searchTerm, selectedNode, workflowContext]);

  const filterConnectors = (allConnectors: Connector[], tab: string, search: string) => {
    let filtered = allConnectors;

    // Filter by tab
    if (tab !== 'all') {
      if (tab === 'recommended') {
        // Show recommended based on context
        const domain = workflowContext?.useCaseData?.domain || 'healthcare';
        const nodeType = selectedNode?.type || selectedNode?.data?.type;
        
        filtered = filtered.filter(connector => {
          if (domain === 'healthcare') {
            return connector.category.includes('Healthcare') || 
                   connector.category.includes('AI') ||
                   connector.compatibleNodes.some(node => ['patient', 'clinical', 'agent'].includes(node));
          }
          if (nodeType) {
            return connector.compatibleNodes.includes(nodeType);
          }
          return connector.isUniversal;
        });
      } else {
        filtered = filtered.filter(connector => connector.type === tab);
      }
    }

    // Filter by search
    if (search) {
      filtered = filtered.filter(connector =>
        connector.name.toLowerCase().includes(search.toLowerCase()) ||
        connector.description.toLowerCase().includes(search.toLowerCase()) ||
        connector.capabilities.some(cap => cap.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Sort by relevance and status
    filtered.sort((a, b) => {
      if (a.status === 'connected' && b.status !== 'connected') return -1;
      if (b.status === 'connected' && a.status !== 'connected') return 1;
      if (a.isUniversal && !b.isUniversal) return -1;
      if (b.isUniversal && !a.isUniversal) return 1;
      return a.name.localeCompare(b.name);
    });

    setFilteredConnectors(filtered);
  };

  const getConnectorIcon = (type: Connector['type']) => {
    switch (type) {
      case 'ai_model': return <Brain className="h-4 w-4" />;
      case 'api': return <Code className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      case 'webhook': return <Zap className="h-4 w-4" />;
      case 'file': return <FileText className="h-4 w-4" />;
      case 'email': return <ExternalLink className="h-4 w-4" />;
      default: return <Link className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: Connector['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'available': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'configuring': return <Settings className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getComplexityColor = (complexity: Connector['integrationComplexity']) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleConnectorAction = (action: 'connect' | 'configure' | 'test' | 'edit' | 'delete', connector: Connector) => {
    switch (action) {
      case 'connect':
        // Update connector status
        setConnectors(prev => prev.map(c => 
          c.id === connector.id ? { ...c, status: 'configuring' } : c
        ));
        
        setTimeout(() => {
          setConnectors(prev => prev.map(c => 
            c.id === connector.id ? { ...c, status: 'connected', metadata: { ...c.metadata, lastTested: new Date().toISOString() } } : c
          ));
          toast({
            title: "Connector Connected",
            description: `${connector.name} is now connected and ready to use.`,
          });
        }, 2000);
        break;
        
      case 'test':
        setTestingConnector(connector.id);
        setTimeout(() => {
          setTestingConnector(null);
          toast({
            title: "Connection Test Successful",
            description: `${connector.name} is responding correctly.`,
          });
        }, 1500);
        break;
        
      case 'configure':
        setEditingConnector(connector);
        break;
        
      case 'edit':
        setEditingConnector(connector);
        break;
        
      case 'delete':
        setConnectors(prev => prev.filter(c => c.id !== connector.id));
        toast({
          title: "Connector Removed",
          description: `${connector.name} has been removed from your workflow.`,
        });
        break;
    }
    
    onConnectorAction?.(action, connector);
  };

  const handleCreateConnector = (connectorData: Partial<Connector>) => {
    const newConnector: Connector = {
      id: `custom_${Date.now()}`,
      name: connectorData.name || 'Custom Connector',
      type: connectorData.type || 'api',
      provider: connectorData.provider || 'Custom',
      status: 'available',
      description: connectorData.description || '',
      category: connectorData.category || 'Custom',
      capabilities: connectorData.capabilities || [],
      configuration: connectorData.configuration || {},
      metadata: {
        responseTime: 0,
        reliability: 0,
        dataFormat: 'JSON',
        supportedOperations: []
      },
      isUniversal: false,
      compatibleNodes: connectorData.compatibleNodes || [],
      integrationComplexity: connectorData.integrationComplexity || 'medium'
    };
    
    setConnectors(prev => [...prev, newConnector]);
    setShowCreateDialog(false);
    toast({
      title: "Custom Connector Created",
      description: `${newConnector.name} has been added to your connectors.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Smart Connectors</h3>
          <p className="text-sm text-muted-foreground">
            Universal connectors that work with all models and workflow types
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Custom Connector</DialogTitle>
            </DialogHeader>
            <ConnectorForm onSubmit={handleCreateConnector} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Context Info */}
      {(workflowContext || selectedNode) && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Context:</span>
              {workflowContext?.useCaseData?.domain && (
                <Badge variant="outline">{workflowContext.useCaseData.domain}</Badge>
              )}
              {selectedNode && (
                <Badge variant="secondary">{selectedNode.data?.label || selectedNode.type}</Badge>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                Showing {filteredConnectors.length} relevant connectors
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="space-y-3">
        <Input
          placeholder="Search connectors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        
        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 text-xs">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="recommended">Smart</TabsTrigger>
            <TabsTrigger value="ai_model">AI</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="database">DB</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Connectors List */}
      <div className="space-y-3">
        {filteredConnectors.map((connector) => (
          <Card key={connector.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    {getConnectorIcon(connector.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{connector.name}</h4>
                      {getStatusIcon(connector.status)}
                      {connector.isUniversal && (
                        <Badge variant="secondary" className="text-xs">Universal</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{connector.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{connector.provider}</span>
                      <span>•</span>
                      <Badge className={`text-xs ${getComplexityColor(connector.integrationComplexity)}`}>
                        {connector.integrationComplexity} complexity
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  {connector.status === 'available' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleConnectorAction('connect', connector)}
                      className="text-xs"
                    >
                      Connect
                    </Button>
                  )}
                  {connector.status === 'connected' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleConnectorAction('test', connector)}
                      disabled={testingConnector === connector.id}
                      className="text-xs"
                    >
                      {testingConnector === connector.id ? 'Testing...' : 'Test'}
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleConnectorAction('configure', connector)}
                    className="text-xs"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Capabilities */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {connector.capabilities.slice(0, 4).map((capability, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {capability.replace('_', ' ')}
                    </Badge>
                  ))}
                  {connector.capabilities.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{connector.capabilities.length - 4} more
                    </Badge>
                  )}
                </div>
                
                {connector.metadata.lastTested && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Last tested: {new Date(connector.metadata.lastTested).toLocaleDateString()}</span>
                    {connector.metadata.reliability && (
                      <span>{connector.metadata.reliability}% reliability</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredConnectors.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Link className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Connectors Found</h3>
            <p className="text-muted-foreground mb-4">
              No connectors match your current search and filter criteria.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Connector
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Configuration Dialog */}
      {editingConnector && (
        <Dialog open={!!editingConnector} onOpenChange={() => setEditingConnector(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure {editingConnector.name}</DialogTitle>
            </DialogHeader>
            <ConnectorForm 
              initialData={editingConnector} 
              onSubmit={(data) => {
                const updatedConnector = { ...editingConnector, ...data };
                setConnectors(prev => prev.map(c => c.id === editingConnector.id ? updatedConnector : c));
                setEditingConnector(null);
                toast({
                  title: "Connector Updated",
                  description: `${updatedConnector.name} configuration has been saved.`,
                });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

interface ConnectorFormProps {
  initialData?: Partial<Connector>;
  onSubmit: (data: Partial<Connector>) => void;
}

const ConnectorForm: React.FC<ConnectorFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<Connector>>(initialData || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Connector Name *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select 
            value={formData.type || ''} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Connector['type'] }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="ai_model">AI Model</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="webhook">Webhook</SelectItem>
              <SelectItem value="file">File</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe what this connector does and how it integrates..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="provider">Provider</Label>
          <Input
            id="provider"
            value={formData.provider || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
            placeholder="e.g., OpenAI, Salesforce, Custom"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="e.g., AI & Machine Learning"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endpoint">API Endpoint</Label>
        <Input
          id="endpoint"
          value={formData.configuration?.endpoint || ''}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            configuration: { ...prev.configuration, endpoint: e.target.value }
          }))}
          placeholder="https://api.example.com/v1"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">
          {initialData?.id ? 'Update' : 'Create'} Connector
        </Button>
      </div>
    </form>
  );
};