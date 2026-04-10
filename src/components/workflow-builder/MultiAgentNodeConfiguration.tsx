/**
 * MULTI-AGENT NODE CONFIGURATION
 * Specialized configuration forms for A2A, Multi-Agent, Agentic AI, and Swarm nodes
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Network, ArrowRightLeft, Radio, Users, Brain, Share2, 
  RefreshCw, Link, Eye, GitBranch, Plus, Trash2, Zap
} from 'lucide-react';

interface MultiAgentNodeConfigurationProps {
  nodeType: string;
  configuration: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

// A2A Agent Configuration
const A2AAgentConfiguration: React.FC<{
  configuration: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}> = ({ configuration, onChange }) => {
  const agentCard = configuration.agent_card || { name: '', description: '', capabilities: [] };
  const supportedTasks = configuration.supported_tasks || ['text_generation'];

  const updateAgentCard = (field: string, value: any) => {
    onChange({
      ...configuration,
      agent_card: { ...agentCard, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Network className="h-4 w-4 text-indigo-500" />
            Agent Card Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Agent Name</Label>
              <Input
                value={agentCard.name || ''}
                onChange={(e) => updateAgentCard('name', e.target.value)}
                placeholder="My A2A Agent"
              />
            </div>
            <div>
              <Label>Agent Version</Label>
              <Input
                value={configuration.version || '1.0.0'}
                onChange={(e) => onChange({ ...configuration, version: e.target.value })}
                placeholder="1.0.0"
              />
            </div>
          </div>

          <div>
            <Label>Agent Description</Label>
            <Textarea
              value={agentCard.description || ''}
              onChange={(e) => updateAgentCard('description', e.target.value)}
              placeholder="Describe what this agent does..."
              rows={3}
            />
          </div>

          <div>
            <Label>Agent Capabilities</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['text_generation', 'data_retrieval', 'action_execution', 'multimodal', 'streaming'].map((cap) => (
                <Badge
                  key={cap}
                  variant={(agentCard.capabilities || []).includes(cap) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const caps = agentCard.capabilities || [];
                    const newCaps = caps.includes(cap) 
                      ? caps.filter((c: string) => c !== cap)
                      : [...caps, cap];
                    updateAgentCard('capabilities', newCaps);
                  }}
                >
                  {cap.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">A2A Protocol Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>SSE Streaming</Label>
              <p className="text-xs text-muted-foreground">Enable Server-Sent Events for real-time updates</p>
            </div>
            <Switch
              checked={configuration.streaming_enabled ?? true}
              onCheckedChange={(checked) => onChange({ ...configuration, streaming_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-xs text-muted-foreground">Enable push notifications for task updates</p>
            </div>
            <Switch
              checked={configuration.push_notifications_enabled ?? false}
              onCheckedChange={(checked) => onChange({ ...configuration, push_notifications_enabled: checked })}
            />
          </div>

          <div>
            <Label>Task Timeout (ms)</Label>
            <Input
              type="number"
              value={configuration.task_timeout_ms || 30000}
              onChange={(e) => onChange({ ...configuration, task_timeout_ms: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <Label>Supported Tasks</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['text_generation', 'data_retrieval', 'action_execution', 'code_generation', 'analysis'].map((task) => (
                <Badge
                  key={task}
                  variant={supportedTasks.includes(task) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const newTasks = supportedTasks.includes(task)
                      ? supportedTasks.filter((t: string) => t !== task)
                      : [...supportedTasks, task];
                    onChange({ ...configuration, supported_tasks: newTasks });
                  }}
                >
                  {task.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Task Handoff Configuration
const TaskHandoffConfiguration: React.FC<{
  configuration: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}> = ({ configuration, onChange }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm flex items-center gap-2">
        <ArrowRightLeft className="h-4 w-4 text-violet-500" />
        Task Handoff Configuration
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label>Handoff Type</Label>
        <Select
          value={configuration.handoff_type || 'full_context'}
          onValueChange={(value) => onChange({ ...configuration, handoff_type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full_context">Full Context Transfer</SelectItem>
            <SelectItem value="partial_context">Partial Context</SelectItem>
            <SelectItem value="summary_only">Summary Only</SelectItem>
            <SelectItem value="task_specific">Task-Specific Data</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Preserve History</Label>
          <p className="text-xs text-muted-foreground">Keep conversation history during handoff</p>
        </div>
        <Switch
          checked={configuration.preserve_history ?? true}
          onCheckedChange={(checked) => onChange({ ...configuration, preserve_history: checked })}
        />
      </div>

      <div>
        <Label>Timeout (ms)</Label>
        <Input
          type="number"
          value={configuration.timeout_ms || 30000}
          onChange={(e) => onChange({ ...configuration, timeout_ms: parseInt(e.target.value) })}
        />
      </div>

      <div>
        <Label>Priority Routing</Label>
        <Select
          value={configuration.priority_routing || 'balanced'}
          onValueChange={(value) => onChange({ ...configuration, priority_routing: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="balanced">Balanced</SelectItem>
            <SelectItem value="speed_first">Speed First</SelectItem>
            <SelectItem value="capability_first">Capability First</SelectItem>
            <SelectItem value="cost_first">Cost First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Fallback Agent ID</Label>
        <Input
          value={configuration.fallback_agent_id || ''}
          onChange={(e) => onChange({ ...configuration, fallback_agent_id: e.target.value })}
          placeholder="Optional fallback agent"
        />
      </div>
    </CardContent>
  </Card>
);

// Communication Hub Configuration
const CommunicationHubConfiguration: React.FC<{
  configuration: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}> = ({ configuration, onChange }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm flex items-center gap-2">
        <Radio className="h-4 w-4 text-pink-500" />
        Communication Hub Configuration
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label>Routing Strategy</Label>
        <Select
          value={configuration.routing_strategy || 'round_robin'}
          onValueChange={(value) => onChange({ ...configuration, routing_strategy: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="round_robin">Round Robin</SelectItem>
            <SelectItem value="weighted">Weighted Distribution</SelectItem>
            <SelectItem value="capability_based">Capability-Based</SelectItem>
            <SelectItem value="load_balanced">Load Balanced</SelectItem>
            <SelectItem value="broadcast">Broadcast to All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Message Persistence</Label>
          <p className="text-xs text-muted-foreground">Store messages for replay</p>
        </div>
        <Switch
          checked={configuration.message_persistence ?? true}
          onCheckedChange={(checked) => onChange({ ...configuration, message_persistence: checked })}
        />
      </div>

      <div>
        <Label>Message TTL (seconds)</Label>
        <Input
          type="number"
          value={configuration.message_ttl || 3600}
          onChange={(e) => onChange({ ...configuration, message_ttl: parseInt(e.target.value) })}
        />
      </div>

      <div>
        <Label>Max Queue Size</Label>
        <Input
          type="number"
          value={configuration.max_queue_size || 1000}
          onChange={(e) => onChange({ ...configuration, max_queue_size: parseInt(e.target.value) })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Enable Dead Letter Queue</Label>
          <p className="text-xs text-muted-foreground">Store failed messages for retry</p>
        </div>
        <Switch
          checked={configuration.dead_letter_queue ?? false}
          onCheckedChange={(checked) => onChange({ ...configuration, dead_letter_queue: checked })}
        />
      </div>
    </CardContent>
  </Card>
);

// Agent Team Configuration
const AgentTeamConfiguration: React.FC<{
  configuration: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}> = ({ configuration, onChange }) => {
  const teamMembers = configuration.team_members || [];

  const addTeamMember = () => {
    onChange({
      ...configuration,
      team_members: [...teamMembers, { agent_id: '', role: 'worker', specialization: '' }]
    });
  };

  const updateTeamMember = (index: number, field: string, value: any) => {
    const newMembers = [...teamMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    onChange({ ...configuration, team_members: newMembers });
  };

  const removeTeamMember = (index: number) => {
    onChange({
      ...configuration,
      team_members: teamMembers.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-500" />
            Team Orchestration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Orchestration Pattern</Label>
            <Select
              value={configuration.orchestration_pattern || 'hierarchical'}
              onValueChange={(value) => onChange({ ...configuration, orchestration_pattern: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hierarchical">Hierarchical (Manager → Workers)</SelectItem>
                <SelectItem value="peer_to_peer">Peer-to-Peer</SelectItem>
                <SelectItem value="pipeline">Pipeline (Sequential)</SelectItem>
                <SelectItem value="parallel">Parallel Execution</SelectItem>
                <SelectItem value="dynamic">Dynamic Assignment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Team Size</Label>
              <Input
                type="number"
                value={configuration.team_size || 3}
                onChange={(e) => onChange({ ...configuration, team_size: parseInt(e.target.value) })}
                min={2}
                max={20}
              />
            </div>
            <div>
              <Label>Max Concurrent Tasks</Label>
              <Input
                type="number"
                value={configuration.max_concurrent_tasks || 5}
                onChange={(e) => onChange({ ...configuration, max_concurrent_tasks: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Shared Memory</Label>
              <p className="text-xs text-muted-foreground">Enable shared context between agents</p>
            </div>
            <Switch
              checked={configuration.shared_memory ?? true}
              onCheckedChange={(checked) => onChange({ ...configuration, shared_memory: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-scaling</Label>
              <p className="text-xs text-muted-foreground">Dynamically adjust team size</p>
            </div>
            <Switch
              checked={configuration.auto_scaling ?? false}
              onCheckedChange={(checked) => onChange({ ...configuration, auto_scaling: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Team Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamMembers.map((member: any, index: number) => (
            <div key={index} className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Member {index + 1}</Badge>
                <Button variant="ghost" size="sm" onClick={() => removeTeamMember(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Agent ID</Label>
                  <Input
                    value={member.agent_id || ''}
                    onChange={(e) => updateTeamMember(index, 'agent_id', e.target.value)}
                    placeholder="Agent ID"
                  />
                </div>
                <div>
                  <Label className="text-xs">Role</Label>
                  <Select
                    value={member.role || 'worker'}
                    onValueChange={(value) => updateTeamMember(index, 'role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="worker">Worker</SelectItem>
                      <SelectItem value="specialist">Specialist</SelectItem>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Specialization</Label>
                  <Input
                    value={member.specialization || ''}
                    onChange={(e) => updateTeamMember(index, 'specialization', e.target.value)}
                    placeholder="e.g., Research"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addTeamMember} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Swarm Decision Configuration
const SwarmDecisionConfiguration: React.FC<{
  configuration: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}> = ({ configuration, onChange }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm flex items-center gap-2">
        <Brain className="h-4 w-4 text-amber-500" />
        Swarm Decision Configuration
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label>Decision Method</Label>
        <Select
          value={configuration.decision_method || 'weighted_voting'}
          onValueChange={(value) => onChange({ ...configuration, decision_method: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="majority_voting">Majority Voting</SelectItem>
            <SelectItem value="weighted_voting">Weighted Voting</SelectItem>
            <SelectItem value="consensus">Consensus</SelectItem>
            <SelectItem value="ranked_choice">Ranked Choice</SelectItem>
            <SelectItem value="borda_count">Borda Count</SelectItem>
            <SelectItem value="average_aggregation">Average Aggregation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Confidence Threshold</Label>
          <span className="text-sm text-muted-foreground">
            {((configuration.confidence_threshold || 0.7) * 100).toFixed(0)}%
          </span>
        </div>
        <Slider
          value={[(configuration.confidence_threshold || 0.7) * 100]}
          onValueChange={(value) => onChange({ ...configuration, confidence_threshold: value[0] / 100 })}
          max={100}
          min={50}
          step={5}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Min Participants</Label>
          <Input
            type="number"
            value={configuration.min_participants || 3}
            onChange={(e) => onChange({ ...configuration, min_participants: parseInt(e.target.value) })}
            min={2}
          />
        </div>
        <div>
          <Label>Max Voting Rounds</Label>
          <Input
            type="number"
            value={configuration.max_voting_rounds || 3}
            onChange={(e) => onChange({ ...configuration, max_voting_rounds: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <Label>Timeout per Round (ms)</Label>
        <Input
          type="number"
          value={configuration.round_timeout_ms || 10000}
          onChange={(e) => onChange({ ...configuration, round_timeout_ms: parseInt(e.target.value) })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Allow Abstention</Label>
          <p className="text-xs text-muted-foreground">Agents can abstain from voting</p>
        </div>
        <Switch
          checked={configuration.allow_abstention ?? true}
          onCheckedChange={(checked) => onChange({ ...configuration, allow_abstention: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Require Explanation</Label>
          <p className="text-xs text-muted-foreground">Each agent must explain their vote</p>
        </div>
        <Switch
          checked={configuration.require_explanation ?? false}
          onCheckedChange={(checked) => onChange({ ...configuration, require_explanation: checked })}
        />
      </div>
    </CardContent>
  </Card>
);

// Tool Sharing Configuration
const ToolSharingConfiguration: React.FC<{
  configuration: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}> = ({ configuration, onChange }) => {
  const sharedTools = configuration.shared_tools || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Share2 className="h-4 w-4 text-cyan-500" />
          Tool Sharing Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Sharing Scope</Label>
          <Select
            value={configuration.sharing_scope || 'team'}
            onValueChange={(value) => onChange({ ...configuration, sharing_scope: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="team">Team Only</SelectItem>
              <SelectItem value="workflow">Workflow-Wide</SelectItem>
              <SelectItem value="global">Global</SelectItem>
              <SelectItem value="selective">Selective Agents</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Permission Level</Label>
          <Select
            value={configuration.permission_level || 'read_execute'}
            onValueChange={(value) => onChange({ ...configuration, permission_level: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="read_only">Read Only</SelectItem>
              <SelectItem value="read_execute">Read & Execute</SelectItem>
              <SelectItem value="full_access">Full Access (including modify)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Auto-Discovery</Label>
            <p className="text-xs text-muted-foreground">Automatically discover available tools</p>
          </div>
          <Switch
            checked={configuration.auto_discovery ?? true}
            onCheckedChange={(checked) => onChange({ ...configuration, auto_discovery: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Rate Limiting</Label>
            <p className="text-xs text-muted-foreground">Apply rate limits to shared tools</p>
          </div>
          <Switch
            checked={configuration.rate_limiting ?? false}
            onCheckedChange={(checked) => onChange({ ...configuration, rate_limiting: checked })}
          />
        </div>

        <Separator />

        <div>
          <Label className="mb-2 block">Shared Tool Registry</Label>
          <div className="flex flex-wrap gap-2">
            {['web_search', 'calculator', 'code_execution', 'database_query', 'file_operations', 'api_calls'].map((tool) => (
              <Badge
                key={tool}
                variant={sharedTools.includes(tool) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  const newTools = sharedTools.includes(tool)
                    ? sharedTools.filter((t: string) => t !== tool)
                    : [...sharedTools, tool];
                  onChange({ ...configuration, shared_tools: newTools });
                }}
              >
                {tool.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ReAct Loop Configuration
const ReActLoopConfiguration: React.FC<{
  configuration: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}> = ({ configuration, onChange }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm flex items-center gap-2">
        <RefreshCw className="h-4 w-4 text-red-500" />
        ReAct Loop Configuration
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Max Iterations</Label>
          <Input
            type="number"
            value={configuration.max_iterations || 10}
            onChange={(e) => onChange({ ...configuration, max_iterations: parseInt(e.target.value) })}
            min={1}
            max={50}
          />
        </div>
        <div>
          <Label>Planning Depth</Label>
          <Input
            type="number"
            value={configuration.planning_depth || 3}
            onChange={(e) => onChange({ ...configuration, planning_depth: parseInt(e.target.value) })}
            min={1}
            max={10}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Reflection Enabled</Label>
          <p className="text-xs text-muted-foreground">Enable self-reflection after each action</p>
        </div>
        <Switch
          checked={configuration.reflection_enabled ?? true}
          onCheckedChange={(checked) => onChange({ ...configuration, reflection_enabled: checked })}
        />
      </div>

      <div>
        <Label>Observation Strategy</Label>
        <Select
          value={configuration.observation_strategy || 'full'}
          onValueChange={(value) => onChange({ ...configuration, observation_strategy: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full Observation</SelectItem>
            <SelectItem value="summarized">Summarized</SelectItem>
            <SelectItem value="key_points">Key Points Only</SelectItem>
            <SelectItem value="diff_based">Diff-Based</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Thought Generation Model</Label>
        <Select
          value={configuration.thought_model || 'gpt-4o'}
          onValueChange={(value) => onChange({ ...configuration, thought_model: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
            <SelectItem value="claude-sonnet-4-6">Claude Sonnet 4.6</SelectItem>
            <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Stop Conditions</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {['goal_achieved', 'max_iterations', 'confidence_threshold', 'no_progress', 'user_interrupt'].map((condition) => {
            const stopConditions = configuration.stop_conditions || ['goal_achieved', 'max_iterations'];
            return (
              <Badge
                key={condition}
                variant={stopConditions.includes(condition) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  const newConditions = stopConditions.includes(condition)
                    ? stopConditions.filter((c: string) => c !== condition)
                    : [...stopConditions, condition];
                  onChange({ ...configuration, stop_conditions: newConditions });
                }}
              >
                {condition.replace('_', ' ')}
              </Badge>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Creativity (Temperature)</Label>
          <span className="text-sm text-muted-foreground">
            {(configuration.temperature || 0.7).toFixed(1)}
          </span>
        </div>
        <Slider
          value={[(configuration.temperature || 0.7) * 10]}
          onValueChange={(value) => onChange({ ...configuration, temperature: value[0] / 10 })}
          max={20}
          min={0}
          step={1}
        />
      </div>
    </CardContent>
  </Card>
);

// Tool Chain Configuration
const ToolChainConfiguration: React.FC<{
  configuration: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}> = ({ configuration, onChange }) => {
  const chainSteps = configuration.chain_steps || [];

  const addStep = () => {
    onChange({
      ...configuration,
      chain_steps: [...chainSteps, { tool_name: '', input_mapping: '', output_key: '' }]
    });
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...chainSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    onChange({ ...configuration, chain_steps: newSteps });
  };

  const removeStep = (index: number) => {
    onChange({
      ...configuration,
      chain_steps: chainSteps.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Link className="h-4 w-4 text-teal-500" />
          Tool Chain Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Chain Type</Label>
            <Select
              value={configuration.chain_type || 'sequential'}
              onValueChange={(value) => onChange({ ...configuration, chain_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sequential">Sequential</SelectItem>
                <SelectItem value="parallel">Parallel</SelectItem>
                <SelectItem value="conditional">Conditional</SelectItem>
                <SelectItem value="loop">Loop</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Error Handling</Label>
            <Select
              value={configuration.error_handling || 'retry_with_backoff'}
              onValueChange={(value) => onChange({ ...configuration, error_handling: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retry_with_backoff">Retry with Backoff</SelectItem>
                <SelectItem value="fail_fast">Fail Fast</SelectItem>
                <SelectItem value="skip_and_continue">Skip & Continue</SelectItem>
                <SelectItem value="fallback">Use Fallback</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Max Retries</Label>
            <Input
              type="number"
              value={configuration.max_retries || 3}
              onChange={(e) => onChange({ ...configuration, max_retries: parseInt(e.target.value) })}
              min={0}
              max={10}
            />
          </div>
          <div>
            <Label>Step Timeout (ms)</Label>
            <Input
              type="number"
              value={configuration.step_timeout_ms || 30000}
              onChange={(e) => onChange({ ...configuration, step_timeout_ms: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Chain Steps</Label>
            <Button variant="outline" size="sm" onClick={addStep}>
              <Plus className="h-4 w-4 mr-1" />
              Add Step
            </Button>
          </div>

          {chainSteps.map((step: any, index: number) => (
            <div key={index} className="border rounded-lg p-3 mb-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-teal-500/10">Step {index + 1}</Badge>
                  <Zap className="h-3 w-3 text-teal-500" />
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeStep(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Tool Name</Label>
                  <Input
                    value={step.tool_name || ''}
                    onChange={(e) => updateStep(index, 'tool_name', e.target.value)}
                    placeholder="e.g., web_search"
                  />
                </div>
                <div>
                  <Label className="text-xs">Input Mapping</Label>
                  <Input
                    value={step.input_mapping || ''}
                    onChange={(e) => updateStep(index, 'input_mapping', e.target.value)}
                    placeholder="$.previous.output"
                  />
                </div>
                <div>
                  <Label className="text-xs">Output Key</Label>
                  <Input
                    value={step.output_key || ''}
                    onChange={(e) => updateStep(index, 'output_key', e.target.value)}
                    placeholder="step_result"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Self Reflection Configuration
const SelfReflectionConfiguration: React.FC<{
  configuration: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}> = ({ configuration, onChange }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm flex items-center gap-2">
        <Eye className="h-4 w-4 text-purple-500" />
        Self Reflection Configuration
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label>Reflection Frequency</Label>
        <Select
          value={configuration.reflection_frequency || 'after_each_action'}
          onValueChange={(value) => onChange({ ...configuration, reflection_frequency: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="after_each_action">After Each Action</SelectItem>
            <SelectItem value="after_n_actions">After N Actions</SelectItem>
            <SelectItem value="on_error">On Error Only</SelectItem>
            <SelectItem value="periodic">Periodic (Time-Based)</SelectItem>
            <SelectItem value="on_demand">On Demand</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {configuration.reflection_frequency === 'after_n_actions' && (
        <div>
          <Label>Actions Between Reflections</Label>
          <Input
            type="number"
            value={configuration.actions_between_reflections || 3}
            onChange={(e) => onChange({ ...configuration, actions_between_reflections: parseInt(e.target.value) })}
            min={1}
          />
        </div>
      )}

      <div>
        <Label>Reflection Aspects</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {['progress', 'accuracy', 'efficiency', 'strategy', 'goal_alignment'].map((aspect) => {
            const aspects = configuration.reflection_aspects || ['progress', 'accuracy'];
            return (
              <Badge
                key={aspect}
                variant={aspects.includes(aspect) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  const newAspects = aspects.includes(aspect)
                    ? aspects.filter((a: string) => a !== aspect)
                    : [...aspects, aspect];
                  onChange({ ...configuration, reflection_aspects: newAspects });
                }}
              >
                {aspect.replace('_', ' ')}
              </Badge>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Learning Rate</Label>
          <span className="text-sm text-muted-foreground">
            {(configuration.learning_rate || 0.1).toFixed(2)}
          </span>
        </div>
        <Slider
          value={[(configuration.learning_rate || 0.1) * 100]}
          onValueChange={(value) => onChange({ ...configuration, learning_rate: value[0] / 100 })}
          max={100}
          min={1}
          step={1}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Store Insights</Label>
          <p className="text-xs text-muted-foreground">Persist reflection insights for future use</p>
        </div>
        <Switch
          checked={configuration.store_insights ?? true}
          onCheckedChange={(checked) => onChange({ ...configuration, store_insights: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Allow Strategy Change</Label>
          <p className="text-xs text-muted-foreground">Permit strategy adjustments based on reflection</p>
        </div>
        <Switch
          checked={configuration.allow_strategy_change ?? true}
          onCheckedChange={(checked) => onChange({ ...configuration, allow_strategy_change: checked })}
        />
      </div>
    </CardContent>
  </Card>
);

// Goal Decomposition Configuration
const GoalDecompositionConfiguration: React.FC<{
  configuration: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}> = ({ configuration, onChange }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-orange-500" />
        Goal Decomposition Configuration
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label>Decomposition Strategy</Label>
        <Select
          value={configuration.decomposition_strategy || 'recursive'}
          onValueChange={(value) => onChange({ ...configuration, decomposition_strategy: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recursive">Recursive (Divide & Conquer)</SelectItem>
            <SelectItem value="flat">Flat (Single Level)</SelectItem>
            <SelectItem value="hierarchical">Hierarchical (Tree Structure)</SelectItem>
            <SelectItem value="adaptive">Adaptive (Context-Based)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Max Depth</Label>
          <Input
            type="number"
            value={configuration.max_depth || 5}
            onChange={(e) => onChange({ ...configuration, max_depth: parseInt(e.target.value) })}
            min={1}
            max={10}
          />
        </div>
        <div>
          <Label>Max Subtasks per Level</Label>
          <Input
            type="number"
            value={configuration.max_subtasks || 7}
            onChange={(e) => onChange({ ...configuration, max_subtasks: parseInt(e.target.value) })}
            min={2}
            max={15}
          />
        </div>
      </div>

      <div>
        <Label>Priority Assignment</Label>
        <Select
          value={configuration.priority_assignment || 'importance_based'}
          onValueChange={(value) => onChange({ ...configuration, priority_assignment: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="importance_based">Importance-Based</SelectItem>
            <SelectItem value="dependency_based">Dependency-Based</SelectItem>
            <SelectItem value="effort_based">Effort-Based</SelectItem>
            <SelectItem value="deadline_based">Deadline-Based</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Auto-Parallelize</Label>
          <p className="text-xs text-muted-foreground">Automatically identify parallelizable tasks</p>
        </div>
        <Switch
          checked={configuration.auto_parallelize ?? true}
          onCheckedChange={(checked) => onChange({ ...configuration, auto_parallelize: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Dependency Analysis</Label>
          <p className="text-xs text-muted-foreground">Analyze and enforce task dependencies</p>
        </div>
        <Switch
          checked={configuration.dependency_analysis ?? true}
          onCheckedChange={(checked) => onChange({ ...configuration, dependency_analysis: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Effort Estimation</Label>
          <p className="text-xs text-muted-foreground">Estimate effort for each subtask</p>
        </div>
        <Switch
          checked={configuration.effort_estimation ?? false}
          onCheckedChange={(checked) => onChange({ ...configuration, effort_estimation: checked })}
        />
      </div>

      <div>
        <Label>Minimum Task Granularity</Label>
        <Select
          value={configuration.min_granularity || 'medium'}
          onValueChange={(value) => onChange({ ...configuration, min_granularity: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="coarse">Coarse (High-level tasks)</SelectItem>
            <SelectItem value="medium">Medium (Moderate detail)</SelectItem>
            <SelectItem value="fine">Fine (Detailed steps)</SelectItem>
            <SelectItem value="atomic">Atomic (Smallest actions)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>
);

// Main Multi-Agent Node Configuration Component
export const MultiAgentNodeConfiguration: React.FC<MultiAgentNodeConfigurationProps> = ({
  nodeType,
  configuration,
  onChange,
}) => {
  const multiAgentTypes = [
    'a2a_agent', 'task_handoff', 'communication_hub', 'agent_team',
    'swarm_decision', 'tool_sharing', 'react_loop', 'tool_chain',
    'self_reflection', 'goal_decomposition'
  ];

  if (!multiAgentTypes.includes(nodeType)) {
    return null;
  }

  switch (nodeType) {
    case 'a2a_agent':
      return <A2AAgentConfiguration configuration={configuration} onChange={onChange} />;
    case 'task_handoff':
      return <TaskHandoffConfiguration configuration={configuration} onChange={onChange} />;
    case 'communication_hub':
      return <CommunicationHubConfiguration configuration={configuration} onChange={onChange} />;
    case 'agent_team':
      return <AgentTeamConfiguration configuration={configuration} onChange={onChange} />;
    case 'swarm_decision':
      return <SwarmDecisionConfiguration configuration={configuration} onChange={onChange} />;
    case 'tool_sharing':
      return <ToolSharingConfiguration configuration={configuration} onChange={onChange} />;
    case 'react_loop':
      return <ReActLoopConfiguration configuration={configuration} onChange={onChange} />;
    case 'tool_chain':
      return <ToolChainConfiguration configuration={configuration} onChange={onChange} />;
    case 'self_reflection':
      return <SelfReflectionConfiguration configuration={configuration} onChange={onChange} />;
    case 'goal_decomposition':
      return <GoalDecompositionConfiguration configuration={configuration} onChange={onChange} />;
    default:
      return null;
  }
};

export default MultiAgentNodeConfiguration;
