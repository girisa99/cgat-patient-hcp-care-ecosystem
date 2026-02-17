import React, { useState } from 'react';
import { BaseWorkflowNode } from './BaseWorkflowNode';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plug, Plus, X, CheckCircle, XCircle } from 'lucide-react';

interface Connector {
  id: string;
  name: string;
  type: 'rest_api' | 'graphql' | 'database' | 'webhook' | 'email' | 'sms' | 'slack' | 'teams' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  config: {
    url?: string;
    apiKey?: string;
    username?: string;
    password?: string;
    database?: string;
    custom?: Record<string, any>;
  };
  enabled: boolean;
}

export const ConnectorsNode: React.FC<{ id: string; data: any; selected: boolean }> = ({ id, data, selected }) => {
  const [connectors, setConnectors] = useState<Connector[]>(data.connectors || [
    {
      id: '1',
      name: 'Customer API',
      type: 'rest_api',
      status: 'connected',
      config: { url: 'https://api.example.com', apiKey: '***' },
      enabled: true
    },
    {
      id: '2',
      name: 'Slack Notifications',
      type: 'slack',
      status: 'disconnected',
      config: {},
      enabled: false
    }
  ]);
  const [isExpanded, setIsExpanded] = useState(false);

  const addConnector = () => {
    const newConnector: Connector = {
      id: Date.now().toString(),
      name: 'New Connector',
      type: 'rest_api',
      status: 'disconnected',
      config: {},
      enabled: false
    };
    setConnectors([...connectors, newConnector]);
  };

  const updateConnector = (id: string, updates: Partial<Connector>) => {
    setConnectors(connectors.map(connector => 
      connector.id === id ? { ...connector, ...updates } : connector
    ));
  };

  const deleteConnector = (id: string) => {
    setConnectors(connectors.filter(connector => connector.id !== id));
  };

  const getStatusIcon = (status: Connector['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return <XCircle className="h-3 w-3 text-gray-400" />;
    }
  };

  const getTypeColor = (type: Connector['type']) => {
    const colors = {
      rest_api: 'bg-blue-100 text-blue-800',
      graphql: 'bg-purple-100 text-purple-800',
      database: 'bg-orange-100 text-orange-800',
      webhook: 'bg-green-100 text-green-800',
      email: 'bg-red-100 text-red-800',
      sms: 'bg-yellow-100 text-yellow-800',
      slack: 'bg-pink-100 text-pink-800',
      teams: 'bg-indigo-100 text-indigo-800',
      custom: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <BaseWorkflowNode
      id={id}
      data={data}
      selected={selected}
      icon={Plug}
      title="Connectors"
      className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {connectors.length} Connector{connectors.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="text-xs text-green-600">
              {connectors.filter(c => c.status === 'connected').length} Active
            </Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-xs"
          >
            {isExpanded ? 'Collapse' : 'Configure'}
          </Button>
        </div>

        {!isExpanded && (
          <div className="space-y-1">
            {connectors.map((connector) => (
              <div key={connector.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getStatusIcon(connector.status)}
                  <span className="text-xs truncate">{connector.name}</span>
                </div>
                <Badge variant="outline" className={`text-[10px] px-1 ${getTypeColor(connector.type)}`}>
                  {connector.type.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {isExpanded && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {connectors.map((connector) => (
              <div key={connector.id} className="p-2 bg-white rounded border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {getStatusIcon(connector.status)}
                    <Input
                      value={connector.name}
                      onChange={(e) => updateConnector(connector.id, { name: e.target.value })}
                      className="h-6 text-xs"
                      placeholder="Connector name"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={connector.enabled}
                      onCheckedChange={(enabled) => updateConnector(connector.id, { enabled })}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteConnector(connector.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Type</Label>
                    <Select value={connector.type} onValueChange={(value: any) => updateConnector(connector.id, { type: value })}>
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rest_api">REST API</SelectItem>
                        <SelectItem value="graphql">GraphQL</SelectItem>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="slack">Slack</SelectItem>
                        <SelectItem value="teams">Teams</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Status</Label>
                    <Select value={connector.status} onValueChange={(value: any) => updateConnector(connector.id, { status: value })}>
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="connected">Connected</SelectItem>
                        <SelectItem value="disconnected">Disconnected</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Configuration</Label>
                  <Textarea
                    value={JSON.stringify(connector.config, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value);
                        updateConnector(connector.id, { config });
                      } catch {
                        // Invalid JSON, don't update
                      }
                    }}
                    className="min-h-[60px] text-xs font-mono"
                    placeholder="Connector configuration JSON"
                  />
                </div>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={addConnector}
              className="w-full h-8 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Connector
            </Button>
          </div>
        )}
      </div>
    </BaseWorkflowNode>
  );
};