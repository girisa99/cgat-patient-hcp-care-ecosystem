import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AgentSession, AgentSessionUpdate } from '@/types/agent-session';
import { toast } from '@/hooks/use-toast';

export const useAgentSession = (sessionId?: string) => {
  const queryClient = useQueryClient();
  const [currentSession, setCurrentSession] = useState<AgentSession | null>(null);

  // Fetch session if sessionId provided
  const { data: session, isLoading } = useQuery({
    queryKey: ['agent-session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      
      const { data, error } = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
        
      if (error) throw error;
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
        
      if (error) throw error;
      return data as AgentSession[];
    },
  });

  // Create new session
  const createSession = useMutation({
    mutationFn: async (sessionData: Partial<AgentSession>) => {
      const { data, error } = await supabase
        .from('agent_sessions')
        .insert([{
          name: sessionData.name || 'Untitled Agent',
          description: sessionData.description,
          template_id: sessionData.template_id,
          template_type: sessionData.template_type || 'custom',
          current_step: 'basic_info',
          status: 'draft',
          basic_info: sessionData.basic_info || { name: sessionData.name || 'Untitled Agent', description: sessionData.description || '' },
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();
        
      if (error) throw error;
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
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();
        
      if (error) throw error;
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
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();
        
      if (error) throw error;
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
        
      if (error) throw error;
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
      const session = currentSession || session;
      if (!session) throw new Error('No session found');

      const agentData = {
        name: session.basic_info?.name || session.name,
        description: session.basic_info?.description || session.description,
        purpose: session.basic_info?.purpose,
        use_case: session.basic_info?.use_case,
        brand: session.basic_info?.brand,
        categories: session.basic_info?.categories || [],
        topics: session.basic_info?.topics || [],
        business_units: session.basic_info?.business_units || [],
        template_id: session.template_id,
        configuration: {
          canvas: session.canvas,
          actions: session.actions,
          connectors: session.connectors,
          knowledge: session.knowledge,
          rag: session.rag,
        },
        deployment_config: session.deployment,
        status: 'draft',
        agent_type: 'single',
        created_by: session.user_id,
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
    if (session) {
      setCurrentSession(session);
    }
  }, [session]);

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