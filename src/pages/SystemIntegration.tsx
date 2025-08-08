import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Network, Database, Shield, Globe, Upload, 
  Activity, Settings, Link2, Bot, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SystemIntegration = () => {
  const navigate = useNavigate();

  const integrationSections = [
    {
      id: 'api-services',
      title: 'API Services',
      description: 'Manage internal and external API integrations',
      icon: Activity,
      route: '/api-services',
      status: 'active',
      items: ['REST APIs', 'GraphQL', 'Webhooks', 'Rate Limiting']
    },
    {
      id: 'database-connectors',
      title: 'Database Connectors',
      description: 'Connect to various database systems',
      icon: Database,
      route: '/agents', // Preserved within agent ecosystem
      status: 'active',
      items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Oracle']
    },
    {
      id: 'security-gateway',
      title: 'Security Gateway',
      description: 'Authentication and authorization management',
      icon: Shield,
      route: '/security',
      status: 'active',
      items: ['OAuth 2.0', 'JWT Tokens', 'API Keys', 'Rate Limits']
    },
    {
      id: 'data-import',
      title: 'Data Import/Export',
      description: 'Bulk data operations and migrations',
      icon: Upload,
      route: '/data-import',
      status: 'active',
      items: ['CSV Import', 'Excel Export', 'JSON Sync', 'Database Migration']
    },
    {
      id: 'external-services',
      title: 'External Services',
      description: 'Third-party service integrations',
      icon: Globe,
      route: '/ngrok',
      status: 'active',
      items: ['Payment Gateways', 'Email Services', 'SMS Providers', 'Cloud Storage']
    },
    {
      id: 'workflow-automation',
      title: 'Workflow Automation',
      description: 'Automated business process management',
      icon: Bot,
      route: '/agents',
      status: 'active',
      items: ['Process Flows', 'Event Triggers', 'Notifications', 'Scheduling']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Zap className="h-4 w-4 text-green-600" />;
      case 'pending': return <Settings className="h-4 w-4 text-yellow-600" />;
      case 'inactive': return <Settings className="h-4 w-4 text-red-600" />;
      default: return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <AppLayout title="System Integration Hub">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Network className="h-8 w-8 text-primary" />
              System Integration Hub
            </h1>
            <p className="text-muted-foreground mt-2">
              Unified access to all integration tools and services. Database connectors and system connectors remain in the Agent ecosystem for workflow management.
            </p>
          </div>
        </div>

        {/* Integration Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Active Integrations</p>
                  <p className="text-2xl font-bold text-blue-900">{integrationSections.filter(s => s.status === 'active').length}</p>
                </div>
                <Network className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">API Services</p>
                  <p className="text-2xl font-bold text-green-900">12</p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">External Services</p>
                  <p className="text-2xl font-bold text-purple-900">8</p>
                </div>
                <Globe className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrationSections.map((section) => {
            const Icon = section.icon;
            
            return (
              <Card key={section.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(section.status)}
                      <Badge className={getStatusColor(section.status)}>
                        {section.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                  
                  {/* Features List */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Features:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {section.items.map((item, index) => (
                        <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                          <div className="w-1 h-1 bg-primary rounded-full"></div>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      onClick={() => navigate(section.route)}
                      className="flex-1"
                      size="sm"
                    >
                      <Link2 className="h-3 w-3 mr-1" />
                      Access
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Integration Architecture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Integration Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Preserved in Agent Ecosystem:</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded">
                    <Database className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">System Connectors</p>
                      <p className="text-sm text-gray-600">Remain in Agent Actions & Configuration</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded">
                    <Bot className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Workflow Integration</p>
                      <p className="text-sm text-gray-600">Agent-specific connector assignments</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Consolidated Here:</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded">
                    <Activity className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">API Services</p>
                      <p className="text-sm text-gray-600">Centralized API management</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded">
                    <Globe className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">External Services</p>
                      <p className="text-sm text-gray-600">Third-party integrations hub</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SystemIntegration;