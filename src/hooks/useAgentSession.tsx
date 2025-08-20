import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useMasterAuth } from '@/hooks/useMasterAuth';

export interface AgentSession {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  template_id?: string;
  template_type?: string;
  current_step: string;
  status: string;
  basic_info?: any;
  canvas?: {
    nodes?: any[];
    edges?: any[];
    viewport?: any;
    metadata?: any;
    name?: string;
    tagline?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    workflow_steps?: any[];
    layout?: any;
  };
  actions?: any;
  connectors?: any;
  knowledge?: any;
  rag?: any;
  deployment?: any;
  created_at: string;
  updated_at: string;
}

export const useAgentSession = () => {
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [currentSession, setCurrentSession] = useState<AgentSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useMasterToast();
  const { user } = useMasterAuth();

  // Fetch all sessions for the current user
  const fetchSessions = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch sessions';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Create a new session
  const createSession = async (sessionData: Partial<AgentSession>) => {
    if (!user?.id) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agent_sessions')
        .insert({
          user_id: user.id,
          name: sessionData.name || 'Untitled Session',
          description: sessionData.description,
          current_step: sessionData.current_step || 'basic_info',
          status: sessionData.status || 'draft',
          canvas: sessionData.canvas || { nodes: [], edges: [] },
          ...sessionData
        })
        .select()
        .single();

      if (error) throw error;
      
      setSessions(prev => [data, ...prev]);
      showSuccess('Session created successfully');
      return data;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create session';
      showError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing session
  const updateSession = async (sessionId: string, updates: Partial<AgentSession>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agent_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      setSessions(prev => prev.map(s => s.id === sessionId ? data : s));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(data);
      }
      
      return data;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update session';
      showError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Auto-save functionality
  const autoSave = async (sessionId: string, updates: Partial<AgentSession>) => {
    try {
      await supabase
        .from('agent_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      // Silent update for auto-save
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...updates } : s));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      // Silent failure for auto-save
      console.warn('Auto-save failed:', err);
    }
  };

  // Update canvas data specifically
  const updateCanvas = async (sessionId: string, canvasData: any) => {
    try {
      const result = await updateSession(sessionId, { canvas: canvasData });
      return result;
    } catch (err) {
      console.warn('Canvas update failed:', err);
      return null;
    }
  };

  // Delete a session
  const deleteSession = async (sessionId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('agent_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
      
      showSuccess('Session deleted successfully');
      return true;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete session';
      showError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get a specific session
  const getSession = async (sessionId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      setCurrentSession(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch session';
      showError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete duplicate autoSave function
  
  // Initialize sessions on mount
  useEffect(() => {
    if (user?.id) {
      fetchSessions();
    }
  }, [user?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('agent_sessions')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'agent_sessions',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSessions(prev => [payload.new as AgentSession, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setSessions(prev => prev.map(s => s.id === payload.new.id ? payload.new as AgentSession : s));
            if (currentSession?.id === payload.new.id) {
              setCurrentSession(payload.new as AgentSession);
            }
          } else if (payload.eventType === 'DELETE') {
            setSessions(prev => prev.filter(s => s.id !== payload.old.id));
            if (currentSession?.id === payload.old.id) {
              setCurrentSession(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, currentSession?.id]);

  return {
    sessions,
    currentSession,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    updateCanvas,
    deleteSession,
    getSession,
    autoSave,
    setCurrentSession
  };
};