/**
 * ENHANCED AGENTIC AI NODES
 * Advanced ReAct, Planning, Memory, and Reasoning capabilities
 * for sophisticated AI agent workflows
 */

import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeResizer, NodeToolbar, useReactFlow } from '@xyflow/react';
import { 
  Brain, Lightbulb, Target, History, MessageSquare, Workflow,
  Copy, Trash2, Settings, Play, Sparkles, Layers, GitMerge,
  Compass, BookOpen, Puzzle, Cpu, Zap, CheckCircle, Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';

interface AgenticNodeData {
  label?: string;
  intent?: string;
  description?: string;
  type_key?: string;
  configuration?: Record<string, any>;
  status?: 'idle' | 'thinking' | 'acting' | 'reflecting' | 'completed' | 'error';
  currentStep?: string;
  progress?: number;
  metrics?: {
    iterations?: number;
    totalSteps?: number;
    successRate?: number;
  };
}

interface AgenticNodeProps {
  id: string;
  data: AgenticNodeData;
  selected?: boolean;
}

// Base wrapper for agentic nodes
const AgenticNodeWrapper: React.FC<{
  id: string;
  children: React.ReactNode;
  color: string;
  selected?: boolean;
  status?: string;
  progress?: number;
}> = ({ id, children, color, selected, status, progress }) => {
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

  const getStatusColor = () => {
    switch (status) {
      case 'thinking': return 'border-blue-500';
      case 'acting': return 'border-green-500';
      case 'reflecting': return 'border-purple-500';
      case 'completed': return 'border-emerald-500';
      case 'error': return 'border-red-500';
      default: return '';
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="relative">
          <NodeResizer
            minWidth={200}
            minHeight={100}
            maxWidth={450}
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
                <Button size="sm" variant="ghost" className="h-7 px-2 hover:bg-primary/10" onClick={() => {
                  window.dispatchEvent(new CustomEvent('test-node', { detail: { nodeId: id } }));
                }}>
                  <Play className="h-3 w-3" />
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
              "rounded-lg border-2 bg-card shadow-lg min-w-[200px] transition-all",
              selected && "ring-2 ring-primary ring-offset-2",
              getStatusColor()
            )}
            style={{ borderColor: status ? undefined : color }}
          >
            {children}
            {status && status !== 'idle' && status !== 'completed' && progress !== undefined && (
              <div className="px-3 pb-2">
                <Progress value={progress} className="h-1" />
              </div>
            )}
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

// Status badge component
const StatusBadge: React.FC<{ status?: string; currentStep?: string }> = ({ status, currentStep }) => {
  if (!status || status === 'idle') return null;
  
  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    thinking: { color: 'bg-blue-500', icon: <Brain className="h-3 w-3" /> },
    acting: { color: 'bg-green-500', icon: <Zap className="h-3 w-3" /> },
    reflecting: { color: 'bg-purple-500', icon: <Sparkles className="h-3 w-3" /> },
    completed: { color: 'bg-emerald-500', icon: <CheckCircle className="h-3 w-3" /> },
    error: { color: 'bg-red-500', icon: <Clock className="h-3 w-3" /> },
  };

  const config = statusConfig[status] || statusConfig.thinking;

  return (
    <div className="absolute top-2 right-2 flex items-center gap-1">
      <Badge variant="secondary" className={cn("text-[10px] text-white", config.color)}>
        {config.icon}
        <span className="ml-1">{currentStep || status}</span>
      </Badge>
    </div>
  );
};

// Plan & Execute Node
export const PlanExecuteNode = memo(({ id, data, selected }: AgenticNodeProps) => (
  <AgenticNodeWrapper id={id} color="#6366F1" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-indigo-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusBadge status={data.status} currentStep={data.currentStep} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-indigo-500/20">
          <Compass className="h-4 w-4 text-indigo-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Plan & Execute'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-indigo-500 text-indigo-500">Planner</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Create and execute multi-step plans dynamically'}
      </p>
      <div className="grid grid-cols-3 gap-1 text-[9px] text-center">
        <div className={cn("rounded px-1 py-0.5", data.currentStep === 'plan' ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10')}>Plan</div>
        <div className={cn("rounded px-1 py-0.5", data.currentStep === 'execute' ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10')}>Execute</div>
        <div className={cn("rounded px-1 py-0.5", data.currentStep === 'verify' ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10')}>Verify</div>
      </div>
      {data.metrics && (
        <div className="mt-2 text-[10px] text-muted-foreground">
          Steps: {data.metrics.iterations || 0}/{data.metrics.totalSteps || '?'}
        </div>
      )}
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-3 !h-3" />
  </AgenticNodeWrapper>
));

// Reasoning Chain Node (Chain of Thought)
export const ReasoningChainNode = memo(({ id, data, selected }: AgenticNodeProps) => (
  <AgenticNodeWrapper id={id} color="#8B5CF6" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-violet-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusBadge status={data.status} currentStep={data.currentStep} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-violet-500/20">
          <Lightbulb className="h-4 w-4 text-violet-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Reasoning Chain'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-violet-500 text-violet-500">CoT</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Chain-of-thought reasoning for complex problems'}
      </p>
      <div className="flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-[10px]">
          Depth: {data.configuration?.reasoning_depth || 3}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.reasoning_style || 'step-by-step'}
        </Badge>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-violet-500 !w-3 !h-3" />
  </AgenticNodeWrapper>
));

// Memory & Context Node
export const MemoryContextNode = memo(({ id, data, selected }: AgenticNodeProps) => (
  <AgenticNodeWrapper id={id} color="#10B981" selected={selected} status={data.status}>
    <Handle type="target" position={Position.Top} className="!bg-emerald-500 !w-3 !h-3" />
    <Handle type="target" position={Position.Left} className="!bg-emerald-500 !w-3 !h-3" id="read" />
    <div className="p-3 relative">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-emerald-500/20">
          <History className="h-4 w-4 text-emerald-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Memory & Context'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-emerald-500 text-emerald-500">Memory</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Long-term memory storage and retrieval'}
      </p>
      <div className="flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.memory_type || 'episodic'}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          TTL: {data.configuration?.retention_hours || 24}h
        </Badge>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-3 !h-3" />
    <Handle type="source" position={Position.Right} className="!bg-emerald-500 !w-3 !h-3" id="write" />
  </AgenticNodeWrapper>
));

// Critique & Refinement Node
export const CritiqueRefinementNode = memo(({ id, data, selected }: AgenticNodeProps) => (
  <AgenticNodeWrapper id={id} color="#F59E0B" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusBadge status={data.status} currentStep={data.currentStep} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-amber-500/20">
          <MessageSquare className="h-4 w-4 text-amber-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Critique & Refine'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-amber-500 text-amber-500">Review</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Self-critique and iterative refinement'}
      </p>
      <div className="grid grid-cols-2 gap-1 text-[9px] text-center">
        <div className="bg-amber-500/10 rounded px-1 py-0.5">Critique</div>
        <div className="bg-amber-500/10 rounded px-1 py-0.5">Refine</div>
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground">
        Max iterations: {data.configuration?.max_refinements || 3}
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !w-3 !h-3" />
    <Handle type="source" position={Position.Right} className="!bg-amber-500 !w-3 !h-3" id="refined" />
  </AgenticNodeWrapper>
));

// Multi-Perspective Node
export const MultiPerspectiveNode = memo(({ id, data, selected }: AgenticNodeProps) => (
  <AgenticNodeWrapper id={id} color="#EC4899" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-pink-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusBadge status={data.status} currentStep={data.currentStep} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-pink-500/20">
          <Layers className="h-4 w-4 text-pink-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Multi-Perspective'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-pink-500 text-pink-500">Debate</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Analyze from multiple perspectives and synthesize'}
      </p>
      <div className="flex flex-wrap gap-1">
        {(data.configuration?.perspectives || ['Expert', 'Critic', 'User']).map((p: string, i: number) => (
          <Badge key={i} variant="secondary" className="text-[10px]">{p}</Badge>
        ))}
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-pink-500 !w-3 !h-3" />
  </AgenticNodeWrapper>
));

// Knowledge Integration Node
export const KnowledgeIntegrationNode = memo(({ id, data, selected }: AgenticNodeProps) => (
  <AgenticNodeWrapper id={id} color="#06B6D4" selected={selected} status={data.status}>
    <Handle type="target" position={Position.Top} className="!bg-cyan-500 !w-3 !h-3" />
    <Handle type="target" position={Position.Left} className="!bg-cyan-500 !w-3 !h-3" id="kb" />
    <div className="p-3 relative">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-cyan-500/20">
          <BookOpen className="h-4 w-4 text-cyan-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Knowledge Integration'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-cyan-500 text-cyan-500">KB</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Integrate knowledge from multiple sources'}
      </p>
      <div className="flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-[10px]">
          Sources: {data.configuration?.kb_sources?.length || 0}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.integration_strategy || 'semantic'}
        </Badge>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-cyan-500 !w-3 !h-3" />
  </AgenticNodeWrapper>
));

// Hypothesis Testing Node
export const HypothesisTestingNode = memo(({ id, data, selected }: AgenticNodeProps) => (
  <AgenticNodeWrapper id={id} color="#EF4444" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-red-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <StatusBadge status={data.status} currentStep={data.currentStep} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-red-500/20">
          <Target className="h-4 w-4 text-red-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Hypothesis Testing'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-red-500 text-red-500">Test</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Generate and test hypotheses systematically'}
      </p>
      <div className="grid grid-cols-3 gap-1 text-[9px] text-center">
        <div className="bg-red-500/10 rounded px-1 py-0.5">Hypothesize</div>
        <div className="bg-red-500/10 rounded px-1 py-0.5">Test</div>
        <div className="bg-red-500/10 rounded px-1 py-0.5">Validate</div>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-red-500 !w-3 !h-3" />
    <Handle type="source" position={Position.Right} className="!bg-green-500 !w-3 !h-3" id="validated" />
    <Handle type="source" position={Position.Left} className="!bg-red-500 !w-3 !h-3" id="rejected" />
  </AgenticNodeWrapper>
));

// Skill Composition Node
export const SkillCompositionNode = memo(({ id, data, selected }: AgenticNodeProps) => (
  <AgenticNodeWrapper id={id} color="#14B8A6" selected={selected} status={data.status}>
    <Handle type="target" position={Position.Top} className="!bg-teal-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-teal-500/20">
          <Puzzle className="h-4 w-4 text-teal-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Skill Composition'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-teal-500 text-teal-500">Skills</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Combine and orchestrate multiple agent skills'}
      </p>
      <div className="flex flex-wrap gap-1">
        {(data.configuration?.skills || ['search', 'analyze', 'summarize']).slice(0, 4).map((skill: string, i: number) => (
          <Badge key={i} variant="secondary" className="text-[10px]">{skill}</Badge>
        ))}
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-teal-500 !w-3 !h-3" />
  </AgenticNodeWrapper>
));

// Adaptive Learning Node
export const AdaptiveLearningNode = memo(({ id, data, selected }: AgenticNodeProps) => (
  <AgenticNodeWrapper id={id} color="#A855F7" selected={selected} status={data.status}>
    <Handle type="target" position={Position.Top} className="!bg-purple-500 !w-3 !h-3" />
    <div className="p-3 relative">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-purple-500/20">
          <Sparkles className="h-4 w-4 text-purple-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Adaptive Learning'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-purple-500 text-purple-500">Learn</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Learn and adapt from interactions and feedback'}
      </p>
      <div className="flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.learning_rate || 'adaptive'}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          Feedback: {data.configuration?.feedback_enabled ? 'On' : 'Off'}
        </Badge>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !w-3 !h-3" />
  </AgenticNodeWrapper>
));

// Workflow Orchestrator Node
export const WorkflowOrchestratorNode = memo(({ id, data, selected }: AgenticNodeProps) => (
  <AgenticNodeWrapper id={id} color="#F97316" selected={selected} status={data.status} progress={data.progress}>
    <Handle type="target" position={Position.Top} className="!bg-orange-500 !w-3 !h-3" />
    <Handle type="target" position={Position.Left} className="!bg-orange-500 !w-3 !h-3" id="agents" />
    <div className="p-3 relative">
      <StatusBadge status={data.status} currentStep={data.currentStep} />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-orange-500/20">
          <Workflow className="h-4 w-4 text-orange-500" />
        </div>
        <div>
          <span className="font-medium text-sm">{data.label || 'Workflow Orchestrator'}</span>
          <Badge variant="outline" className="ml-2 text-[10px] border-orange-500 text-orange-500">Orch</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {data.intent || 'Orchestrate complex multi-step agent workflows'}
      </p>
      <div className="flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-[10px]">
          {data.configuration?.orchestration_mode || 'sequential'}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          Agents: {data.configuration?.agent_count || 0}
        </Badge>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-orange-500 !w-3 !h-3" />
    <Handle type="source" position={Position.Right} className="!bg-orange-500 !w-3 !h-3" id="results" />
  </AgenticNodeWrapper>
));

// Export node type mapping
export const ENHANCED_AGENTIC_NODE_TYPES = {
  plan_execute: PlanExecuteNode,
  reasoning_chain: ReasoningChainNode,
  memory_context: MemoryContextNode,
  critique_refinement: CritiqueRefinementNode,
  multi_perspective: MultiPerspectiveNode,
  knowledge_integration: KnowledgeIntegrationNode,
  hypothesis_testing: HypothesisTestingNode,
  skill_composition: SkillCompositionNode,
  adaptive_learning: AdaptiveLearningNode,
  workflow_orchestrator: WorkflowOrchestratorNode,
};

// Add display names
PlanExecuteNode.displayName = 'PlanExecuteNode';
ReasoningChainNode.displayName = 'ReasoningChainNode';
MemoryContextNode.displayName = 'MemoryContextNode';
CritiqueRefinementNode.displayName = 'CritiqueRefinementNode';
MultiPerspectiveNode.displayName = 'MultiPerspectiveNode';
KnowledgeIntegrationNode.displayName = 'KnowledgeIntegrationNode';
HypothesisTestingNode.displayName = 'HypothesisTestingNode';
SkillCompositionNode.displayName = 'SkillCompositionNode';
AdaptiveLearningNode.displayName = 'AdaptiveLearningNode';
WorkflowOrchestratorNode.displayName = 'WorkflowOrchestratorNode';
