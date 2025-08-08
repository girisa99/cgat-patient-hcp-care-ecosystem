import { useState } from 'react';
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

// Mock data
const mockTransfers: TransferRequest[] = [];

export const useTransferQueue = () => {
  const { showSuccess, showError } = useMasterToast();
  const [transferQueue, setTransferQueue] = useState<TransferRequest[]>(mockTransfers);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Create transfer request
  const createTransfer = async (transferData: CreateTransferData) => {
    setIsCreating(true);
    try {
      const newTransfer: TransferRequest = {
        id: Date.now().toString(),
        ...transferData,
        priority: transferData.priority || 1,
        live_agent_id: null,
        status: 'waiting',
        created_at: new Date().toISOString(),
        assigned_at: null,
        completed_at: null,
      };

      setTransferQueue(prev => [...prev, newTransfer]);
      showSuccess('Transfer request created');
    } catch (error) {
      console.error('Error creating transfer:', error);
      showError('Failed to create transfer request');
    } finally {
      setIsCreating(false);
    }
  };

  // Assign transfer to agent
  const assignTransfer = async ({ id, agentId }: { id: string; agentId: string }) => {
    setIsAssigning(true);
    try {
      setTransferQueue(prev => prev.map(transfer => 
        transfer.id === id 
          ? { 
              ...transfer, 
              live_agent_id: agentId,
              status: 'assigned',
              assigned_at: new Date().toISOString()
            }
          : transfer
      ));
      showSuccess('Transfer assigned successfully');
    } catch (error) {
      console.error('Error assigning transfer:', error);
      showError('Failed to assign transfer');
    } finally {
      setIsAssigning(false);
    }
  };

  // Complete transfer
  const completeTransfer = async (id: string) => {
    setIsCompleting(true);
    try {
      setTransferQueue(prev => prev.map(transfer => 
        transfer.id === id 
          ? { 
              ...transfer, 
              status: 'completed',
              completed_at: new Date().toISOString()
            }
          : transfer
      ));
      showSuccess('Transfer completed');
    } catch (error) {
      console.error('Error completing transfer:', error);
      showError('Failed to complete transfer');
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    transferQueue,
    isLoading,
    createTransfer,
    assignTransfer,
    completeTransfer,
    isCreating,
    isAssigning,
    isCompleting,
  };
};