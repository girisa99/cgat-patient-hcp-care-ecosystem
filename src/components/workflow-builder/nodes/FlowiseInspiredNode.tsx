import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  Bot, 
  Database, 
  Zap, 
  Plus, 
  X,
  Copy,
  Trash2,
  Target,
  Eye,
  EyeOff
} from 'lucide-react';

interface FlowiseNodeProps {
  id: string;
  data: any;
  selected: boolean;
}

export const FlowiseInspiredNode: React.FC<FlowiseNodeProps> = ({ id, data, selected }) => {
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);
  const [config, setConfig] = useState(data.config || {});
  const [nodeState, setNodeState] = useState({
    status: data.status || 'ready',
    isRunning: false,
    output: null
  });

  useEffect(() => {
    if (selected) setIsConfigExpanded(true);
  }, [selected]);

  // Open when external flag set (e.g., 'open-node-config')
  useEffect(() => {
    if (data?.configOpen) setIsConfigExpanded(true);
  }, [data?.configOpen]);

  // Keep local config in sync with node data
  useEffect(() => {
    if (data?.config) setConfig(data.config);
  }, [data?.config]);

  // Handle config changes
  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    // Emit event to update node data
    window.dispatchEvent(new CustomEvent('node-config-updated', {
      detail: { nodeId: id, config: newConfig }
    }));
  };

  // Determine node appearance based on type
  const getNodeStyle = () => {
    const baseStyle = "min-w-[280px] max-w-[400px] bg-white border-2 shadow-lg rounded-xl";
    
    switch (data.type) {
      case 'aiIntelligence':
      case 'agentNode':
        return `${baseStyle} border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50`;
      case 'dataSource':
        return `${baseStyle} border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50`;
      case 'condition':
      case 'decision':
        return `${baseStyle} border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50`;
      case 'start':
        return `${baseStyle} border-green-200 bg-gradient-to-br from-green-50 to-emerald-50`;
      default:
        return `${baseStyle} border-gray-200`;
    }
  };

  // Get node icon
  const getNodeIcon = () => {
    switch (data.type) {
      case 'aiIntelligence':
      case 'agentNode':
      case 'llm':
        return Bot;
      case 'dataSource':
      case 'database':
        return Database;
      case 'condition':
      case 'decision':
        return Target;
      default:
        return Zap;
    }
  };

  const NodeIcon = getNodeIcon();

  return (
    <div className={getNodeStyle()}>
      {/* Node Toolbar */}
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div className="flex items-center gap-1 bg-white rounded-md shadow-lg border p-1">
          <Button size="sm" variant="ghost" onClick={() => {
            setIsConfigExpanded(!isConfigExpanded);
            window.dispatchEvent(new CustomEvent('open-node-config', { detail: { nodeId: id } }));
          }}>
            <Settings className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => {
            window.dispatchEvent(new CustomEvent('duplicate-node', { detail: { nodeId: id } }));
          }}>
            <Copy className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => {
            window.dispatchEvent(new CustomEvent('delete-node', { detail: { nodeId: id } }));
          }}>
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setNodeState(prev => ({ ...prev, isRunning: !prev.isRunning }))}>
            {nodeState.status === 'running' ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
        </div>
      </NodeToolbar>

      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />

      {/* Node Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white rounded-md shadow-sm">
              <NodeIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">{data.label || data.title}</h3>
              <p className="text-xs text-muted-foreground">{data.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={nodeState.status === 'running' ? 'default' : 'secondary'} 
              className="text-xs"
            >
              {nodeState.status}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsConfigExpanded(!isConfigExpanded)}
              className="h-6 w-6 p-0"
            >
              {isConfigExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Node Configuration Panel */}
      <Collapsible open={isConfigExpanded} onOpenChange={setIsConfigExpanded}>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-72 pr-2">
              <div className="space-y-3 border-t pt-3">
              {/* AI Intelligence Configuration */}
              {(data.type === 'aiIntelligence' || data.type === 'agentNode') && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium">AI Model</Label>
                    <Select 
                      value={config.model || ''} 
                      onValueChange={(value) => updateConfig('model', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select AI Model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                        <SelectItem value="claude-3">Claude 3</SelectItem>
                        <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium">System Prompt</Label>
                    <Textarea 
                      placeholder="Enter system instructions..."
                      className="min-h-[60px] text-xs"
                      value={config.systemPrompt || ''}
                      onChange={(e) => updateConfig('systemPrompt', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs font-medium">Temperature</Label>
                      <Input 
                        type="number" 
                        placeholder="0.7"
                        className="h-8 text-xs"
                        value={config.temperature || ''}
                        onChange={(e) => updateConfig('temperature', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Max Tokens</Label>
                      <Input 
                        type="number" 
                        placeholder="1000"
                        className="h-8 text-xs"
                        value={config.maxTokens || ''}
                        onChange={(e) => updateConfig('maxTokens', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Data Source Configuration */}
              {data.type === 'dataSource' && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium">Connection Type</Label>
                    <Select 
                      value={config.connectionType || ''} 
                      onValueChange={(value) => updateConfig('connectionType', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Connection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="api">REST API</SelectItem>
                        <SelectItem value="file">File Upload</SelectItem>
                        <SelectItem value="vector">Vector Database</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium">Connection String</Label>
                    <Input 
                      placeholder="Enter connection details..."
                      className="h-8 text-xs"
                      value={config.connectionString || ''}
                      onChange={(e) => updateConfig('connectionString', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Condition/Decision Configuration */}
              {(data.type === 'condition' || data.type === 'decision') && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium">Condition Logic</Label>
                    <Select 
                      value={config.conditionType || ''} 
                      onValueChange={(value) => updateConfig('conditionType', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="if-else">If-Else</SelectItem>
                        <SelectItem value="switch">Switch</SelectItem>
                        <SelectItem value="custom">Custom Logic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium">Condition Expression</Label>
                    <Input 
                      placeholder="e.g., user.role === 'admin'"
                      className="h-8 text-xs"
                      value={config.expression || ''}
                      onChange={(e) => updateConfig('expression', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Variable
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 text-xs"
                    onClick={() => setNodeState(prev => ({ ...prev, isRunning: !prev.isRunning }))}
                  >
                    Test
                  </Button>
                  <Button size="sm" className="h-6 text-xs">
                    Save
                  </Button>
                </div>
              </div>
            </div>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};