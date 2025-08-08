import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface VoiceLiveAgent {
  id: string;
  name: string;
  email: string;
  department: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  skills: string[];
  max_concurrent_calls: number;
  current_calls: number;
  avg_response_time: number;
  total_calls_handled: number;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateAgentData {
  name: string;
  email: string;
  department?: string;
  skills?: string[];
  max_concurrent_calls?: number;
}

interface UpdateAgentData extends Partial<CreateAgentData> {
  status?: 'online' | 'offline' | 'busy' | 'away';
  is_active?: boolean;
}

export const useVoiceLiveAgents = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch live agents
  const { data: liveAgents = [], isLoading, error } = useQuery({
    queryKey: ['voice-live-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voice_live_agents')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as VoiceLiveAgent[];
    }
  });

  // Create live agent
  const createAgent = useMutation({
    mutationFn: async (agentData: CreateAgentData) => {
      const { data, error } = await supabase
        .from('voice_live_agents')
        .insert([agentData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-live-agents'] });
      showSuccess('Live agent created successfully');
    },
    onError: (error) => {
      console.error('Error creating live agent:', error);
      showError('Failed to create live agent');
    },
  });

  // Update live agent
  const updateAgent = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateAgentData }) => {
      const { data, error } = await supabase
        .from('voice_live_agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-live-agents'] });
      showSuccess('Live agent updated successfully');
    },
    onError: (error) => {
      console.error('Error updating live agent:', error);
      showError('Failed to update live agent');
    },
  });

  // Delete live agent
  const deleteAgent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('voice_live_agents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-live-agents'] });
      showSuccess('Live agent deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting live agent:', error);
      showError('Failed to delete live agent');
    },
  });

  return {
    liveAgents,
    isLoading,
    error,
    createAgent: createAgent.mutate,
    updateAgent: updateAgent.mutate,
    deleteAgent: deleteAgent.mutate,
    isCreating: createAgent.isPending,
    isUpdating: updateAgent.isPending,
    isDeleting: deleteAgent.isPending,
  };
};