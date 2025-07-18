import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AgentSession, AgentSessionUpdate } from '@/types/agent-session';
import { toast } from '@/hooks/use-toast';

export const useAgentSession = (sessionId?: string) => {
  const queryClient = useQueryClient();
  const [currentSession, setCurrentSession] = useState<AgentSession | null>(null);

  // Temporary: Use localStorage for sessions until types are updated
  const getSessionsFromStorage = (): AgentSession[] => {
    const stored = localStorage.getItem('agent-sessions');
    return stored ? JSON.parse(stored) : [];
  };

  const saveSessionsToStorage = (sessions: AgentSession[]) => {
    localStorage.setItem('agent-sessions', JSON.stringify(sessions));
  };

  // Fetch session if sessionId provided
  const { data: fetchedSession, isLoading } = useQuery({
    queryKey: ['agent-session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const sessions = getSessionsFromStorage();
      return sessions.find(s => s.id === sessionId) || null;
    },
    enabled: !!sessionId,
  });

  // Fetch user's sessions
  const { data: userSessions = [] } = useQuery({
    queryKey: ['user-agent-sessions'],
    queryFn: async () => {
      return getSessionsFromStorage();
    },
  });

  // Create new session
  const createSession = useMutation({
    mutationFn: async (sessionData: Partial<AgentSession>) => {
      const user = await supabase.auth.getUser();
      const newSession: AgentSession = {
        id: crypto.randomUUID(),
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
        user_id: user.data.user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const sessions = getSessionsFromStorage();
      sessions.unshift(newSession);
      saveSessionsToStorage(sessions);
      
      return newSession;
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
      const sessions = getSessionsFromStorage();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) throw new Error('Session not found');
      
      const updatedSession: AgentSession = {
        ...sessions[sessionIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      sessions[sessionIndex] = updatedSession;
      saveSessionsToStorage(sessions);
      
      return updatedSession;
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
      const sessions = getSessionsFromStorage();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) throw new Error('Session not found');
      
      const updatedSession: AgentSession = {
        ...sessions[sessionIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      sessions[sessionIndex] = updatedSession;
      saveSessionsToStorage(sessions);
      
      return updatedSession;
    },
    onSuccess: (data) => {
      setCurrentSession(data);
      // Don't show toast for auto-save to avoid spam
    },
  });

  // Delete session
  const deleteSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const sessions = getSessionsFromStorage();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      saveSessionsToStorage(filteredSessions);
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