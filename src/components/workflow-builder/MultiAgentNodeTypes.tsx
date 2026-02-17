/**
 * Multi-Agent Node Types for Canvas
 * Adds A2A, Orchestration, and Agentic AI nodes to the workflow builder
 */

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Users, 
  Brain, 
  Network, 
  Link2, 
  Zap, 
  MessageSquare,
  Activity,
  GitBranch
} from 'lucide-react';

// Type for node data with proper typing
interface NodeData {
  label?: string;
  role?: string;
  intent?: string;
  members?: Array<{ name?: string }>;
  pattern?: string;
  maxIterations?: number;
  goal?: string;
  consensusThreshold?: number;
  question?: string;
  tools?: string[];
  protocol?: string;
  messageTypes?: string[];
  [key: string]: unknown;
}

// A2A Agent Node - Represents an agent with A2A protocol support
export const A2AAgentNode: React.FC<NodeProps> = ({ data: rawData, selected }) => {
  const data = rawData as NodeData;
  return (
    <div className={`
      relative bg-card border-2 rounded-lg p-3 min-w-[180px] shadow-sm
      ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
      hover:shadow-md transition-shadow
    `}>
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-blue-100 text-blue-700">
          <Bot className="h-4 w-4" />
        </div>
        <span className="font-medium text-sm truncate">{data.label}</span>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-2">
        <Badge variant="outline" className="text-xs bg-blue-50">A2A</Badge>
        {data.role && (
          <Badge variant="secondary" className="text-xs capitalize">
            {data.role}
          </Badge>
        )}
      </div>
      
      {data.intent && (
        <p className="text-xs text-muted-foreground truncate">{data.intent}</p>
      )}
      
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  );
};

// Multi-Agent Team Node - Represents a coordinated team of agents
export const AgentTeamNode: React.FC<NodeProps> = ({ data: rawData, selected }) => {
  const data = rawData as NodeData;
  const members = data.members || [];
  
  return (
    <div className={`
      relative bg-card border-2 rounded-lg p-3 min-w-[200px] shadow-sm
      ${selected ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-border'}
      hover:shadow-md transition-shadow
    `}>
      <Handle type="target" position={Position.Top} className="!bg-purple-500" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-purple-100 text-purple-700">
          <Users className="h-4 w-4" />
        </div>
        <span className="font-medium text-sm">{data.label || 'Agent Team'}</span>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-2">
        <Badge variant="outline" className="text-xs bg-purple-50">
          {data.pattern || 'hierarchical'}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {members.length} agents
        </Badge>
      </div>
      
      {members.length > 0 && (
        <div className="flex -space-x-2 mt-2">
          {members.slice(0, 4).map((m: any, i: number) => (
            <div 
              key={i}
              className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center"
              title={m.name || `Agent ${i + 1}`}
            >
              <Bot className="h-3 w-3 text-primary" />
            </div>
          ))}
          {members.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
              +{members.length - 4}
            </div>
          )}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
    </div>
  );
};

// ReAct Reasoning Node - For agentic AI reasoning loops
export const ReActNode: React.FC<NodeProps> = ({ data: rawData, selected }) => {
  const data = rawData as NodeData;
  return (
    <div className={`
      relative bg-card border-2 rounded-lg p-3 min-w-[180px] shadow-sm
      ${selected ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-border'}
      hover:shadow-md transition-shadow
    `}>
      <Handle type="target" position={Position.Top} className="!bg-amber-500" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-amber-100 text-amber-700">
          <Brain className="h-4 w-4" />
        </div>
        <span className="font-medium text-sm">{data.label || 'ReAct Loop'}</span>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-2">
        <Badge variant="outline" className="text-xs bg-amber-50">Reasoning</Badge>
        <Badge variant="secondary" className="text-xs">
          Max {data.maxIterations || 10} iterations
        </Badge>
      </div>
      
      {data.goal && (
        <p className="text-xs text-muted-foreground truncate">{data.goal}</p>
      )}
      
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500" />
    </div>
  );
};

// Swarm Decision Node - For collective agent decision-making
export const SwarmDecisionNode: React.FC<NodeProps> = ({ data: rawData, selected }) => {
  const data = rawData as NodeData;
  return (
    <div className={`
      relative bg-card border-2 rounded-lg p-3 min-w-[180px] shadow-sm
      ${selected ? 'border-green-500 ring-2 ring-green-500/20' : 'border-border'}
      hover:shadow-md transition-shadow
    `}>
      <Handle type="target" position={Position.Top} className="!bg-green-500" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-green-100 text-green-700">
          <Network className="h-4 w-4" />
        </div>
        <span className="font-medium text-sm">{data.label || 'Swarm Decision'}</span>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-2">
        <Badge variant="outline" className="text-xs bg-green-50">Consensus</Badge>
        <Badge variant="secondary" className="text-xs">
          {Math.round((data.consensusThreshold || 0.7) * 100)}% threshold
        </Badge>
      </div>
      
      {data.question && (
        <p className="text-xs text-muted-foreground truncate">{data.question}</p>
      )}
      
      <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
    </div>
  );
};

// Tool Chain Node - For chained tool execution
export const ToolChainNode: React.FC<NodeProps> = ({ data: rawData, selected }) => {
  const data = rawData as NodeData;
  const tools = data.tools || [];
  
  return (
    <div className={`
      relative bg-card border-2 rounded-lg p-3 min-w-[180px] shadow-sm
      ${selected ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-border'}
      hover:shadow-md transition-shadow
    `}>
      <Handle type="target" position={Position.Top} className="!bg-cyan-500" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-cyan-100 text-cyan-700">
          <Link2 className="h-4 w-4" />
        </div>
        <span className="font-medium text-sm">{data.label || 'Tool Chain'}</span>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-2">
        <Badge variant="outline" className="text-xs bg-cyan-50">Chain</Badge>
        <Badge variant="secondary" className="text-xs">
          {tools.length} tools
        </Badge>
      </div>
      
      {tools.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {tools.slice(0, 3).map((tool: string, i: number) => (
            <React.Fragment key={tool}>
              <span className="bg-muted px-1 rounded">{tool}</span>
              {i < Math.min(tools.length - 1, 2) && <span>→</span>}
            </React.Fragment>
          ))}
          {tools.length > 3 && <span>...</span>}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-500" />
    </div>
  );
};

// Task Handoff Node - For agent-to-agent task delegation
export const TaskHandoffNode: React.FC<NodeProps> = ({ data: rawData, selected }) => {
  const data = rawData as NodeData;
  return (
    <div className={`
      relative bg-card border-2 rounded-lg p-3 min-w-[180px] shadow-sm
      ${selected ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-border'}
      hover:shadow-md transition-shadow
    `}>
      <Handle type="target" position={Position.Top} className="!bg-orange-500" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-orange-100 text-orange-700">
          <GitBranch className="h-4 w-4" />
        </div>
        <span className="font-medium text-sm">{data.label || 'Task Handoff'}</span>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-2">
        <Badge variant="outline" className="text-xs bg-orange-50">Handoff</Badge>
        {data.protocol && (
          <Badge variant="secondary" className="text-xs capitalize">
            {data.protocol}
          </Badge>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-orange-500" />
    </div>
  );
};

// Communication Hub Node - Central message routing
export const CommunicationHubNode: React.FC<NodeProps> = ({ data: rawData, selected }) => {
  const data = rawData as NodeData;
  return (
    <div className={`
      relative bg-card border-2 rounded-lg p-3 min-w-[180px] shadow-sm
      ${selected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-border'}
      hover:shadow-md transition-shadow
    `}>
      <Handle type="target" position={Position.Top} className="!bg-indigo-500" />
      <Handle type="target" position={Position.Left} className="!bg-indigo-500" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-700">
          <MessageSquare className="h-4 w-4" />
        </div>
        <span className="font-medium text-sm">{data.label || 'Communication Hub'}</span>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-2">
        <Badge variant="outline" className="text-xs bg-indigo-50">Hub</Badge>
        <Badge variant="secondary" className="text-xs">
          {data.messageTypes?.length || 0} types
        </Badge>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500" />
      <Handle type="source" position={Position.Right} className="!bg-indigo-500" />
    </div>
  );
};

// API Integration Node - For connecting to external APIs (Optum, etc.)
export const APIIntegrationNode: React.FC<NodeProps> = ({ data: rawData, selected }) => {
  const data = rawData as NodeData & {
    apiProvider?: string;
    apiType?: string;
    status?: 'ready' | 'linked' | 'needs-setup';
    isHIPAACompliant?: boolean;
  };
  
  const getStatusColor = () => {
    switch (data.status) {
      case 'ready': return 'bg-green-100 text-green-700 border-green-300';
      case 'linked': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-amber-100 text-amber-700 border-amber-300';
    }
  };
  
  return (
    <div className={`
      relative bg-card border-2 rounded-lg p-3 min-w-[200px] shadow-sm
      ${selected ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-border'}
      hover:shadow-md transition-shadow
    `}>
      <Handle type="target" position={Position.Top} className="!bg-teal-500" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-teal-100 text-teal-700">
          <Link2 className="h-4 w-4" />
        </div>
        <span className="font-medium text-sm">{data.label || 'API Integration'}</span>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-2">
        <Badge variant="outline" className={`text-xs ${getStatusColor()}`}>
          {data.status === 'ready' ? '✓ Ready' : data.status === 'linked' ? '🔗 Linked' : '⚙️ Setup'}
        </Badge>
        {data.apiProvider && (
          <Badge variant="secondary" className="text-xs">
            {data.apiProvider}
          </Badge>
        )}
        {data.isHIPAACompliant && (
          <Badge variant="outline" className="text-xs bg-green-50 text-green-600">
            HIPAA
          </Badge>
        )}
      </div>
      
      {data.apiType && (
        <p className="text-xs text-muted-foreground truncate">{data.apiType}</p>
      )}
      
      <Handle type="source" position={Position.Bottom} className="!bg-teal-500" />
    </div>
  );
};

// Export all multi-agent node types for registration
export const multiAgentNodeTypes = {
  a2a_agent: A2AAgentNode,
  agent_team: AgentTeamNode,
  react_loop: ReActNode,
  swarm_decision: SwarmDecisionNode,
  tool_chain: ToolChainNode,
  task_handoff: TaskHandoffNode,
  communication_hub: CommunicationHubNode,
  api_integration: APIIntegrationNode
};

// Node type definitions for canvas registration
export const multiAgentNodeDefinitions = [
  {
    type_key: 'a2a_agent',
    display_name: 'A2A Agent',
    description: 'Agent with A2A protocol support for inter-agent communication',
    category: 'Multi-Agent',
    icon: 'Bot',
    color: '#3B82F6'
  },
  {
    type_key: 'agent_team',
    display_name: 'Agent Team',
    description: 'Coordinated team of agents with orchestration patterns',
    category: 'Multi-Agent',
    icon: 'Users',
    color: '#A855F7'
  },
  {
    type_key: 'react_loop',
    display_name: 'ReAct Loop',
    description: 'Reasoning and acting loop for autonomous goal achievement',
    category: 'Agentic AI',
    icon: 'Brain',
    color: '#F59E0B'
  },
  {
    type_key: 'swarm_decision',
    display_name: 'Swarm Decision',
    description: 'Collective decision-making through agent voting',
    category: 'Multi-Agent',
    icon: 'Network',
    color: '#22C55E'
  },
  {
    type_key: 'tool_chain',
    display_name: 'Tool Chain',
    description: 'Sequential tool execution with output chaining',
    category: 'Agentic AI',
    icon: 'Link2',
    color: '#06B6D4'
  },
  {
    type_key: 'task_handoff',
    display_name: 'Task Handoff',
    description: 'Delegate tasks between agents',
    category: 'Multi-Agent',
    icon: 'GitBranch',
    color: '#F97316'
  },
  {
    type_key: 'communication_hub',
    display_name: 'Communication Hub',
    description: 'Central routing for agent messages',
    category: 'Multi-Agent',
    icon: 'MessageSquare',
    color: '#6366F1'
  },
  {
    type_key: 'api_integration',
    display_name: 'API Integration',
    description: 'External API connection (Optum, payers, EHRs)',
    category: 'Integrations',
    icon: 'Link2',
    color: '#14B8A6'
  }
];
