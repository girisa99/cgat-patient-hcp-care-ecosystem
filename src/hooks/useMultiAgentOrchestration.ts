/**
 * Multi-Agent Orchestration Hook
 * Manages hierarchical agent supervision, tool sharing, and swarm intelligence
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

// Orchestration Types
export type AgentRole = 'supervisor' | 'worker' | 'specialist' | 'coordinator';
export type OrchestrationPattern = 'hierarchical' | 'peer-to-peer' | 'swarm' | 'pipeline';

export interface AgentTeam {
  id: string;
  name: string;
  description?: string;
  pattern: OrchestrationPattern;
  supervisorId?: string;
  members: TeamMember[];
  sharedTools: string[];
  sharedMemory: SharedMemory;
  config: TeamConfig;
  status: 'active' | 'inactive' | 'processing';
  createdAt: string;
}

export interface TeamMember {
  agentId: string;
  role: AgentRole;
  priority: number;
  capabilities: string[];
  constraints?: MemberConstraints;
}

export interface MemberConstraints {
  maxConcurrentTasks: number;
  allowedTools: string[];
  memoryAccess: 'full' | 'read-only' | 'none';
}

export interface SharedMemory {
  id: string;
  context: Record<string, any>;
  history: MemoryEntry[];
  embeddings?: number[][];
  lastUpdated: string;
}

export interface MemoryEntry {
  timestamp: string;
  agentId: string;
  type: 'observation' | 'action' | 'result' | 'insight';
  content: any;
  importance: number;
}

export interface TeamConfig {
  maxIterations: number;
  consensusThreshold: number;
  timeoutMs: number;
  handoffProtocol: 'explicit' | 'automatic' | 'supervised';
  conflictResolution: 'supervisor' | 'voting' | 'priority';
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  agentId: string;
  status: 'assigned' | 'accepted' | 'working' | 'completed' | 'failed' | 'delegated';
  delegatedTo?: string;
  result?: any;
  startedAt?: string;
  completedAt?: string;
}

export interface SwarmDecision {
  id: string;
  question: string;
  votes: SwarmVote[];
  consensus?: string;
  confidence: number;
  decidedAt?: string;
}

export interface SwarmVote {
  agentId: string;
  vote: string;
  confidence: number;
  reasoning?: string;
  timestamp: string;
}

export const useMultiAgentOrchestration = (teamId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMasterToast();
  const [activeAssignments, setActiveAssignments] = useState<Map<string, TaskAssignment>>(new Map());
  const [swarmDecisions, setSwarmDecisions] = useState<Map<string, SwarmDecision>>(new Map());

  // Fetch team details
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ['agent-team', teamId],
    queryFn: async () => {
      if (!teamId) return null;

      // For now, build team from agent_communications relationships
      const { data: communications } = await supabase
        .from('agent_communications')
        .select('from_agent_id, to_agent_id, metadata')
        .eq('conversation_id', teamId);

      // Get unique agent IDs
      const agentIds = new Set<string>();
      communications?.forEach(c => {
        agentIds.add(c.from_agent_id);
        if (c.to_agent_id) agentIds.add(c.to_agent_id);
      });

      // Fetch agent details
      const { data: agents } = await supabase
        .from('agents')
        .select('*')
        .in('id', Array.from(agentIds));

      if (!agents?.length) return null;

      // Build team structure
      const team: AgentTeam = {
        id: teamId,
        name: `Team ${teamId.slice(0, 8)}`,
        pattern: 'hierarchical',
        supervisorId: agents[0]?.id,
        members: agents.map((agent, index) => ({
          agentId: agent.id,
          role: index === 0 ? 'supervisor' : 'worker',
          priority: index + 1,
          capabilities: agent.enabled_features || []
        })),
        sharedTools: ['chat', 'search', 'analyze'],
        sharedMemory: {
          id: `memory_${teamId}`,
          context: {},
          history: [],
          lastUpdated: new Date().toISOString()
        },
        config: {
          maxIterations: 10,
          consensusThreshold: 0.7,
          timeoutMs: 30000,
          handoffProtocol: 'automatic',
          conflictResolution: 'supervisor'
        },
        status: 'active',
        createdAt: new Date().toISOString()
      };

      return team;
    },
    enabled: !!teamId
  });

  // Fetch all teams
  const { data: teams = [] } = useQuery({
    queryKey: ['agent-teams'],
    queryFn: async () => {
      // Get unique conversation IDs that represent team interactions
      const { data } = await supabase
        .from('agent_communications')
        .select('conversation_id')
        .not('to_agent_id', 'is', null)
        .limit(50);

      const uniqueTeams = [...new Set(data?.map(d => d.conversation_id).filter(Boolean))];
      
      return uniqueTeams.map(id => ({
        id,
        name: `Team ${id?.slice(0, 8)}`,
        memberCount: 2,
        status: 'active'
      }));
    }
  });

  // Create new team
  const createTeamMutation = useMutation({
    mutationFn: async ({
      name,
      pattern,
      memberIds,
      supervisorId
    }: {
      name: string;
      pattern: OrchestrationPattern;
      memberIds: string[];
      supervisorId?: string;
    }) => {
      const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create initial team communication
      const { error } = await supabase
        .from('agent_communications')
        .insert([{
          from_agent_id: supervisorId || memberIds[0],
          to_agent_id: memberIds[1] || memberIds[0],
          message_type: 'notification',
          message_payload: {
            type: 'team_created',
            teamId,
            name,
            pattern,
            members: memberIds
          } as any,
          conversation_id: teamId,
          status: 'processed',
          metadata: {
            isTeamCreation: true,
            supervisorId: supervisorId || memberIds[0]
          } as any
        }]);

      if (error) throw error;

      return { id: teamId, name, pattern, memberIds };
    },
    onSuccess: (team) => {
      queryClient.invalidateQueries({ queryKey: ['agent-teams'] });
      showSuccess('Team Created', `${team.name} is ready`);
    },
    onError: (error: any) => {
      showError('Creation Failed', error.message);
    }
  });

  // Assign task to team
  const assignTaskMutation = useMutation({
    mutationFn: async ({
      task,
      strategy = 'auto'
    }: {
      task: { id: string; description: string; requirements?: string[] };
      strategy?: 'auto' | 'round-robin' | 'capability-match' | 'load-balance';
    }) => {
      if (!team) throw new Error('No team selected');

      // Select agent based on strategy
      let selectedAgent: TeamMember;
      
      switch (strategy) {
        case 'capability-match':
          selectedAgent = findBestMatch(team.members, task.requirements || []);
          break;
        case 'load-balance':
          selectedAgent = findLeastLoaded(team.members, activeAssignments);
          break;
        case 'round-robin':
          selectedAgent = getNextInRotation(team.members, activeAssignments);
          break;
        default:
          // Auto: Use supervisor for complex tasks, workers for simple ones
          selectedAgent = team.members.find(m => m.role === 'worker') || team.members[0];
      }

      const assignment: TaskAssignment = {
        id: `assign_${Date.now()}`,
        taskId: task.id,
        agentId: selectedAgent.agentId,
        status: 'assigned',
        startedAt: new Date().toISOString()
      };

      // Record assignment
      await supabase
        .from('agent_communications')
        .insert([{
          from_agent_id: team.supervisorId || selectedAgent.agentId,
          to_agent_id: selectedAgent.agentId,
          message_type: 'request',
          message_payload: {
            type: 'task_assignment',
            task,
            assignment
          } as any,
          conversation_id: team.id,
          status: 'sent',
          metadata: { assignment } as any
        }]);

      setActiveAssignments(prev => new Map(prev).set(assignment.id, assignment));

      return assignment;
    },
    onSuccess: (assignment) => {
      showSuccess('Task Assigned', `Task assigned to agent`);
    },
    onError: (error: any) => {
      showError('Assignment Failed', error.message);
    }
  });

  // Hand off task to another agent
  const handoffTaskMutation = useMutation({
    mutationFn: async ({
      assignmentId,
      toAgentId,
      reason
    }: {
      assignmentId: string;
      toAgentId: string;
      reason?: string;
    }) => {
      const assignment = activeAssignments.get(assignmentId);
      if (!assignment) throw new Error('Assignment not found');

      const updatedAssignment: TaskAssignment = {
        ...assignment,
        status: 'delegated',
        delegatedTo: toAgentId
      };

      // Create new assignment for receiving agent
      const newAssignment: TaskAssignment = {
        id: `assign_${Date.now()}`,
        taskId: assignment.taskId,
        agentId: toAgentId,
        status: 'assigned',
        startedAt: new Date().toISOString()
      };

      // Record handoff
      await supabase
        .from('agent_communications')
        .insert({
          from_agent_id: assignment.agentId,
          to_agent_id: toAgentId,
          message_type: 'handoff',
          message_payload: {
            type: 'task_handoff',
            originalAssignment: updatedAssignment,
            newAssignment,
            reason
          },
          conversation_id: team?.id,
          status: 'sent',
          metadata: { handoff: true }
        });

      setActiveAssignments(prev => {
        const newMap = new Map(prev);
        newMap.set(assignmentId, updatedAssignment);
        newMap.set(newAssignment.id, newAssignment);
        return newMap;
      });

      return newAssignment;
    },
    onSuccess: () => {
      showSuccess('Task Handed Off', 'Task transferred to new agent');
    },
    onError: (error: any) => {
      showError('Handoff Failed', error.message);
    }
  });

  // Initiate swarm decision
  const initiateSwarmDecisionMutation = useMutation({
    mutationFn: async ({
      question,
      options
    }: {
      question: string;
      options?: string[];
    }) => {
      if (!team) throw new Error('No team selected');

      const decisionId = `decision_${Date.now()}`;
      const decision: SwarmDecision = {
        id: decisionId,
        question,
        votes: [],
        confidence: 0
      };

      // Broadcast question to all team members
      const broadcasts = team.members.map(member =>
        supabase
          .from('agent_communications')
          .insert({
            from_agent_id: team.supervisorId || team.members[0].agentId,
            to_agent_id: member.agentId,
            message_type: 'request',
            message_payload: {
              type: 'swarm_vote_request',
              decisionId,
              question,
              options
            },
            conversation_id: team.id,
            status: 'sent',
            metadata: { swarmDecision: true }
          })
      );

      await Promise.all(broadcasts);

      setSwarmDecisions(prev => new Map(prev).set(decisionId, decision));

      // Simulate votes coming in
      setTimeout(() => simulateSwarmVotes(decisionId, team.members), 1000);

      return decision;
    },
    onSuccess: (decision) => {
      showSuccess('Swarm Decision Started', 'Collecting votes from team');
    },
    onError: (error: any) => {
      showError('Decision Failed', error.message);
    }
  });

  // Submit vote for swarm decision
  const submitSwarmVote = useCallback((
    decisionId: string,
    agentId: string,
    vote: string,
    confidence: number,
    reasoning?: string
  ) => {
    setSwarmDecisions(prev => {
      const decision = prev.get(decisionId);
      if (!decision) return prev;

      const newVote: SwarmVote = {
        agentId,
        vote,
        confidence,
        reasoning,
        timestamp: new Date().toISOString()
      };

      const updatedVotes = [...decision.votes, newVote];
      
      // Calculate consensus
      const voteCount = new Map<string, { count: number; totalConfidence: number }>();
      updatedVotes.forEach(v => {
        const existing = voteCount.get(v.vote) || { count: 0, totalConfidence: 0 };
        voteCount.set(v.vote, {
          count: existing.count + 1,
          totalConfidence: existing.totalConfidence + v.confidence
        });
      });

      let consensus: string | undefined;
      let maxConfidence = 0;
      
      voteCount.forEach((data, voteOption) => {
        const avgConfidence = data.totalConfidence / data.count;
        if (avgConfidence > maxConfidence && data.count >= (team?.members.length || 1) * (team?.config.consensusThreshold || 0.5)) {
          consensus = voteOption;
          maxConfidence = avgConfidence;
        }
      });

      const updatedDecision: SwarmDecision = {
        ...decision,
        votes: updatedVotes,
        consensus,
        confidence: maxConfidence,
        decidedAt: consensus ? new Date().toISOString() : undefined
      };

      const newMap = new Map(prev);
      newMap.set(decisionId, updatedDecision);
      return newMap;
    });
  }, [team]);

  // Simulate swarm votes (for demo)
  const simulateSwarmVotes = useCallback((decisionId: string, members: TeamMember[]) => {
    const options = ['Approve', 'Reject', 'Defer'];
    
    members.forEach((member, index) => {
      setTimeout(() => {
        const vote = options[Math.floor(Math.random() * options.length)];
        const confidence = 0.5 + Math.random() * 0.5;
        submitSwarmVote(decisionId, member.agentId, vote, confidence, `Analysis complete`);
      }, index * 500);
    });
  }, [submitSwarmVote]);

  // Update shared memory
  const updateSharedMemoryMutation = useMutation({
    mutationFn: async ({
      agentId,
      entry
    }: {
      agentId: string;
      entry: Omit<MemoryEntry, 'timestamp' | 'agentId'>;
    }) => {
      if (!team) throw new Error('No team selected');

      const memoryEntry: MemoryEntry = {
        ...entry,
        timestamp: new Date().toISOString(),
        agentId
      };

      // Record memory update
      await supabase
        .from('agent_communications')
        .insert({
          from_agent_id: agentId,
          message_type: 'notification',
          message_payload: {
            type: 'memory_update',
            entry: memoryEntry
          },
          conversation_id: team.id,
          status: 'processed',
          metadata: { memoryUpdate: true }
        });

      return memoryEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-team', teamId] });
    }
  });

  // Share tool with team
  const shareToolMutation = useMutation({
    mutationFn: async ({
      toolId,
      restrictions
    }: {
      toolId: string;
      restrictions?: { allowedRoles?: AgentRole[]; rateLimit?: number };
    }) => {
      if (!team) throw new Error('No team selected');

      // Broadcast tool availability
      await supabase
        .from('agent_communications')
        .insert([{
          from_agent_id: team.supervisorId || team.members[0].agentId,
          message_type: 'notification',
          message_payload: {
            type: 'tool_shared',
            toolId,
            restrictions
          } as any,
          conversation_id: team.id,
          status: 'processed',
          metadata: { toolSharing: true } as any
        }]);

      return { toolId, restrictions };
    },
    onSuccess: (tool) => {
      showSuccess('Tool Shared', `Tool ${tool.toolId} available to team`);
    }
  });

  return {
    // Team Management
    team,
    teams,
    isLoading: teamLoading,
    createTeam: createTeamMutation.mutate,
    isCreatingTeam: createTeamMutation.isPending,

    // Task Assignment
    activeAssignments: Array.from(activeAssignments.values()),
    assignTask: assignTaskMutation.mutate,
    handoffTask: handoffTaskMutation.mutate,
    isAssigning: assignTaskMutation.isPending,

    // Swarm Intelligence
    swarmDecisions: Array.from(swarmDecisions.values()),
    initiateSwarmDecision: initiateSwarmDecisionMutation.mutate,
    submitSwarmVote,
    isInitiatingDecision: initiateSwarmDecisionMutation.isPending,

    // Shared Resources
    updateSharedMemory: updateSharedMemoryMutation.mutate,
    shareTool: shareToolMutation.mutate
  };
};

// Helper functions
function findBestMatch(members: TeamMember[], requirements: string[]): TeamMember {
  let bestMatch = members[0];
  let bestScore = 0;

  members.forEach(member => {
    const matchScore = member.capabilities.filter(cap => 
      requirements.some(req => cap.toLowerCase().includes(req.toLowerCase()))
    ).length;
    
    if (matchScore > bestScore) {
      bestScore = matchScore;
      bestMatch = member;
    }
  });

  return bestMatch;
}

function findLeastLoaded(members: TeamMember[], assignments: Map<string, TaskAssignment>): TeamMember {
  const loadMap = new Map<string, number>();
  
  assignments.forEach(assignment => {
    if (assignment.status === 'working' || assignment.status === 'assigned') {
      loadMap.set(assignment.agentId, (loadMap.get(assignment.agentId) || 0) + 1);
    }
  });

  let leastLoaded = members[0];
  let minLoad = Infinity;

  members.forEach(member => {
    const load = loadMap.get(member.agentId) || 0;
    if (load < minLoad) {
      minLoad = load;
      leastLoaded = member;
    }
  });

  return leastLoaded;
}

function getNextInRotation(members: TeamMember[], assignments: Map<string, TaskAssignment>): TeamMember {
  // Get last assigned agent
  let lastIndex = -1;
  let lastTime = 0;

  assignments.forEach(assignment => {
    const memberIndex = members.findIndex(m => m.agentId === assignment.agentId);
    const assignTime = new Date(assignment.startedAt || 0).getTime();
    
    if (assignTime > lastTime) {
      lastTime = assignTime;
      lastIndex = memberIndex;
    }
  });

  // Return next in rotation
  return members[(lastIndex + 1) % members.length];
}
