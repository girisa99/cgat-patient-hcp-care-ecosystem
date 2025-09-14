import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';
import { ConversationMessage } from './useConversationState';

// Configuration interfaces
export interface GenieConfiguration {
  id?: string;
  configuration_name: string;
  selected_mode: 'system' | 'single' | 'multi';
  selected_models: string[];
  left_model: string;
  right_model: string;
  selected_model_type: 'llm' | 'slm' | 'vlm';
  enabled_features: string[];
  selected_mcp_tools: string[];
  knowledge_base: string;
  medical_context: boolean;
  is_default: boolean;
}

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

// Database types for proper type mapping
type DatabaseGenieConfiguration = {
  id: string;
  user_id: string;
  configuration_name: string;
  selected_mode: string;
  selected_models: any;
  left_model: string;
  right_model: string;
  selected_model_type: string;
  enabled_features: any;
  selected_mcp_tools: any;
  knowledge_base: string;
  medical_context: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

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

export const useGenieState = () => {
  const [loading, setLoading] = useState(false);
  
  // Configuration state
  const [configurations, setConfigurations] = useState<GenieConfiguration[]>([]);
  const [currentConfig, setCurrentConfig] = useState<GenieConfiguration | null>(null);
  
  // Conversation state  
  const [sessions, setSessions] = useState<GenieConversationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<GenieConversationSession | null>(null);
  
  const { showError, showSuccess } = useMasterToast();
  // Prevent repeated 'Failed to fetch' toasts
  const fetchErrorShownRef = (globalThis as any).__genieFetchErrorShownRef || { current: false };
  ;(globalThis as any).__genieFetchErrorShownRef = fetchErrorShownRef;

  // Configuration methods
  const loadConfigurations = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('genie_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const configs = (data || []).map((dbConfig: DatabaseGenieConfiguration): GenieConfiguration => ({
        id: dbConfig.id,
        configuration_name: dbConfig.configuration_name,
        selected_mode: dbConfig.selected_mode as 'system' | 'single' | 'multi',
        selected_models: Array.isArray(dbConfig.selected_models) ? (dbConfig.selected_models as string[]) : [],
        left_model: dbConfig.left_model,
        right_model: dbConfig.right_model,
        selected_model_type: dbConfig.selected_model_type as 'llm' | 'slm' | 'vlm',
        enabled_features: Array.isArray(dbConfig.enabled_features) ? (dbConfig.enabled_features as string[]) : [],
        selected_mcp_tools: Array.isArray(dbConfig.selected_mcp_tools) ? (dbConfig.selected_mcp_tools as string[]) : [],
        knowledge_base: dbConfig.knowledge_base,
        medical_context: dbConfig.medical_context,
        is_default: dbConfig.is_default
      }));
      
      setConfigurations(configs);

      // Set default or first config as current
      const defaultConfig = configs.find(c => c.is_default) || configs[0];
      if (defaultConfig && !currentConfig) {
        setCurrentConfig(defaultConfig);
      }
    } catch (error: any) {
      console.error('Error loading genie configurations:', error);
      showError(error.message || 'Failed to load configurations');
    } finally {
      setLoading(false);
    }
  }, [currentConfig, showError]);

  const saveConfiguration = useCallback(async (config: Omit<GenieConfiguration, 'id'>) => {
    try {
      setLoading(true);
      
      // Get current user with fallback to session
      let { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!user) {
        const { data: sessionData } = await supabase.auth.getSession();
        user = (sessionData as any)?.session?.user ?? null;
      }
      if (authError || !user) {
        throw new Error('Authentication required to save configuration');
      }
      
      // If setting as default, unset other defaults first
      if (config.is_default) {
        await supabase
          .from('genie_configurations')
          .update({ is_default: false })
          .neq('id', '00000000-0000-0000-0000-000000000000');
      }

      const configWithUser = {
        ...config,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('genie_configurations')
        .insert([configWithUser])
        .select()
        .single();

      if (error) throw error;

      const savedConfig: GenieConfiguration = {
        id: data.id,
        configuration_name: data.configuration_name,
        selected_mode: data.selected_mode as 'system' | 'single' | 'multi',
        selected_models: Array.isArray(data.selected_models) ? data.selected_models.map(String) : [],
        left_model: data.left_model,
        right_model: data.right_model,
        selected_model_type: data.selected_model_type as 'llm' | 'slm' | 'vlm',
        enabled_features: Array.isArray(data.enabled_features) ? data.enabled_features.map(String) : [],
        selected_mcp_tools: Array.isArray(data.selected_mcp_tools) ? data.selected_mcp_tools.map(String) : [],
        knowledge_base: data.knowledge_base,
        medical_context: data.medical_context,
        is_default: data.is_default
      };

      await loadConfigurations();
      setCurrentConfig(savedConfig);
      showSuccess('Configuration saved successfully');
      return savedConfig;
    } catch (error: any) {
      console.error('Error saving genie configuration:', error);
      showError(error.message || 'Failed to save configuration');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadConfigurations, showError, showSuccess]);

  // Session methods
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('genie_conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(20);

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

  const saveSession = useCallback(async (session: Omit<GenieConversationSession, 'id'>) => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required to save session');
      }
      
      const dbSession = {
        user_id: user.id,
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
    loadConfigurations();
    loadSessions();
  }, [loadConfigurations, loadSessions]);

  return {
    loading,
    
    // Configuration
    configurations,
    currentConfig,
    setCurrentConfig,
    loadConfigurations,
    saveConfiguration,
    
    // Sessions
    sessions,
    currentSession,
    setCurrentSession,
    loadSessions,
    saveSession,
    updateSession,
    createNewSession
  };
};