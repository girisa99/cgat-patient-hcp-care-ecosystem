import { useState } from 'react';
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

// Mock data for demonstration
const mockAgents: VoiceLiveAgent[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    department: 'Customer Support',
    status: 'online',
    skills: ['General Support', 'Technical Issues'],
    max_concurrent_calls: 3,
    current_calls: 2,
    avg_response_time: 45,
    total_calls_handled: 156,
    rating: 4.8,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const useVoiceLiveAgents = () => {
  const { showSuccess, showError } = useMasterToast();
  const [liveAgents, setLiveAgents] = useState<VoiceLiveAgent[]>(mockAgents);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create live agent
  const createAgent = async (agentData: CreateAgentData) => {
    setIsCreating(true);
    try {
      const newAgent: VoiceLiveAgent = {
        id: Date.now().toString(),
        ...agentData,
        department: agentData.department || '',
        skills: agentData.skills || [],
        max_concurrent_calls: agentData.max_concurrent_calls || 3,
        status: 'offline',
        current_calls: 0,
        avg_response_time: 0,
        total_calls_handled: 0,
        rating: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setLiveAgents(prev => [...prev, newAgent]);
      showSuccess('Live agent created successfully');
    } catch (error) {
      console.error('Error creating live agent:', error);
      showError('Failed to create live agent');
    } finally {
      setIsCreating(false);
    }
  };

  // Update live agent
  const updateAgent = async ({ id, updates }: { id: string; updates: UpdateAgentData }) => {
    setIsUpdating(true);
    try {
      setLiveAgents(prev => prev.map(agent => 
        agent.id === id 
          ? { ...agent, ...updates, updated_at: new Date().toISOString() }
          : agent
      ));
      showSuccess('Live agent updated successfully');
    } catch (error) {
      console.error('Error updating live agent:', error);
      showError('Failed to update live agent');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete live agent
  const deleteAgent = async (id: string) => {
    setIsDeleting(true);
    try {
      setLiveAgents(prev => prev.filter(agent => agent.id !== id));
      showSuccess('Live agent deleted successfully');
    } catch (error) {
      console.error('Error deleting live agent:', error);
      showError('Failed to delete live agent');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    liveAgents,
    isLoading,
    error: null,
    createAgent,
    updateAgent,
    deleteAgent,
    isCreating,
    isUpdating,
    isDeleting,
  };
};