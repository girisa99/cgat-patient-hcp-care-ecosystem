import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  ConversationEngine, 
  AgentConversationEngine,
  MultiModelConversation,
  ConversationMessage,
  ModelConfiguration
} from '@/types/conversation-engine';
import { toast } from '@/hooks/use-toast';

export const useConversationEngines = () => {
  const [engines, setEngines] = useState<ConversationEngine[]>([]);
  const [agentEngines, setAgentEngines] = useState<AgentConversationEngine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversation engines
  const fetchEngines = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('conversation_engines')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (fetchError) throw fetchError;
      setEngines((data || []) as ConversationEngine[]);
    } catch (err) {
      console.error('Error fetching engines:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Fetch agent-engine assignments
  const fetchAgentEngines = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('agent_conversation_engines')
        .select(`
          *,
          conversation_engines (
            id, name, engine_type, provider, model_identifier
          )
        `)
        .eq('is_active', true)
        .order('priority');

      if (fetchError) throw fetchError;
      setAgentEngines((data || []) as AgentConversationEngine[]);
    } catch (err) {
      console.error('Error fetching agent engines:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Assign engine to agent
  const assignEngineToAgent = async (
    agentId: string,
    engineId: string,
    role: AgentConversationEngine['role'],
    priority: number = 1,
    conditions?: Record<string, any>
  ) => {
    try {
      const { error: insertError } = await supabase
        .from('agent_conversation_engines')
        .insert({
          agent_id: agentId,
          conversation_engine_id: engineId,
          role,
          priority,
          conditions: conditions || {},
          is_active: true,
        });

      if (insertError) throw insertError;

      await fetchAgentEngines();
      
      toast({
        title: "Engine Assigned",
        description: `Conversation engine assigned to agent with ${role} role`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign engine';
      setError(errorMessage);
      toast({
        title: "Assignment Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Remove engine assignment
  const removeEngineAssignment = async (assignmentId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('agent_conversation_engines')
        .delete()
        .eq('id', assignmentId);

      if (deleteError) throw deleteError;

      await fetchAgentEngines();
      
      toast({
        title: "Assignment Removed",
        description: "Engine assignment successfully removed",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove assignment';
      setError(errorMessage);
      toast({
        title: "Removal Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Get engines by type
  const getEnginesByType = (type: ConversationEngine['engine_type']) => {
    return engines.filter(engine => engine.engine_type === type);
  };

  // Get engines by provider
  const getEnginesByProvider = (provider: string) => {
    return engines.filter(engine => engine.provider === provider);
  };

  // Get agent's primary engine
  const getAgentPrimaryEngine = (agentId: string) => {
    return agentEngines.find(ae => 
      ae.agent_id === agentId && 
      ae.role === 'primary' && 
      ae.is_active
    );
  };

  // Get all engines for agent
  const getAgentEngines = (agentId: string) => {
    return agentEngines
      .filter(ae => ae.agent_id === agentId && ae.is_active)
      .sort((a, b) => a.priority - b.priority);
  };

  // Route message to appropriate engine(s)
  const routeMessage = async (
    agentId: string,
    message: string,
    context?: Record<string, any>
  ): Promise<{
    selectedEngines: ConversationEngine[];
    routingReason: string;
  }> => {
    const agentEngineList = getAgentEngines(agentId);
    
    if (agentEngineList.length === 0) {
      throw new Error('No conversation engines assigned to agent');
    }

    // Simple routing logic - in production, this would be more sophisticated
    const primaryAssignment = agentEngineList.find(ae => ae.role === 'primary');
    
    if (primaryAssignment) {
      const primaryEngine = engines.find(e => e.id === primaryAssignment.conversation_engine_id);
      if (primaryEngine) {
        return {
          selectedEngines: [primaryEngine],
          routingReason: 'Primary engine selected for general conversation',
        };
      }
    }

    // Fallback to first available engine
    const fallbackAssignment = agentEngineList[0];
    const fallbackEngine = engines.find(e => e.id === fallbackAssignment.conversation_engine_id);
    
    return {
      selectedEngines: fallbackEngine ? [fallbackEngine] : [],
      routingReason: 'Fallback engine selected',
    };
  };

  // Process message with selected engine
  const processMessage = async (
    engine: ConversationEngine,
    message: string,
    context?: Record<string, any>
  ): Promise<{
    response: string;
    confidence: number;
    intent?: string;
    entities?: Record<string, any>;
  }> => {
    // This would integrate with actual LLM/SML/MCP providers
    // For now, return a mock response
    return {
      response: `Response from ${engine.name}: ${message}`,
      confidence: 0.95,
      intent: 'general_conversation',
      entities: {},
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchEngines(), fetchAgentEngines()]);
      setLoading(false);
    };

    loadData();

    // Set up real-time subscriptions
    const enginesSubscription = supabase
      .channel('conversation_engines')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_engines'
        },
        () => {
          fetchEngines();
        }
      )
      .subscribe();

    const agentEnginesSubscription = supabase
      .channel('agent_conversation_engines')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_conversation_engines'
        },
        () => {
          fetchAgentEngines();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(enginesSubscription);
      supabase.removeChannel(agentEnginesSubscription);
    };
  }, []);

  return {
    engines,
    agentEngines,
    loading,
    error,
    assignEngineToAgent,
    removeEngineAssignment,
    getEnginesByType,
    getEnginesByProvider,
    getAgentPrimaryEngine,
    getAgentEngines: getAgentEngines,
    routeMessage,
    processMessage,
    refetch: () => Promise.all([fetchEngines(), fetchAgentEngines()]),
  };
};