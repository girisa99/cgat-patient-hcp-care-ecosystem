/**
 * MULTI-AGENT NODE COMPONENTS
 * React components for A2A, Multi-Agent Orchestration, and Agentic AI nodes
 */

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Network, ArrowRightLeft, Radio, Users, Brain, Share2, 
  RefreshCw, Link, Eye, GitBranch, Activity, Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MultiAgentNodeData {
  label?: string;
  intent?: string;
  description?: string;
  type_key?: string;
  configuration?: Record<string, any>;
  status?: 'idle' | 'running' | 'completed' | 'error';
  metrics?: {
    tasksProcessed?: number;
    avgLatency?: number;
    successRate?: number;
  };
}

interface MultiAgentNodeProps {
  data: MultiAgentNodeData;
  selected?: boolean;
}

// Base wrapper for all multi-agent nodes
const MultiAgentNodeWrapper: React.FC<{
  children: React.ReactNode;
  color: string;
  selected?: boolean;
  status?: string;
}> = ({ children, color, selected, status }) => (
  <div 
    className={cn(
      "rounded-lg border-2 bg-card shadow-lg min-w-[200px] transition-all",
      selected && "ring-2 ring-primary ring-offset-2",
      status === 'running' && "animate-pulse"
    )}
    style={{ borderColor: color }}
  >
    {children}
  </div>
);

// A2A Agent Node
export const A2AAgentNode = memo(({ data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper color="#6366F1" selected={selected} status={data.status}>
    <Handle type="target" position={Position.Top} className="!bg-indigo-500 !w-3 !h-3" />
    <div className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-indigo-500/20">
          <Network className="h-4 w-4 text-indigo-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'A2A Agent'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-indigo-500 text-indigo-500">A2A</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Google A2A Protocol compliant agent'}
      </p>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          {data.configuration?.streaming_enabled ? 'SSE Enabled' : 'SSE Disabled'}
        </span>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-3 !h-3" />
  </MultiAgentNodeWrapper>
));

// Task Handoff Node
export const TaskHandoffNode = memo(({ data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper color="#8B5CF6" selected={selected} status={data.status}>
    <Handle type="target" position={Position.Left} className="!bg-violet-500 !w-3 !h-3" />
    <div className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-violet-500/20">
          <ArrowRightLeft className="h-4 w-4 text-violet-500" />
        </div>
        <span className="font-medium text-sm">{data.label || 'Task Handoff'}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {data.intent || 'Transfer context between agents'}
      </p>
    </div>
    <Handle type="source" position={Position.Right} className="!bg-violet-500 !w-3 !h-3" />
  </MultiAgentNodeWrapper>
));

// Communication Hub Node
export const CommunicationHubNode = memo(({ data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper color="#EC4899" selected={selected} status={data.status}>
    <Handle type="target" position={Position.Top} className="!bg-pink-500 !w-3 !h-3" />
    <Handle type="target" position={Position.Left} className="!bg-pink-500 !w-3 !h-3" id="left" />
    <div className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-pink-500/20">
          <Radio className="h-4 w-4 text-pink-500" />
        </div>
        <span className="font-medium text-sm">{data.label || 'Communication Hub'}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Central message routing'}
      </p>
      <Badge variant="secondary" className="text-[10px]">
        {data.configuration?.routing_strategy || 'round_robin'}
      </Badge>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-pink-500 !w-3 !h-3" />
    <Handle type="source" position={Position.Right} className="!bg-pink-500 !w-3 !h-3" id="right" />
  </MultiAgentNodeWrapper>
));

// Agent Team Node
export const AgentTeamNode = memo(({ data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper color="#10B981" selected={selected} status={data.status}>
    <Handle type="target" position={Position.Top} className="!bg-emerald-500 !w-3 !h-3" />
    <div className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-emerald-500/20">
          <Users className="h-4 w-4 text-emerald-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Agent Team'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-emerald-500 text-emerald-500">
            Multi-Agent
          </Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Coordinated agent team'}
      </p>
      <div className="flex gap-1">
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.orchestration_pattern || 'hierarchical'}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.team_size || 3} agents
        </Badge>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-3 !h-3" />
  </MultiAgentNodeWrapper>
));

// Swarm Decision Node
export const SwarmDecisionNode = memo(({ data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper color="#F59E0B" selected={selected} status={data.status}>
    <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-3 !h-3" />
    <Handle type="target" position={Position.Left} className="!bg-amber-500 !w-3 !h-3" id="left" />
    <Handle type="target" position={Position.Right} className="!bg-amber-500 !w-3 !h-3" id="right" />
    <div className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-amber-500/20">
          <Brain className="h-4 w-4 text-amber-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Swarm Decision'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-amber-500 text-amber-500">
            Swarm
          </Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Collective decision making'}
      </p>
      <div className="flex gap-1">
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.decision_method || 'weighted_voting'}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          ≥{((data.configuration?.confidence_threshold || 0.7) * 100).toFixed(0)}%
        </Badge>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !w-3 !h-3" />
  </MultiAgentNodeWrapper>
));

// Tool Sharing Node
export const ToolSharingNode = memo(({ data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper color="#06B6D4" selected={selected} status={data.status}>
    <Handle type="target" position={Position.Top} className="!bg-cyan-500 !w-3 !h-3" />
    <div className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-cyan-500/20">
          <Share2 className="h-4 w-4 text-cyan-500" />
        </div>
        <span className="font-medium text-sm">{data.label || 'Tool Sharing'}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {data.intent || 'Share tools between agents'}
      </p>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-cyan-500 !w-3 !h-3" />
  </MultiAgentNodeWrapper>
));

// ReAct Loop Node
export const ReActLoopNode = memo(({ data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper color="#EF4444" selected={selected} status={data.status}>
    <Handle type="target" position={Position.Top} className="!bg-red-500 !w-3 !h-3" />
    <div className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-red-500/20 relative">
          <RefreshCw className={cn("h-4 w-4 text-red-500", data.status === 'running' && "animate-spin")} />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'ReAct Loop'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-red-500 text-red-500">
            Agentic
          </Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Reasoning and acting loop'}
      </p>
      <div className="grid grid-cols-4 gap-1 text-[9px] text-center">
        <div className="bg-red-500/10 rounded px-1 py-0.5">Think</div>
        <div className="bg-red-500/10 rounded px-1 py-0.5">Act</div>
        <div className="bg-red-500/10 rounded px-1 py-0.5">Observe</div>
        <div className="bg-red-500/10 rounded px-1 py-0.5">Reflect</div>
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground">
        Max: {data.configuration?.max_iterations || 10} iterations
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-red-500 !w-3 !h-3" />
  </MultiAgentNodeWrapper>
));

// Tool Chain Node
export const ToolChainNode = memo(({ data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper color="#14B8A6" selected={selected} status={data.status}>
    <Handle type="target" position={Position.Left} className="!bg-teal-500 !w-3 !h-3" />
    <div className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-teal-500/20">
          <Link className="h-4 w-4 text-teal-500" />
        </div>
        <span className="font-medium text-sm">{data.label || 'Tool Chain'}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Sequential tool execution'}
      </p>
      <div className="flex items-center gap-1">
        <Zap className="h-3 w-3 text-teal-500" />
        <span className="text-[10px] text-muted-foreground">
          {data.configuration?.chain_type || 'sequential'} • {data.configuration?.max_retries || 3} retries
        </span>
      </div>
    </div>
    <Handle type="source" position={Position.Right} className="!bg-teal-500 !w-3 !h-3" />
  </MultiAgentNodeWrapper>
));

// Self Reflection Node
export const SelfReflectionNode = memo(({ data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper color="#A855F7" selected={selected} status={data.status}>
    <Handle type="target" position={Position.Top} className="!bg-purple-500 !w-3 !h-3" />
    <div className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-purple-500/20">
          <Eye className="h-4 w-4 text-purple-500" />
        </div>
        <span className="font-medium text-sm">{data.label || 'Self Reflection'}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {data.intent || 'Self-evaluation and strategy adjustment'}
      </p>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !w-3 !h-3" />
  </MultiAgentNodeWrapper>
));

// Goal Decomposition Node
export const GoalDecompositionNode = memo(({ data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper color="#F97316" selected={selected} status={data.status}>
    <Handle type="target" position={Position.Top} className="!bg-orange-500 !w-3 !h-3" />
    <div className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-orange-500/20">
          <GitBranch className="h-4 w-4 text-orange-500" />
        </div>
        <span className="font-medium text-sm">{data.label || 'Goal Decomposition'}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Break goals into sub-tasks'}
      </p>
      <Badge variant="secondary" className="text-[10px]">
        Max depth: {data.configuration?.max_depth || 5}
      </Badge>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-orange-500 !w-3 !h-3" />
    <Handle type="source" position={Position.Left} className="!bg-orange-500 !w-3 !h-3" id="left" />
    <Handle type="source" position={Position.Right} className="!bg-orange-500 !w-3 !h-3" id="right" />
  </MultiAgentNodeWrapper>
));

// Export node type mapping for registration
export const MULTI_AGENT_NODE_TYPES = {
  a2a_agent: A2AAgentNode,
  task_handoff: TaskHandoffNode,
  communication_hub: CommunicationHubNode,
  agent_team: AgentTeamNode,
  swarm_decision: SwarmDecisionNode,
  tool_sharing: ToolSharingNode,
  react_loop: ReActLoopNode,
  tool_chain: ToolChainNode,
  self_reflection: SelfReflectionNode,
  goal_decomposition: GoalDecompositionNode,
};

A2AAgentNode.displayName = 'A2AAgentNode';
TaskHandoffNode.displayName = 'TaskHandoffNode';
CommunicationHubNode.displayName = 'CommunicationHubNode';
AgentTeamNode.displayName = 'AgentTeamNode';
SwarmDecisionNode.displayName = 'SwarmDecisionNode';
ToolSharingNode.displayName = 'ToolSharingNode';
ReActLoopNode.displayName = 'ReActLoopNode';
ToolChainNode.displayName = 'ToolChainNode';
SelfReflectionNode.displayName = 'SelfReflectionNode';
GoalDecompositionNode.displayName = 'GoalDecompositionNode';
