import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AgentSession, AgentSessionUpdate } from '@/types/agent-session';
import { toast } from '@/hooks/use-toast';

export const useAgentSession = (sessionId?: string) => {
  const queryClient = useQueryClient();
  const [currentSession, setCurrentSession] = useState<AgentSession | null>(null);

  // Fetch session if sessionId provided
  const { data: fetchedSession, isLoading } = useQuery({
    queryKey: ['agent-session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      
      const { data, error } = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Error fetching session:', error);
        return null;
      }

      return data as AgentSession;
    },
    enabled: !!sessionId,
  });

  // Fetch user's sessions
  const { data: userSessions = [] } = useQuery({
    queryKey: ['user-agent-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching user sessions:', error);
        return [];
      }

      return (data || []) as AgentSession[];
    },
  });

  // Create new session
  const createSession = useMutation({
    mutationFn: async (sessionData: Partial<AgentSession>) => {
      const user = await supabase.auth.getUser();
      
      console.log('Auth user:', user.data.user);
      
      if (!user.data.user?.id) {
        // For development purposes, create an anonymous session if no user is authenticated
        console.warn('No authenticated user found, creating anonymous session');
        const anonymousUserId = crypto.randomUUID();
        
        const newSessionData = {
          name: sessionData.name || 'Untitled Agent',
          description: sessionData.description,
          template_id: sessionData.template_id,
          template_type: sessionData.template_type || 'custom',
          current_step: 'basic_info',
          status: 'draft',
          basic_info: sessionData.basic_info || { 
            name: sessionData.name || 'Untitled Agent', 
            description: sessionData.description || '' 
          },
          user_id: anonymousUserId,
        };

        const { data, error } = await supabase
          .from('agent_sessions')
          .insert([newSessionData])
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create session: ${error.message}`);
        }

        return data as AgentSession;
      }

      const newSessionData = {
        name: sessionData.name || 'Untitled Agent',
        description: sessionData.description,
        template_id: sessionData.template_id,
        template_type: sessionData.template_type || 'custom',
        current_step: 'basic_info',
        status: 'draft',
        basic_info: sessionData.basic_info || { 
          name: sessionData.name || 'Untitled Agent', 
          description: sessionData.description || '' 
        },
        user_id: user.data.user.id,
      };

      const { data, error } = await supabase
        .from('agent_sessions')
        .insert([newSessionData])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create session: ${error.message}`);
      }

      return data as AgentSession;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-agent-sessions'] });
      setCurrentSession(data);
      toast({
        title: "Session Created",
        description: "New agent session created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update session
  const updateSession = useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: string; updates: AgentSessionUpdate }) => {
      const { data, error } = await supabase
        .from('agent_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update session: ${error.message}`);
      }

      return data as AgentSession;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agent-session', data.id] });
      queryClient.invalidateQueries({ queryKey: ['user-agent-sessions'] });
      setCurrentSession(data);
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-save functionality
  const autoSave = useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: string; updates: AgentSessionUpdate }) => {
      const { data, error } = await supabase
        .from('agent_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to auto-save session: ${error.message}`);
      }

      return data as AgentSession;
    },
    onSuccess: (data) => {
      setCurrentSession(data);
      // Don't show toast for auto-save to avoid spam
    },
  });

  // Delete session
  const deleteSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('agent_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        throw new Error(`Failed to delete session: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-agent-sessions'] });
      toast({
        title: "Session Deleted",
        description: "Agent session deleted successfully.",
      });
    },
  });

  // Convert session to deployable agent
  const deployAgent = useMutation({
    mutationFn: async (sessionId: string) => {
      const sessionToUse = currentSession || fetchedSession;
      if (!sessionToUse) throw new Error('No session found');

      const agentData = {
        name: sessionToUse.basic_info?.name || sessionToUse.name,
        description: sessionToUse.basic_info?.description || sessionToUse.description,
        purpose: sessionToUse.basic_info?.purpose,
        use_case: sessionToUse.basic_info?.use_case,
        brand: sessionToUse.basic_info?.brand,
        categories: sessionToUse.basic_info?.categories || [],
        topics: sessionToUse.basic_info?.topics || [],
        business_units: sessionToUse.basic_info?.business_units || [],
        template_id: sessionToUse.template_id,
        configuration: {
          canvas: sessionToUse.canvas,
          actions: sessionToUse.actions,
          connectors: sessionToUse.connectors,
          knowledge: sessionToUse.knowledge,
          rag: sessionToUse.rag,
        },
        deployment_config: sessionToUse.deployment,
        status: 'draft',
        agent_type: 'single',
        created_by: sessionToUse.user_id,
      };

      const { data, error } = await supabase
        .from('agents')
        .insert([agentData])
        .select()
        .single();
        
      if (error) throw error;

      // Update session status
      await updateSession.mutateAsync({
        sessionId,
        updates: { status: 'deployed' }
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast({
        title: "Agent Deployed",
        description: "Your agent has been successfully deployed!",
      });
    },
  });

  useEffect(() => {
    if (fetchedSession) {
      setCurrentSession(fetchedSession);
    }
  }, [fetchedSession]);

  return {
    currentSession,
    setCurrentSession,
    userSessions,
    isLoading,
    createSession,
    updateSession,
    autoSave,
    deleteSession,
    deployAgent,
  };
};