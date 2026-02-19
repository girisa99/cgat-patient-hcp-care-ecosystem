/**
 * Connector Marketplace
 * Provides a marketplace for workflow connectors with testing capabilities
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plug, 
  Search, 
  Filter, 
  Download, 
  Star, 
  Shield,
  Play,
  Settings,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Database,
  Cloud,
  Code
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Connector {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  version: string;
  rating: number;
  downloads: number;
  isOfficial: boolean;
  isPremium: boolean;
  testStatus: 'untested' | 'passed' | 'failed';
  documentation?: string;
  configuration: {
    inputs: string[];
    outputs: string[];
    settings: Record<string, any>;
  };
  tags: string[];
}

const SAMPLE_CONNECTORS: Connector[] = [
  {
    id: 'salesforce-api',
    name: 'Salesforce API',
    description: 'Connect to Salesforce CRM for customer data integration',
    category: 'CRM',
    provider: 'Salesforce',
    version: '2.1.0',
    rating: 4.8,
    downloads: 15420,
    isOfficial: true,
    isPremium: false,
    testStatus: 'passed',
    configuration: {
      inputs: ['auth_token', 'instance_url'],
      outputs: ['account_data', 'contact_data', 'opportunity_data'],
      settings: {
        api_version: '58.0',
        timeout: 30000,
        retry_attempts: 3
      }
    },
    tags: ['CRM', 'Sales', 'Customer Data', 'Enterprise']
  },
  {
    id: 'stripe-payments',
    name: 'Stripe Payments',
    description: 'Process payments and manage subscriptions with Stripe',
    category: 'Payment',
    provider: 'Stripe',
    version: '1.5.2',
    rating: 4.9,
    downloads: 23150,
    isOfficial: true,
    isPremium: false,
    testStatus: 'passed',
    configuration: {
      inputs: ['api_key', 'webhook_secret'],
      outputs: ['payment_intent', 'customer_data', 'subscription_data'],
      settings: {
        currency: 'usd',
        capture_method: 'automatic'
      }
    },
    tags: ['Payment', 'E-commerce', 'Subscription', 'Financial']
  },
  {
    id: 'slack-notifications',
    name: 'Slack Notifications',
    description: 'Send messages and notifications to Slack channels',
    category: 'Communication',
    provider: 'Slack',
    version: '3.0.1',
    rating: 4.6,
    downloads: 31200,
    isOfficial: true,
    isPremium: false,
    testStatus: 'untested',
    configuration: {
      inputs: ['webhook_url', 'channel'],
      outputs: ['message_status', 'thread_ts'],
      settings: {
        username: 'Workflow Bot',
        icon_emoji: ':robot_face:'
      }
    },
    tags: ['Communication', 'Notifications', 'Team', 'Messaging']
  },
  {
    id: 'aws-s3',
    name: 'AWS S3 Storage',
    description: 'Store and retrieve files from Amazon S3',
    category: 'Storage',
    provider: 'Amazon Web Services',
    version: '2.3.1',
    rating: 4.7,
    downloads: 18750,
    isOfficial: true,
    isPremium: false,
    testStatus: 'passed',
    configuration: {
      inputs: ['access_key', 'secret_key', 'bucket_name'],
      outputs: ['file_url', 'metadata', 'etag'],
      settings: {
        region: 'us-east-1',
        storage_class: 'STANDARD'
      }
    },
    tags: ['Storage', 'Cloud', 'Files', 'AWS']
  },
  {
    id: 'openai-gpt',
    name: 'OpenAI GPT',
    description: 'AI-powered text generation and completion',
    category: 'AI',
    provider: 'OpenAI',
    version: '1.2.0',
    rating: 4.9,
    downloads: 42300,
    isOfficial: false,
    isPremium: true,
    testStatus: 'passed',
    configuration: {
      inputs: ['api_key', 'prompt', 'model'],
      outputs: ['generated_text', 'usage_stats'],
      settings: {
        model: 'gpt-4o',
        max_tokens: 1000,
        temperature: 0.7
      }
    },
    tags: ['AI', 'Text Generation', 'NLP', 'Machine Learning']
  }
];

export const ConnectorMarketplace: React.FC = () => {
  const [connectors, setConnectors] = useState<Connector[]>(SAMPLE_CONNECTORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [testingConnector, setTestingConnector] = useState<string | null>(null);
  const { toast } = useToast();

  const categories = Array.from(new Set(connectors.map(c => c.category)));
  
  const filteredConnectors = connectors.filter(connector => {
    const matchesSearch = connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connector.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connector.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || connector.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstallConnector = (connector: Connector) => {
    toast({
      title: "Connector Installed",
      description: `${connector.name} has been added to your workflow palette`,
    });
    
    // Update download count
    setConnectors(prev => prev.map(c => 
      c.id === connector.id ? { ...c, downloads: c.downloads + 1 } : c
    ));
  };

  const handleTestConnector = async (connector: Connector) => {
    setTestingConnector(connector.id);
    
    try {
      // Simulate connector testing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Random test result for demo
      const testPassed = Math.random() > 0.2;
      
      setConnectors(prev => prev.map(c => 
        c.id === connector.id 
          ? { ...c, testStatus: testPassed ? 'passed' : 'failed' }
          : c
      ));

      toast({
        title: testPassed ? "Test Passed" : "Test Failed",
        description: testPassed 
          ? `${connector.name} connector is working correctly`
          : `${connector.name} connector test failed. Check configuration.`,
        variant: testPassed ? "default" : "destructive",
      });
      
    } catch (error) {
      toast({
        title: "Test Error",
        description: "Failed to test connector",
        variant: "destructive",
      });
    } finally {
      setTestingConnector(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CRM':
        return <Database className="w-4 h-4" />;
      case 'Payment':
        return <Shield className="w-4 h-4" />;
      case 'Communication':
        return <ExternalLink className="w-4 h-4" />;
      case 'Storage':
        return <Cloud className="w-4 h-4" />;
      case 'AI':
        return <Code className="w-4 h-4" />;
      default:
        return <Plug className="w-4 h-4" />;
    }
  };

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Play className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="w-5 h-5" />
            Connector Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search connectors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConnectors.map((connector) => (
              <Card key={connector.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(connector.category)}
                      <div>
                        <h3 className="font-semibold text-sm">{connector.name}</h3>
                        <p className="text-xs text-muted-foreground">v{connector.version}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {connector.isOfficial && (
                        <Badge variant="secondary" className="text-xs">Official</Badge>
                      )}
                      {connector.isPremium && (
                        <Badge variant="outline" className="text-xs">Premium</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {connector.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>{connector.rating}</span>
                    </div>
                    <span>{connector.downloads.toLocaleString()} downloads</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {connector.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {getTestStatusIcon(connector.testStatus)}
                      <span className="text-xs capitalize">{connector.testStatus}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestConnector(connector)}
                        disabled={testingConnector === connector.id}
                        className="h-7 text-xs"
                      >
                        {testingConnector === connector.id ? (
                          <Play className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        Test
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleInstallConnector(connector)}
                        className="h-7 text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Install
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredConnectors.length === 0 && (
            <div className="text-center py-8">
              <Plug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No connectors found matching your search</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};