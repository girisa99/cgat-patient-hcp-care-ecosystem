import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, Database, MessageSquare, Globe, Settings, 
  Stethoscope, ShieldCheck, CreditCard, FileText,
  Building, Workflow, GitBranch, Server, Phone,
  CheckCircle, AlertCircle, Clock, Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

const systemConnectors: Connector[] = [
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
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    category: 'Language Models',
    icon: Globe,
    description: 'AI-powered search and research assistant',
    status: 'available',
    apiEndpoint: 'https://api.perplexity.ai',
    authMethod: 'api_key',
    capabilities: ['Web Search', 'Research', 'Fact Checking', 'Citations'],
    rateLimit: '1,000 requests/minute',
    cost: 'Paid'
  },

  // CRM Systems
  {
    id: 'salesforce',
    name: 'Salesforce CRM',
    category: 'CRM Systems',
    icon: Building,
    description: 'Leading customer relationship management platform',
    status: 'connected',
    apiEndpoint: 'https://your-instance.salesforce.com/services/data/v58.0',
    authMethod: 'oauth',
    capabilities: ['Contact Management', 'Lead Tracking', 'Opportunity Management', 'Reports'],
    rateLimit: '5,000 requests/hour',
    cost: 'Paid'
  },
  {
    id: 'veeva-crm',
    name: 'Veeva CRM',
    category: 'CRM Systems',
    icon: Stethoscope,
    description: 'Life sciences customer relationship management',
    status: 'available',
    apiEndpoint: 'https://your-instance.veevacrm.com/api/v1',
    authMethod: 'oauth',
    capabilities: ['HCP Management', 'Medical Insights', 'Compliance Tracking', 'Field Force'],
    rateLimit: '2,000 requests/hour',
    cost: 'Enterprise'
  },
  {
    id: 'ms-dynamics',
    name: 'Microsoft Dynamics',
    category: 'CRM Systems',
    icon: Building,
    description: 'Microsoft cloud-based CRM solution',
    status: 'available',
    apiEndpoint: 'https://your-org.api.crm.dynamics.com/api/data/v9.2',
    authMethod: 'oauth',
    capabilities: ['Customer Service', 'Sales Automation', 'Marketing', 'Field Service'],
    rateLimit: '6,000 requests/hour',
    cost: 'Paid'
  },

  // Databases
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'Databases',
    icon: Database,
    description: 'Advanced open-source relational database',
    status: 'connected',
    authMethod: 'basic',
    capabilities: ['SQL Queries', 'ACID Compliance', 'JSON Support', 'Full-text Search'],
    cost: 'Free'
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'Databases',
    icon: Database,
    description: 'NoSQL document database',
    status: 'available',
    apiEndpoint: 'mongodb://your-cluster.mongodb.net',
    authMethod: 'basic',
    capabilities: ['Document Storage', 'Aggregation', 'Indexing', 'Sharding'],
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
  },
  {
    id: 'cms-api',
    name: 'CMS Open Data',
    category: 'Healthcare APIs',
    icon: FileText,
    description: 'Centers for Medicare & Medicaid Services data',
    status: 'available',
    apiEndpoint: 'https://data.cms.gov/api',
    authMethod: 'api_key',
    capabilities: ['Provider Data', 'Quality Measures', 'Cost Data', 'Utilization'],
    rateLimit: '500 requests/hour',
    cost: 'Free'
  },
  {
    id: 'npi-registry',
    name: 'NPI Registry',
    category: 'Healthcare APIs',
    icon: Stethoscope,
    description: 'National Provider Identifier lookup service',
    status: 'connected',
    apiEndpoint: 'https://npiregistry.cms.hhs.gov/api',
    authMethod: 'api_key',
    capabilities: ['Provider Lookup', 'Taxonomy Codes', 'Practice Locations', 'Credentials'],
    rateLimit: '1,200 requests/hour',
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
    id: 'twilio-sms',
    name: 'Twilio SMS',
    category: 'Communication',
    icon: Phone,
    description: 'SMS and voice communication platform',
    status: 'available',
    apiEndpoint: 'https://api.twilio.com/2010-04-01',
    authMethod: 'basic',
    capabilities: ['SMS Messaging', 'Voice Calls', 'WhatsApp', 'Verification'],
    rateLimit: '3,600 requests/hour',
    cost: 'Paid'
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

  // Insurance & Authorization
  {
    id: 'benefit-verification',
    name: 'Benefit Verification API',
    category: 'Insurance',
    icon: CreditCard,
    description: 'Real-time insurance benefit verification',
    status: 'available',
    authMethod: 'api_key',
    capabilities: ['Eligibility Check', 'Benefit Details', 'Coverage Verification', 'Copay Info'],
    rateLimit: '500 requests/hour',
    cost: 'Paid'
  },
  {
    id: 'prior-auth-api',
    name: 'Prior Authorization API',
    category: 'Insurance',
    icon: ShieldCheck,
    description: 'Automated prior authorization processing',
    status: 'configuring',
    authMethod: 'oauth',
    capabilities: ['PA Submission', 'Status Tracking', 'Requirements Check', 'Appeals'],
    rateLimit: '200 requests/hour',
    cost: 'Enterprise'
  },

  // Development Tools
  {
    id: 'github',
    name: 'GitHub',
    category: 'Development',
    icon: GitBranch,
    description: 'Version control and collaboration platform',
    status: 'connected',
    apiEndpoint: 'https://api.github.com',
    authMethod: 'token',
    capabilities: ['Repository Management', 'Issues', 'Pull Requests', 'Actions'],
    rateLimit: '5,000 requests/hour',
    cost: 'Free'
  },
  {
    id: 'jenkins',
    name: 'Jenkins',
    category: 'Development',
    icon: Settings,
    description: 'Automation server for CI/CD pipelines',
    status: 'available',
    authMethod: 'basic',
    capabilities: ['Build Automation', 'Testing', 'Deployment', 'Pipeline Management'],
    cost: 'Free'
  }
];

export const SystemConnectors = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [connectionData, setConnectionData] = useState<{[key: string]: any}>({});

  const categories = ['All', 'Language Models', 'CRM Systems', 'Databases', 'Healthcare APIs', 'Communication', 'Insurance', 'Development'];

  const filteredConnectors = systemConnectors.filter(connector => {
    const matchesCategory = selectedCategory === 'All' || connector.category === selectedCategory;
    const matchesSearch = connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connector.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleConnect = (connectorId: string) => {
    setConfiguring(connectorId);
    toast({
      title: "Configuring Connection",
      description: "Please provide the required credentials to establish connection.",
    });
  };

  const handleConfigure = (connectorId: string) => {
    setConfiguring(connectorId);
    toast({
      title: "Configure Connection",
      description: "Update connection settings and credentials.",
    });
  };

  const handleTest = async (connectorId: string) => {
    setTesting(connectorId);
    const connector = systemConnectors.find(c => c.id === connectorId);
    
    // Simulate test connection
    setTimeout(() => {
      setTesting(null);
      const isSuccess = Math.random() > 0.2; // 80% success rate for demo
      
      if (isSuccess) {
        toast({
          title: "Connection Test Successful",
          description: `${connector?.name} is responding correctly.`,
        });
      } else {
        toast({
          title: "Connection Test Failed",
          description: `Unable to connect to ${connector?.name}. Check your configuration.`,
          variant: "destructive"
        });
      }
    }, 2000);
  };

  const handleSaveConnection = () => {
    if (!configuring) return;
    
    // Update connector status
    const connectorIndex = systemConnectors.findIndex(c => c.id === configuring);
    if (connectorIndex !== -1) {
      systemConnectors[connectorIndex].status = 'connected';
    }
    
    setConfiguring(null);
    toast({
      title: "Connection Established",
      description: "System connector is now active and ready for use.",
    });
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
        <p className="text-muted-foreground">Configure and manage integrations with external systems</p>
      </div>

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
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleConfigure(connector.id)}
                        disabled={configuring === connector.id}
                      >
                        Configure
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleTest(connector.id)}
                        disabled={testing === connector.id}
                      >
                        {testing === connector.id ? "Testing..." : "Test"}
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => handleConnect(connector.id)}
                      className="w-full gap-2"
                      size="sm"
                    >
                      <Zap className="h-4 w-4" />
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {configuring && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Configure Connection</CardTitle>
            <CardDescription>
              Provide credentials for {systemConnectors.find(c => c.id === configuring)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key / Token</Label>
              <Input id="apiKey" type="password" placeholder="Enter your API key" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endpoint">Custom Endpoint (Optional)</Label>
              <Input id="endpoint" placeholder="https://api.example.com" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveConnection} className="flex-1">
                Save & Connect
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setConfiguring(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};