import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';
import { ConversationMessage } from './useConversationState';

export interface GenieConversationSession {
  id?: string;
  conversation_id: string;
  session_name: string;
  messages: ConversationMessage[];
  configuration_snapshot: any;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

type DatabaseGenieConversation = {
  id: string;
  user_id: string;
  conversation_id: string;
  session_name: string;
  messages: any;
  configuration_snapshot: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const useGenieConversation = () => {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<GenieConversationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<GenieConversationSession | null>(null);
  const { showError, showSuccess } = useMasterToast();

  // Load user sessions
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('genie_conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(20); // Limit to recent sessions

      if (error) throw error;

      const sessionData = (data || []).map((dbSession: DatabaseGenieConversation): GenieConversationSession => ({
        id: dbSession.id,
        conversation_id: dbSession.conversation_id,
        session_name: dbSession.session_name || 'Genie Session',
        messages: Array.isArray(dbSession.messages) ? (dbSession.messages as unknown as ConversationMessage[]) : [],
        configuration_snapshot: dbSession.configuration_snapshot || {},
        is_active: dbSession.is_active || true,
        created_at: dbSession.created_at,
        updated_at: dbSession.updated_at
      }));
      
      setSessions(sessionData);
    } catch (error: any) {
      console.error('Error loading genie conversations:', error);
      showError(error.message || 'Failed to load conversation history');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Save conversation session
  const saveSession = useCallback(async (session: Omit<GenieConversationSession, 'id'>) => {
    try {
      setLoading(true);
      
      // Convert session to database format
      const dbSession = {
        conversation_id: session.conversation_id,
        session_name: session.session_name,
        messages: session.messages as any,
        configuration_snapshot: session.configuration_snapshot as any,
        is_active: session.is_active
      };
      
      const { data, error } = await supabase
        .from('genie_conversations')
        .insert([dbSession])
        .select()
        .single();

      if (error) throw error;

      const savedSession: GenieConversationSession = {
        id: data.id,
        conversation_id: data.conversation_id,
        session_name: data.session_name || 'Genie Session',
        messages: Array.isArray(data.messages) ? (data.messages as unknown as ConversationMessage[]) : [],
        configuration_snapshot: data.configuration_snapshot || {},
        is_active: data.is_active || true,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      await loadSessions();
      setCurrentSession(savedSession);
      showSuccess('Session saved successfully');
      return savedSession;
    } catch (error: any) {
      console.error('Error saving genie conversation:', error);
      showError(error.message || 'Failed to save session');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadSessions, showError, showSuccess]);

  // Update session
  const updateSession = useCallback(async (conversationId: string, updates: Partial<GenieConversationSession>) => {
    try {
      setLoading(true);
      
      // Convert updates to database format
      const dbUpdates: any = {};
      if (updates.session_name) dbUpdates.session_name = updates.session_name;
      if (updates.messages) dbUpdates.messages = updates.messages as any;
      if (updates.configuration_snapshot) dbUpdates.configuration_snapshot = updates.configuration_snapshot as any;
      if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;
      
      const { data, error } = await supabase
        .from('genie_conversations')
        .update(dbUpdates)
        .eq('conversation_id', conversationId)
        .select()
        .single();

      if (error) throw error;

      const updatedSession: GenieConversationSession = {
        id: data.id,
        conversation_id: data.conversation_id,
        session_name: data.session_name || 'Genie Session',
        messages: Array.isArray(data.messages) ? (data.messages as unknown as ConversationMessage[]) : [],
        configuration_snapshot: data.configuration_snapshot || {},
        is_active: data.is_active || true,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      // Update local state
      setSessions(prev => prev.map(s => 
        s.conversation_id === conversationId ? updatedSession : s
      ));

      if (currentSession?.conversation_id === conversationId) {
        setCurrentSession(updatedSession);
      }

      return updatedSession;
    } catch (error: any) {
      console.error('Error updating genie conversation:', error);
      showError(error.message || 'Failed to update session');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentSession, showError]);

  // Delete session
  const deleteSession = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('genie_conversations')
        .delete()
        .eq('conversation_id', conversationId);

      if (error) throw error;

      setSessions(prev => prev.filter(s => s.conversation_id !== conversationId));
      if (currentSession?.conversation_id === conversationId) {
        setCurrentSession(null);
      }

      showSuccess('Session deleted successfully');
    } catch (error: any) {
      console.error('Error deleting genie conversation:', error);
      showError(error.message || 'Failed to delete session');
    } finally {
      setLoading(false);
    }
  }, [currentSession, showError, showSuccess]);

  // Load specific session
  const loadSession = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('genie_conversations')
        .select('*')
        .eq('conversation_id', conversationId)
        .single();

      if (error) throw error;

      const sessionData: GenieConversationSession = {
        id: data.id,
        conversation_id: data.conversation_id,
        session_name: data.session_name || 'Genie Session',
        messages: Array.isArray(data.messages) ? (data.messages as unknown as ConversationMessage[]) : [],
        configuration_snapshot: data.configuration_snapshot || {},
        is_active: data.is_active || true,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setCurrentSession(sessionData);
      return sessionData;
    } catch (error: any) {
      console.error('Error loading genie conversation session:', error);
      showError(error.message || 'Failed to load session');
      return null;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Create new session
  const createNewSession = useCallback((sessionName = 'New Genie Session') => {
    const newSession: GenieConversationSession = {
      conversation_id: `genie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      session_name: sessionName,
      messages: [],
      configuration_snapshot: {},
      is_active: true
    };
    setCurrentSession(newSession);
    return newSession;
  }, []);

  // Initialize on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    loading,
    sessions,
    currentSession,
    loadSessions,
    saveSession,
    updateSession,
    deleteSession,
    loadSession,
    createNewSession,
    setCurrentSession
  };
};