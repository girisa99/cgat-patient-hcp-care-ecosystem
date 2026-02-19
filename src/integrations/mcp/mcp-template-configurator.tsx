/**
 * MCP Template Configurator
 * Allows users to configure and select MCP backend strategies
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Cloud, Brain, FileText, Settings, CheckCircle } from 'lucide-react';

import { defaultDatabaseServer } from './database-server';
import { defaultAPIServer } from './api-server';
import { defaultMemoryServer } from './memory-server';
import { defaultFileSystemServer } from './filesystem-server';
import { defaultHealthcareServer } from './healthcare-server';

export interface MCPConfiguration {
  strategy: 'database' | 'api' | 'memory' | 'file' | 'hybrid';
  enabledServers: string[];
  conversationalAI: {
    enabled: boolean;
    model: string;
    contextDepth: 'shallow' | 'medium' | 'deep';
  };
  structuredAI: {
    enabled: boolean;
    validation: boolean;
    autoCorrection: boolean;
  };
  mcpIntegration: {
    enabled: boolean;
    servers: string[];
    fallbackStrategy: string;
  };
}

const MCPTemplateConfigurator: React.FC = () => {
  const [config, setConfig] = useState<MCPConfiguration>({
    strategy: 'hybrid',
    enabledServers: ['database', 'memory', 'api'],
    conversationalAI: {
      enabled: true,
      model: 'gpt-4o',
      contextDepth: 'medium'
    },
    structuredAI: {
      enabled: true,
      validation: true,
      autoCorrection: false
    },
    mcpIntegration: {
      enabled: true,
      servers: ['database', 'memory'],
      fallbackStrategy: 'memory'
    }
  });

  const mcpServers = [
    {
      id: 'database',
      name: 'Database MCP',
      description: 'Real-time Supabase integration with conversation context',
      icon: Database,
      capabilities: ['Real-time updates', 'Conversation memory', 'Context search', 'Agent memory'],
      server: defaultDatabaseServer
    },
    {
      id: 'api',
      name: 'API MCP',
      description: 'External healthcare API integrations',
      icon: Cloud,
      capabilities: ['FHIR APIs', 'NPI Registry', 'Drug databases', 'Rate limiting'],
      server: defaultAPIServer
    },
    {
      id: 'memory',
      name: 'Memory MCP',
      description: 'High-speed in-memory context storage',
      icon: Brain,
      capabilities: ['Fast access', 'Compression', 'TTL management', 'Bulk operations'],
      server: defaultMemoryServer
    },
    {
      id: 'file',
      name: 'File MCP',
      description: 'Secure healthcare file system operations',
      icon: FileText,
      capabilities: ['Document access', 'File validation', 'Secure paths', 'Audit logging'],
      server: defaultFileSystemServer
    }
  ];

  const generateTemplate = () => {
    return {
      name: `Healthcare MCP Template - ${config.strategy}`,
      description: `AI-powered healthcare template with ${config.strategy} MCP strategy`,
      configuration: config,
      servers: config.enabledServers.map(serverId => 
        mcpServers.find(s => s.id === serverId)?.server
      ).filter(Boolean),
      aiIntegration: {
        mcp: { 
          count: config.enabledServers.length, 
          status: config.mcpIntegration.enabled ? 'active' : 'inactive' 
        },
        conversational: { 
          count: config.conversationalAI.enabled ? 15 : 0, 
          status: config.conversationalAI.enabled ? 'active' : 'inactive' 
        },
        structured: { 
          count: config.structuredAI.enabled ? 10 : 0, 
          status: config.structuredAI.enabled ? 'active' : 'inactive' 
        }
      }
    };
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            MCP Template Configurator
          </CardTitle>
          <CardDescription>
            Configure your Model Context Protocol strategy for AI-powered healthcare workflows
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="strategy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="strategy">MCP Strategy</TabsTrigger>
          <TabsTrigger value="ai">AI Integration</TabsTrigger>
          <TabsTrigger value="preview">Template Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="strategy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select MCP Backend Strategy</CardTitle>
              <CardDescription>Choose how AI agents access and store context data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mcpServers.map((server) => (
                  <Card 
                    key={server.id} 
                    className={`cursor-pointer transition-all ${
                      config.enabledServers.includes(server.id) 
                        ? 'ring-2 ring-primary' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => {
                      const newServers = config.enabledServers.includes(server.id)
                        ? config.enabledServers.filter(s => s !== server.id)
                        : [...config.enabledServers, server.id];
                      setConfig({ ...config, enabledServers: newServers });
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <server.icon className="w-8 h-8 text-primary mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{server.name}</h3>
                            {config.enabledServers.includes(server.id) && (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {server.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {server.capabilities.map((cap) => (
                              <Badge key={cap} variant="secondary" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6">
                <Label htmlFor="strategy-select">Overall Strategy</Label>
                <Select 
                  value={config.strategy} 
                  onValueChange={(value: any) => setConfig({ ...config, strategy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="database">Database-First</SelectItem>
                    <SelectItem value="api">API-First</SelectItem>
                    <SelectItem value="memory">Memory-First</SelectItem>
                    <SelectItem value="file">File-First</SelectItem>
                    <SelectItem value="hybrid">Hybrid (Recommended)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversational AI</CardTitle>
                <CardDescription>Natural language interaction capabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={config.conversationalAI.enabled}
                    onCheckedChange={(enabled) => 
                      setConfig({ 
                        ...config, 
                        conversationalAI: { ...config.conversationalAI, enabled }
                      })
                    }
                  />
                  <Label>Enable Conversational AI</Label>
                </div>
                
                <div>
                  <Label>Context Depth</Label>
                  <Select 
                    value={config.conversationalAI.contextDepth}
                    onValueChange={(value: any) => 
                      setConfig({ 
                        ...config, 
                        conversationalAI: { ...config.conversationalAI, contextDepth: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shallow">Shallow (Recent)</SelectItem>
                      <SelectItem value="medium">Medium (Session)</SelectItem>
                      <SelectItem value="deep">Deep (Full History)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Structured AI</CardTitle>
                <CardDescription>Form validation and data structuring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={config.structuredAI.enabled}
                    onCheckedChange={(enabled) => 
                      setConfig({ 
                        ...config, 
                        structuredAI: { ...config.structuredAI, enabled }
                      })
                    }
                  />
                  <Label>Enable Structured AI</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={config.structuredAI.validation}
                    onCheckedChange={(validation) => 
                      setConfig({ 
                        ...config, 
                        structuredAI: { ...config.structuredAI, validation }
                      })
                    }
                  />
                  <Label>Real-time Validation</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Preview</CardTitle>
              <CardDescription>Review your MCP template configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(generateTemplate(), null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
        <Button onClick={() => console.log('Template generated:', generateTemplate())}>
          Generate Template
        </Button>
        <Button variant="outline">
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default MCPTemplateConfigurator;