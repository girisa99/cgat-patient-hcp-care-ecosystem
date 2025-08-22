import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Database, ChevronDown, ChevronRight, Settings2, Globe, Key,
  Save, TestTube, RefreshCw, Shield, Link, Server
} from 'lucide-react';

interface DataSourceNodeProps {
  id: string;
  data: any;
  selected: boolean;
}

export const DataSourceNode: React.FC<DataSourceNodeProps> = ({ id, data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [config, setConfig] = useState({
    sourceType: data.sourceType || 'database',
    name: data.name || 'Database Connection',
    connectionString: data.connectionString || '',
    apiEndpoint: data.apiEndpoint || '',
    authentication: data.authentication || {},
    queries: data.queries || [],
    transformations: data.transformations || [],
    cachingEnabled: data.cachingEnabled || false,
    active: data.active !== false,
  });

  const sourceTypes = [
    { value: 'database', label: 'Database', icon: Database, desc: 'SQL/NoSQL databases' },
    { value: 'api', label: 'REST API', icon: Globe, desc: 'HTTP REST endpoints' },
    { value: 'graphql', label: 'GraphQL', icon: Server, desc: 'GraphQL endpoints' },
    { value: 'webhook', label: 'Webhook', icon: Link, desc: 'Webhook receivers' },
    { value: 'file', label: 'File Storage', icon: Server, desc: 'File systems & cloud storage' },
  ];

  const databaseTypes = [
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Supabase', 'Firebase',
    'DynamoDB', 'Cassandra', 'SQLite', 'MariaDB'
  ];

  const authTypes = [
    { value: 'none', label: 'None' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'apikey', label: 'API Key' },
    { value: 'oauth', label: 'OAuth 2.0' },
  ];

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const selectedSourceType = sourceTypes.find(t => t.value === config.sourceType);
  const IconComponent = selectedSourceType?.icon || Database;

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="custom-handle" />
      
      <Card className={`min-w-[280px] ${selected ? 'ring-2 ring-primary' : ''} ${isExpanded ? 'w-[420px]' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded flex items-center justify-center">
                <IconComponent className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{config.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedSourceType?.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant={config.active ? "default" : "secondary"} className="text-xs">
                {config.active ? 'Connected' : 'Disconnected'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Compact View */}
          {!isExpanded && (
            <div className="space-y-2">
              <div className="text-xs bg-muted/50 rounded p-2">
                <div className="flex justify-between">
                  <span>Queries:</span>
                  <span>{config.queries.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Caching:</span>
                  <span>{config.cachingEnabled ? 'On' : 'Off'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Auth:</span>
                  <span>{config.authentication.type || 'None'}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" className="h-6 text-xs">
                  <Settings2 className="h-3 w-3 mr-1" />
                  Configure
                </Button>
                <Button size="sm" variant="outline" className="h-6 text-xs">
                  <TestTube className="h-3 w-3 mr-1" />
                  Test
                </Button>
              </div>
            </div>
          )}

          {/* Expanded Configuration */}
          {isExpanded && (
            <div className="space-y-4">
              {/* Source Type & Basic Info */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Data Source Type</Label>
                  <Select value={config.sourceType} onValueChange={(value) => updateConfig({ sourceType: value })}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="flex items-center gap-2">
                                <Icon className="h-3 w-3" />
                                {type.label}
                              </div>
                              <div className="text-xs text-muted-foreground">{type.desc}</div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Connection Name</Label>
                  <Input
                    value={config.name}
                    onChange={(e) => updateConfig({ name: e.target.value })}
                    className="h-8 text-xs"
                    placeholder="Enter connection name"
                  />
                </div>
              </div>

              <Separator />

              {/* Connection Details */}
              {config.sourceType === 'database' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Database Type</Label>
                    <Select>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select database" />
                      </SelectTrigger>
                      <SelectContent>
                        {databaseTypes.map((db) => (
                          <SelectItem key={db} value={db.toLowerCase()}>
                            {db}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Connection String</Label>
                    <Input
                      value={config.connectionString}
                      onChange={(e) => updateConfig({ connectionString: e.target.value })}
                      className="h-8 text-xs"
                      placeholder="postgresql://user:pass@host:port/db"
                      type="password"
                    />
                  </div>
                </div>
              )}

              {(config.sourceType === 'api' || config.sourceType === 'graphql') && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">API Endpoint</Label>
                  <Input
                    value={config.apiEndpoint}
                    onChange={(e) => updateConfig({ apiEndpoint: e.target.value })}
                    className="h-8 text-xs"
                    placeholder="https://api.example.com/v1"
                  />
                </div>
              )}

              {/* Authentication */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between h-8 text-xs">
                    <span className="flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      Authentication
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  <Select 
                    value={config.authentication.type || 'none'} 
                    onValueChange={(value) => updateConfig({ 
                      authentication: { ...config.authentication, type: value } 
                    })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {authTypes.map((auth) => (
                        <SelectItem key={auth.value} value={auth.value}>
                          {auth.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {config.authentication.type === 'basic' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Username" className="h-8 text-xs" />
                      <Input placeholder="Password" type="password" className="h-8 text-xs" />
                    </div>
                  )}

                  {(config.authentication.type === 'bearer' || config.authentication.type === 'apikey') && (
                    <Input placeholder="Token/API Key" type="password" className="h-8 text-xs" />
                  )}
                </CollapsibleContent>
              </Collapsible>

              {/* Queries/Operations */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between h-8 text-xs">
                    <span className="flex items-center gap-2">
                      <Database className="h-3 w-3" />
                      Queries ({config.queries.length})
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  <div className="space-y-2">
                    <Input 
                      placeholder="Query name" 
                      className="h-8 text-xs" 
                    />
                    <Textarea 
                      placeholder={config.sourceType === 'database' ? 
                        'SELECT * FROM users WHERE active = true' : 
                        'GET /users?active=true'
                      }
                      className="text-xs resize-none" 
                      rows={2}
                    />
                    <Button size="sm" className="h-6 text-xs">
                      Add Query
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {config.queries.map((query: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                        <span>{query.name || `Query ${index + 1}`}</span>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                          <Settings2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.cachingEnabled}
                    onCheckedChange={(checked) => updateConfig({ cachingEnabled: checked })}
                  />
                  <Label className="text-xs">Enable Caching</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.active}
                    onCheckedChange={(checked) => updateConfig({ active: checked })}
                  />
                  <Label className="text-xs">Active</Label>
                </div>
              </div>

              <Separator />

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Connection Status: {config.active ? 'Connected' : 'Disconnected'}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    <TestTube className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Right} className="custom-handle" />
    </div>
  );
};