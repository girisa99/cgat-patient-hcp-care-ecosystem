/**
 * MULTI-AGENT NODE COMPONENTS
 * React components for A2A, Multi-Agent Orchestration, and Agentic AI nodes
 * Enhanced with resize, delete, and right-click context menu support
 */

import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeResizer, NodeToolbar, useReactFlow } from '@xyflow/react';
import { 
  Network, ArrowRightLeft, Radio, Users, Brain, Share2, 
  RefreshCw, Link, Eye, GitBranch, Activity, Zap, Copy, Trash2, Settings, Play
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
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
  id: string;
  data: MultiAgentNodeData;
  selected?: boolean;
}

// Base wrapper for all multi-agent nodes with resize and context menu support
const MultiAgentNodeWrapper: React.FC<{
  id: string;
  children: React.ReactNode;
  color: string;
  selected?: boolean;
  status?: string;
}> = ({ id, children, color, selected, status }) => {
  const { setNodes, setEdges, getNodes } = useReactFlow();

  const handleDelete = useCallback(() => {
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
  }, [id, setNodes, setEdges]);

  const handleDuplicate = useCallback(() => {
    const node = getNodes().find(n => n.id === id);
    if (node) {
      const newId = `${id}-copy-${Date.now()}`;
      const newNode = {
        ...node,
        id: newId,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        selected: false,
      };
      setNodes(nds => [...nds, newNode]);
    }
  }, [id, getNodes, setNodes]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="relative">
          <NodeResizer
            minWidth={180}
            minHeight={80}
            maxWidth={400}
            maxHeight={400}
            isVisible={selected}
            lineClassName="border-primary/50"
            handleClassName="w-2 h-2 bg-background border border-primary rounded-sm"
          />
          
          {selected && (
            <NodeToolbar isVisible position={Position.Top} className="animate-fade-in">
              <div className="flex gap-1 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border border-border/50 p-1">
                <Button size="sm" variant="ghost" className="h-7 px-2 hover:bg-primary/10" onClick={handleDuplicate}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2 hover:bg-primary/10" onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-node-config', { detail: { nodeId: id } }));
                }}>
                  <Settings className="h-3 w-3" />
                </Button>
                <div className="w-px h-5 bg-border my-auto" />
                <Button size="sm" variant="ghost" className="h-7 px-2 hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </NodeToolbar>
          )}
          
          <div 
            className={cn(
              "rounded-lg border-2 bg-card shadow-lg min-w-[180px] transition-all",
              selected && "ring-2 ring-primary ring-offset-2",
              status === 'running' && "animate-pulse"
            )}
            style={{ borderColor: color }}
          >
            {children}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent('open-node-config', { detail: { nodeId: id } }))}>
          <Settings className="mr-2 h-4 w-4" />
          Configure
        </ContextMenuItem>
        <ContextMenuItem onClick={() => window.dispatchEvent(new CustomEvent('test-node', { detail: { nodeId: id } }))}>
          <Play className="mr-2 h-4 w-4" />
          Test Node
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

// A2A Agent Node
export const A2AAgentNode = memo(({ id, data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper id={id} color="#6366F1" selected={selected} status={data.status}>
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
export const TaskHandoffNode = memo(({ id, data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper id={id} color="#8B5CF6" selected={selected} status={data.status}>
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
export const CommunicationHubNode = memo(({ id, data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper id={id} color="#EC4899" selected={selected} status={data.status}>
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
export const AgentTeamNode = memo(({ id, data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper id={id} color="#10B981" selected={selected} status={data.status}>
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
export const SwarmDecisionNode = memo(({ id, data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper id={id} color="#F59E0B" selected={selected} status={data.status}>
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
export const ToolSharingNode = memo(({ id, data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper id={id} color="#06B6D4" selected={selected} status={data.status}>
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
export const ReActLoopNode = memo(({ id, data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper id={id} color="#EF4444" selected={selected} status={data.status}>
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
export const ToolChainNode = memo(({ id, data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper id={id} color="#14B8A6" selected={selected} status={data.status}>
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
export const SelfReflectionNode = memo(({ id, data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper id={id} color="#A855F7" selected={selected} status={data.status}>
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
export const GoalDecompositionNode = memo(({ id, data, selected }: MultiAgentNodeProps) => (
  <MultiAgentNodeWrapper id={id} color="#F97316" selected={selected} status={data.status}>
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
