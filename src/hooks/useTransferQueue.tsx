import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface TransferRequest {
  id: string;
  agent_id: string;
  live_agent_id: string | null;
  customer_info: any;
  priority: number;
  status: 'waiting' | 'assigned' | 'completed' | 'cancelled';
  created_at: string;
  assigned_at: string | null;
  completed_at: string | null;
}

interface CreateTransferData {
  agent_id: string;
  customer_info: any;
  priority?: number;
}

export const useTransferQueue = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch transfer queue
  const { data: transferQueue = [], isLoading, error } = useQuery({
    queryKey: ['voice-transfer-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voice_transfer_queue')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as TransferRequest[];
    }
  });

  // Create transfer request
  const createTransfer = useMutation({
    mutationFn: async (transferData: CreateTransferData) => {
      const { data, error } = await supabase
        .from('voice_transfer_queue')
        .insert([{
          ...transferData,
          priority: transferData.priority || 1,
          status: 'waiting'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-transfer-queue'] });
      showSuccess('Transfer request created');
    },
    onError: (error) => {
      console.error('Error creating transfer:', error);
      showError('Failed to create transfer request');
    },
  });

  // Assign transfer to agent
  const assignTransfer = useMutation({
    mutationFn: async ({ id, agentId }: { id: string; agentId: string }) => {
      const { data, error } = await supabase
        .from('voice_transfer_queue')
        .update({ 
          live_agent_id: agentId,
          status: 'assigned',
          assigned_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-transfer-queue'] });
      showSuccess('Transfer assigned successfully');
    },
    onError: (error) => {
      console.error('Error assigning transfer:', error);
      showError('Failed to assign transfer');
    },
  });

  // Complete transfer
  const completeTransfer = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('voice_transfer_queue')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-transfer-queue'] });
      showSuccess('Transfer completed');
    },
    onError: (error) => {
      console.error('Error completing transfer:', error);
      showError('Failed to complete transfer');
    },
  });

  return {
    transferQueue,
    isLoading,
    error,
    createTransfer: createTransfer.mutate,
    assignTransfer: assignTransfer.mutate,
    completeTransfer: completeTransfer.mutate,
    isCreating: createTransfer.isPending,
    isAssigning: assignTransfer.isPending,
    isCompleting: completeTransfer.isPending,
  };
};