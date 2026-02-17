/**
 * AGENT TYPE NODES
 * React Flow nodes specifically for agent types with MCP integration
 */
import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Brain, 
  Code, 
  Database, 
  MessageSquare, 
  Stethoscope,
  Github,
  Zap,
  Settings,
  Play,
  Pause,
  Activity
} from 'lucide-react';

export type AgentNodeType = 
  | 'conversational-agent'
  | 'code-generation-agent'
  | 'healthcare-agent'
  | 'data-processing-agent'
  | 'integration-agent'
  | 'github-agent'
  | 'mcp-agent';

interface AgentNodeData {
  label: string;
  agentType: AgentNodeType;
  mcpTools?: string[];
  models?: string[];
  channels?: string[];
  status?: 'active' | 'inactive' | 'training';
  tokenUsage?: {
    used: number;
    remaining: number;
    total: number;
  };
  lastActivity?: string;
  config?: any;
}

const AGENT_NODE_CONFIGS = {
  'conversational-agent': {
    icon: MessageSquare,
    color: 'bg-blue-500',
    description: 'Conversational AI agent with natural language processing',
    defaultMcpTools: ['conversation-manager', 'context-tracker', 'sentiment-analysis']
  },
  'code-generation-agent': {
    icon: Code,
    color: 'bg-green-500',
    description: 'Code generation and automated programming assistant',
    defaultMcpTools: ['code-generator', 'syntax-validator', 'github-integration']
  },
  'healthcare-agent': {
    icon: Stethoscope,
    color: 'bg-red-500',
    description: 'HIPAA-compliant healthcare workflow agent',
    defaultMcpTools: ['patient-data-handler', 'clinical-validator', 'compliance-checker']
  },
  'data-processing-agent': {
    icon: Database,
    color: 'bg-purple-500',
    description: 'Data transformation and analysis agent',
    defaultMcpTools: ['data-transformer', 'analytics-processor', 'report-generator']
  },
  'integration-agent': {
    icon: Zap,
    color: 'bg-orange-500',
    description: 'Third-party system integration agent',
    defaultMcpTools: ['api-connector', 'webhook-handler', 'data-mapper']
  },
  'github-agent': {
    icon: Github,
    color: 'bg-gray-800',
    description: 'GitHub repository management and CI/CD agent',
    defaultMcpTools: ['repo-manager', 'pr-handler', 'deployment-tracker']
  },
  'mcp-agent': {
    icon: Brain,
    color: 'bg-indigo-500',
    description: 'Model Context Protocol orchestration agent',
    defaultMcpTools: ['protocol-handler', 'context-manager', 'model-switcher']
  }
};

export const AgentTypeNode: React.FC<NodeProps<any>> = ({ data, selected }) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isRunning, setIsRunning] = useState((data as AgentNodeData).status === 'active');

  const agentData = data as AgentNodeData;
  const config = AGENT_NODE_CONFIGS[agentData.agentType];
  const IconComponent = config.icon;

  const handleStart = useCallback(() => {
    setIsRunning(true);
    // Integration point for starting agent
    console.log(`Starting agent: ${agentData.label}`);
  }, [agentData.label]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    // Integration point for stopping agent
    console.log(`Stopping agent: ${agentData.label}`);
  }, [agentData.label]);

  const handleConfigure = useCallback(() => {
    setIsConfigOpen(true);
    // Integration point for agent configuration
    console.log(`Configuring agent: ${agentData.label}`);
  }, [agentData.label]);

  return (
    <Card className={`min-w-[280px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle type="target" position={Position.Top} />
      
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${config.color} text-white`}>
            <IconComponent className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-sm">{agentData.label}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {config.description}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {isRunning ? (
              <Badge variant="default" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Inactive
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* MCP Tools */}
        {agentData.mcpTools && agentData.mcpTools.length > 0 && (
          <div>
            <div className="text-xs font-medium mb-1">MCP Tools</div>
            <div className="flex flex-wrap gap-1">
              {agentData.mcpTools.slice(0, 3).map((tool) => (
                <Badge key={tool} variant="outline" className="text-xs">
                  {tool}
                </Badge>
              ))}
              {agentData.mcpTools.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{agentData.mcpTools.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Models */}
        {agentData.models && agentData.models.length > 0 && (
          <div>
            <div className="text-xs font-medium mb-1">Models</div>
            <div className="flex flex-wrap gap-1">
              {agentData.models.slice(0, 2).map((model) => (
                <Badge key={model} variant="secondary" className="text-xs">
                  {model}
                </Badge>
              ))}
              {agentData.models.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{agentData.models.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Channels */}
        {agentData.channels && agentData.channels.length > 0 && (
          <div>
            <div className="text-xs font-medium mb-1">Channels</div>
            <div className="flex flex-wrap gap-1">
              {agentData.channels.slice(0, 2).map((channel) => (
                <Badge key={channel} variant="outline" className="text-xs">
                  {channel}
                </Badge>
              ))}
              {agentData.channels.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{agentData.channels.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Token Usage */}
        {agentData.tokenUsage && (
          <div>
            <div className="text-xs font-medium mb-1">Token Usage</div>
            <div className="text-xs text-muted-foreground">
              {agentData.tokenUsage.used.toLocaleString()} / {agentData.tokenUsage.total.toLocaleString()}
              <div className="w-full bg-muted rounded-full h-1 mt-1">
                <div 
                  className="bg-primary h-1 rounded-full" 
                  style={{ width: `${(agentData.tokenUsage.used / agentData.tokenUsage.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={isRunning ? "destructive" : "default"}
            onClick={isRunning ? handleStop : handleStart}
            className="flex-1 h-7 text-xs"
          >
            {isRunning ? (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                Start
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleConfigure}
            className="h-7 px-2"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>

        {/* Last Activity */}
        {agentData.lastActivity && (
          <div className="text-xs text-muted-foreground">
            Last active: {agentData.lastActivity}
          </div>
        )}
      </CardContent>

      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
};

// Node type registry for React Flow
export const AGENT_NODE_TYPES = {
  'conversational-agent': AgentTypeNode,
  'code-generation-agent': AgentTypeNode,
  'healthcare-agent': AgentTypeNode,
  'data-processing-agent': AgentTypeNode,
  'integration-agent': AgentTypeNode,
  'github-agent': AgentTypeNode,
  'mcp-agent': AgentTypeNode,
};

// Utility function to create agent node data
export const createAgentNode = (
  id: string, 
  agentType: AgentNodeType, 
  label: string,
  position: { x: number; y: number },
  additionalData?: Partial<AgentNodeData>
) => ({
  id,
  type: agentType,
  position,
  data: {
    label,
    agentType,
    mcpTools: AGENT_NODE_CONFIGS[agentType].defaultMcpTools,
    status: 'inactive' as const,
    ...additionalData
  }
});