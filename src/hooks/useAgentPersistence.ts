import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AgentSessionData {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  template_id?: string;
  template_type?: string;
  current_step: string;
  status: string;
  basic_info?: Record<string, any>;
  canvas?: Record<string, any>;
  actions?: Record<string, any>;
  connectors?: Record<string, any>;
  knowledge?: Record<string, any>;
  rag?: Record<string, any>;
  deployment?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export const useAgentPersistence = (sessionId?: string) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Save or update agent session data
  const saveAgentSession = useCallback(async (
    data: Partial<AgentSessionData>,
    section?: string
  ) => {
    setIsSaving(true);
    try {
      const updateData: Partial<AgentSessionData> = {
        ...data,
        updated_at: new Date().toISOString()
      };

      let result;
      
      if (sessionId) {
        // Update existing session
        const { data: updatedData, error } = await supabase
          .from('agent_sessions')
          .update(updateData)
          .eq('id', sessionId)
          .select()
          .single();

        if (error) throw error;
        result = updatedData;
      } else {
        // Create new session
        const { data: newData, error } = await supabase
          .from('agent_sessions')
          .insert([{
            user_id: (await supabase.auth.getUser()).data.user?.id,
            ...updateData
          }])
          .select()
          .single();

        if (error) throw error;
        result = newData;
      }

      setLastSaved(new Date());
      
      toast({
        title: "Saved Successfully",
        description: section 
          ? `${section} configuration saved`
          : "Agent session saved successfully"
      });

      return result;

    } catch (error) {
      console.error('Error saving agent session:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save agent configuration. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [sessionId]);

  // Save specific section (basic_info, connectors, etc.)
  const saveSection = useCallback(async (
    sectionName: string, 
    sectionData: Record<string, any>
  ) => {
    return saveAgentSession({ [sectionName]: sectionData }, sectionName);
  }, [saveAgentSession]);

  // Load agent session data
  const loadAgentSession = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error loading agent session:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load agent configuration.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save basic info section
  const saveBasicInfo = useCallback(async (basicInfo: Record<string, any>) => {
    return saveSection('basic_info', basicInfo);
  }, [saveSection]);

  // Save connectors configuration
  const saveConnectors = useCallback(async (connectors: Record<string, any>) => {
    return saveSection('connectors', connectors);
  }, [saveSection]);

  // Save actions configuration
  const saveActions = useCallback(async (actions: Record<string, any>) => {
    return saveSection('actions', actions);
  }, [saveSection]);

  // Save knowledge base configuration
  const saveKnowledge = useCallback(async (knowledge: Record<string, any>) => {
    return saveSection('knowledge', knowledge);
  }, [saveSection]);

  // Save RAG configuration
  const saveRAG = useCallback(async (rag: Record<string, any>) => {
    return saveSection('rag', rag);
  }, [saveSection]);

  // Save deployment configuration
  const saveDeployment = useCallback(async (deployment: Record<string, any>) => {
    return saveSection('deployment', deployment);
  }, [saveSection]);

  // Auto-save functionality
  const enableAutoSave = useCallback((
    data: Partial<AgentSessionData>,
    intervalMs: number = 30000 // 30 seconds
  ) => {
    const interval = setInterval(() => {
      saveAgentSession(data, 'auto-save');
    }, intervalMs);

    return () => clearInterval(interval);
  }, [saveAgentSession]);

  // Get session status
  const getSessionStatus = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('agent_sessions')
        .select('status, current_step, updated_at')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error getting session status:', error);
      return null;
    }
  }, []);

  // Deploy agent (update status to active)
  const deployAgent = useCallback(async (deploymentConfig: Record<string, any>) => {
    if (!sessionId) throw new Error('No session ID provided');

    try {
      const { data, error } = await supabase
        .from('agent_sessions')
        .update({
          status: 'active',
          deployment: deploymentConfig,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Agent Deployed",
        description: "Your agent has been successfully deployed and is now active."
      });

      return data;

    } catch (error) {
      console.error('Error deploying agent:', error);
      toast({
        title: "Deployment Failed",
        description: "Failed to deploy agent. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  }, [sessionId]);

  return {
    // Save functions
    saveAgentSession,
    saveSection,
    saveBasicInfo,
    saveConnectors,
    saveActions,
    saveKnowledge,
    saveRAG,
    saveDeployment,
    
    // Load functions
    loadAgentSession,
    getSessionStatus,
    
    // Deployment
    deployAgent,
    
    // Auto-save
    enableAutoSave,
    
    // State
    isSaving,
    isLoading,
    lastSaved
  };
};