import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useMasterToast } from './useMasterToast';

type TransferRequest = Database['public']['Tables']['voice_transfer_queue']['Row'];
type CreateTransferData = Pick<Database['public']['Tables']['voice_transfer_queue']['Insert'], 'agent_id' | 'customer_info' | 'priority'>;

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
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('voice_transfer_queue')
        .insert([{
          ...transferData,
          priority: transferData.priority || 1,
          status: 'waiting',
          requested_by: user.user?.id || ''
        }])
        .select()
        .maybeSingle();
      
      if (error || !data) throw (error || new Error('Failed to create transfer'));

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
        .maybeSingle();
      
      if (error || !data) throw (error || new Error('Failed to assign transfer'));

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
        .maybeSingle();
      
      if (error || !data) throw (error || new Error('Failed to complete transfer'));

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