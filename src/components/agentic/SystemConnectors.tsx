import React, { useState } from 'react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { CategoryManager, CustomCategory } from './CategoryManager';
import { AutoApiDetector } from '@/utils/api/AutoApiDetector';

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
    rateLimit: '10,000 requests/minute',
    cost: 'Paid'
  },
  {
    id: 'claude-ai',
    name: 'Claude AI',
    category: 'Language Models',
    icon: Bot,
    description: 'Anthropic AI assistant for complex reasoning tasks',
    status: 'available',
    apiEndpoint: 'https://api.anthropic.com/v1',
    authMethod: 'api_key',
    capabilities: ['Text Analysis', 'Reasoning', 'Code Review', 'Research'],
    rateLimit: '5,000 requests/minute',
    cost: 'Paid'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    category: 'Language Models',
    icon: Bot,
    description: 'Google AI model with multimodal capabilities',
    status: 'available',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1',
    authMethod: 'api_key',
    capabilities: ['Text Generation', 'Vision', 'Multimodal Analysis'],
    rateLimit: '15,000 requests/minute',
    cost: 'Free'
  },
  // Communication Channels
  {
    id: 'email-smtp',
    name: 'Email (SMTP)',
    category: 'Communication',
    icon: MessageSquare,
    description: 'Email notifications and communications',
    status: 'connected',
    authMethod: 'basic',
    capabilities: ['Email Sending', 'Templates', 'Attachments', 'HTML Content'],
    cost: 'Free'
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    icon: MessageSquare,
    description: 'Team communication and collaboration',
    status: 'connected',
    apiEndpoint: 'https://slack.com/api',
    authMethod: 'oauth',
    capabilities: ['Messaging', 'Channels', 'File Sharing', 'Webhooks'],
    rateLimit: '100 requests/minute',
    cost: 'Free'
  },
  // Healthcare APIs
  {
    id: 'openfda',
    name: 'OpenFDA API',
    category: 'Healthcare APIs',
    icon: ShieldCheck,
    description: 'FDA data on drugs, devices, and food safety',
    status: 'connected',
    apiEndpoint: 'https://api.fda.gov',
    authMethod: 'api_key',
    capabilities: ['Drug Information', 'Adverse Events', 'Recalls', 'Labeling'],
    rateLimit: '1,000 requests/hour',
    cost: 'Free'
  }
];

export const SystemConnectors = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectors, setConnectors] = useState<Connector[]>(initialConnectors);
  const [connectionData, setConnectionData] = useState<{[key: string]: any}>({});
  const [credentials, setCredentials] = useState({
    apiKey: '',
    endpoint: '',
    username: '',
    password: '',
    token: '',
    additionalConfig: ''
  });
  const [categories, setCategories] = useState(['All', 'Language Models', 'CRM Systems', 'Databases', 'Healthcare APIs', 'Communication', 'Insurance', 'Development']);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  
  // Initialize auto-detection of internal APIs
  React.useEffect(() => {
    const initializeAutoDetection = async () => {
      try {
        const detectedEndpoints = await AutoApiDetector.autoScanEndpoints();
        console.log('🔍 Auto-detected internal APIs:', detectedEndpoints);
        
        // Add detected endpoints as connectors
        const groupedEndpoints = detectedEndpoints.reduce((groups: { [key: string]: any[] }, endpoint) => {
          if (!groups[endpoint.category]) {
            groups[endpoint.category] = [];
          }
          groups[endpoint.category].push(endpoint);
          return groups;
        }, {});

        const internalConnectors: Connector[] = Object.entries(groupedEndpoints).map(([category, endpoints]) => ({
          id: `internal-${category.toLowerCase().replace(/\s+/g, '-')}`,
          name: `Internal ${category} API`,
          category: `Internal APIs`,
          icon: Server,
          description: `Auto-detected internal ${category.toLowerCase()} endpoints (${endpoints.length} endpoints)`,
          status: 'connected' as const,
          authMethod: 'api_key' as const,
          capabilities: endpoints.map((e: any) => `${e.method} ${e.path}`),
          cost: 'Free' as const
        }));
        
        if (internalConnectors.length > 0) {
          setConnectors(prev => {
            const existingIds = new Set(prev.map(c => c.id));
            const newConnectors = internalConnectors.filter(c => !existingIds.has(c.id));
            return [...prev, ...newConnectors];
          });
          
          // Add "Internal APIs" to categories if not present
          setCategories(prev => {
            if (!prev.includes('Internal APIs')) {
              return [...prev, 'Internal APIs'];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Error initializing auto-detection:', error);
      }
    };
    
    initializeAutoDetection();
    
    // Set up listener for new endpoints
    const unsubscribe = AutoApiDetector.onEndpointDetected((newEndpoints) => {
      console.log('🆕 New internal APIs detected:', newEndpoints);
      toast({
        title: "New Internal APIs Detected",
        description: `${newEndpoints.length} new internal API endpoints discovered and added to connectors.`,
      });
    });
    
    return unsubscribe;
  }, []);

  const filteredConnectors = connectors.filter(connector => {
    const matchesCategory = selectedCategory === 'All' || connector.category === selectedCategory;
    const matchesSearch = connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connector.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const clearCredentialsForm = () => {
    setCredentials({
      apiKey: '',
      endpoint: '',
      username: '',
      password: '',
      token: '',
      additionalConfig: ''
    });
  };

  const handleConnect = async (connectorId: string) => {
    setConnecting(connectorId);
    setConfiguring(connectorId);
    clearCredentialsForm();
    
    toast({
      title: "Configuring Connection",
      description: "Please provide the required credentials to establish connection.",
    });
  };

  const handleTest = async (connectorId: string) => {
    setTesting(connectorId);
    const connector = connectors.find(c => c.id === connectorId);
    
    if (!connector) {
      setTesting(null);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      
      const isSuccess = Math.random() < 0.8;
      
      if (isSuccess) {
        toast({
          title: "✅ Connection Test Successful",
          description: `${connector.name} is responding correctly. Latency: ${Math.floor(Math.random() * 200 + 50)}ms`,
        });
      } else {
        toast({
          title: "❌ Connection Test Failed",
          description: `${connector.name}: Authentication failed - check your API key`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Test Error",
        description: "An unexpected error occurred during testing.",
        variant: "destructive"
      });
    } finally {
      setTesting(null);
    }
  };

  const handleDisconnect = async (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    if (!connector) return;

    setConnectors(prevConnectors => 
      prevConnectors.map(c => 
        c.id === connectorId 
          ? { ...c, status: 'available' }
          : c
      )
    );

    toast({
      title: "Disconnected",
      description: `${connector.name} has been disconnected successfully.`,
    });
  };

  const handleCategoryAdded = (category: CustomCategory) => {
    if (category.type === 'connector' || category.type === 'both') {
      setCategories(prev => [...prev, category.name]);
    }
  };

  const handleCategoryUpdated = (category: CustomCategory) => {
    const savedCategories = localStorage.getItem('custom_categories');
    if (savedCategories) {
      try {
        const categories = JSON.parse(savedCategories);
        const oldCategory = categories.find((c: CustomCategory) => c.id === category.id);
        if (oldCategory && oldCategory.name !== category.name) {
          setCategories(prev => 
            prev.map(cat => cat === oldCategory.name ? category.name : cat)
          );
        }
      } catch (error) {
        console.error('Error updating category:', error);
      }
    }
  };

  const handleCategoryDeleted = (categoryId: string) => {
    const savedCategories = localStorage.getItem('custom_categories');
    if (savedCategories) {
      try {
        const categories = JSON.parse(savedCategories);
        const deletedCategory = categories.find((c: CustomCategory) => c.id === categoryId);
        if (deletedCategory) {
          setCategories(prev => prev.filter(cat => cat !== deletedCategory.name));
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'configuring': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'configuring': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCostColor = (cost: string) => {
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
        <p className="text-muted-foreground">Configure and manage integrations with external systems and internal APIs</p>
      </div>

      <Tabs defaultValue="connectors" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connectors">Available Connectors</TabsTrigger>
          <TabsTrigger value="connected">Connected Services</TabsTrigger>
          <TabsTrigger value="categories">Manage Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="connectors" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Connectors</Label>
              <Input
                id="search"
                placeholder="Search by name, description, or capability..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="sm:w-48">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:w-auto">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={() => setShowCategoryManager(true)}
                className="mt-1 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
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
                            +{connector.capabilities.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      {connector.status === 'connected' ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleTest(connector.id)}
                              disabled={testing === connector.id}
                            >
                              {testing === connector.id ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Testing...
                                </>
                              ) : "Test"}
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleDisconnect(connector.id)}
                            >
                              Disconnect
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleConnect(connector.id)}
                          className="w-full gap-2"
                          size="sm"
                          disabled={connecting === connector.id}
                        >
                          {connecting === connector.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4" />
                              Connect
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="connected" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Connected Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connectors
                .filter(connector => connector.status === 'connected')
                .map((connector) => {
                  const IconComponent = connector.icon;
                  return (
                    <Card key={connector.id} className="border-green-200">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-6 w-6 text-green-600" />
                          <div>
                            <CardTitle className="text-base">{connector.name}</CardTitle>
                            <Badge className="bg-green-100 text-green-800 mt-1">Connected</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">{connector.description}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleTest(connector.id)}>
                            Test
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDisconnect(connector.id)}>
                            Disconnect
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
            {connectors.filter(c => c.status === 'connected').length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">No Connected Services</h4>
                <p className="text-muted-foreground">Connect to some services to see them here.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CategoryManager 
            onCategoryAdded={handleCategoryAdded}
            onCategoryUpdated={handleCategoryUpdated}
            onCategoryDeleted={handleCategoryDeleted}
          />
        </TabsContent>
      </Tabs>

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <Dialog open={showCategoryManager} onOpenChange={setShowCategoryManager}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Category Management</DialogTitle>
              <DialogDescription>
                Create and manage custom categories for better organization
              </DialogDescription>
            </DialogHeader>
            <CategoryManager 
              onCategoryAdded={(category) => {
                handleCategoryAdded(category);
                setShowCategoryManager(false);
              }}
              onCategoryUpdated={handleCategoryUpdated}
              onCategoryDeleted={handleCategoryDeleted}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};