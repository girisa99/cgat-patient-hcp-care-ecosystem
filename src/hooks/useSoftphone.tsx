import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';
import { voiceProviderManager } from '@/utils/voice-provider-factory';

export type CallStatus = 'idle' | 'dialing' | 'ringing' | 'connected' | 'ended' | 'failed';

interface CallSession {
  id: string;
  phone_number: string;
  status: CallStatus;
  direction: 'inbound' | 'outbound';
  duration?: number;
  provider_id?: string;
  agent_id?: string;
  metadata?: any;
}

interface PhoneNumber {
  id: string;
  phone_number: string;
  assigned_to_type: 'agent' | 'brand';
  assigned_to_id: string;
  provider_id: string;
  is_active: boolean;
}

export const useSoftphone = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();
  
  // Call state
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const durationInterval = useRef<NodeJS.Timeout>();

  // Audio elements
  const audioElement = useRef<HTMLAudioElement>();

  // Fetch phone numbers
  const { data: phoneNumbers = [], isLoading: numbersLoading } = useQuery({
    queryKey: ['phone-numbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as PhoneNumber[];
    }
  });

  // Fetch call sessions
  const { data: callSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['call-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('call_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as CallSession[];
    }
  });

  // Start call timer
  const startCallTimer = useCallback(() => {
    setCallDuration(0);
    durationInterval.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  // Stop call timer
  const stopCallTimer = useCallback(() => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = undefined;
    }
  }, []);

  // Make outbound call
  const makeCall = useMutation({
    mutationFn: async ({ phoneNumber, providerId, agentId }: { 
      phoneNumber: string; 
      providerId?: string; 
      agentId?: string;
    }) => {
      // Create call session record
      const { data: session, error } = await supabase
        .from('call_sessions')
        .insert({
          phone_number: phoneNumber,
          direction: 'outbound',
          status: 'dialing',
          provider_id: providerId,
          agent_id: agentId,
          metadata: {
            initiated_at: new Date().toISOString(),
            channel: 'softphone'
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Initialize voice provider if specified
      if (providerId) {
        const adapter = voiceProviderManager.getAdapter(providerId);
        if (adapter) {
          const callSession = await adapter.makeCall(phoneNumber, { agentId });
          
          // Update session with provider details
          await supabase
            .from('call_sessions')
            .update({
              metadata: {
                ...session.metadata,
                provider_session_id: callSession.sessionId,
                provider_metadata: callSession.metadata
              }
            })
            .eq('id', session.id);
        }
      }

      return session;
    },
    onSuccess: (session) => {
      setCurrentCall(session);
      setCallStatus('dialing');
      setIsCallActive(true);
      
      // Simulate call progression
      setTimeout(() => {
        setCallStatus('ringing');
        setTimeout(() => {
          setCallStatus('connected');
          startCallTimer();
        }, 2000);
      }, 1000);

      queryClient.invalidateQueries({ queryKey: ['call-sessions'] });
      showSuccess(`Calling ${session.phone_number}...`);
    },
    onError: (error) => {
      console.error('Error making call:', error);
      showError('Failed to make call');
      setCallStatus('failed');
      setTimeout(() => {
        setCallStatus('idle');
        setIsCallActive(false);
      }, 3000);
    }
  });

  // End call
  const endCall = useMutation({
    mutationFn: async () => {
      if (!currentCall) return;

      // Update call session
      const { error } = await supabase
        .from('call_sessions')
        .update({
          status: 'ended',
          duration: callDuration,
          ended_at: new Date().toISOString(),
          metadata: {
            ...currentCall.metadata,
            ended_by: 'user',
            final_duration: callDuration
          }
        })
        .eq('id', currentCall.id);

      if (error) throw error;

      // End call with provider if applicable
      if (currentCall.provider_id) {
        const adapter = voiceProviderManager.getAdapter(currentCall.provider_id);
        if (adapter && currentCall.metadata?.provider_session_id) {
          await adapter.endCall(currentCall.metadata.provider_session_id);
        }
      }

      return currentCall;
    },
    onSuccess: () => {
      stopCallTimer();
      setCallStatus('ended');
      setIsCallActive(false);
      
      setTimeout(() => {
        setCallStatus('idle');
        setCurrentCall(null);
        setCallDuration(0);
      }, 2000);

      queryClient.invalidateQueries({ queryKey: ['call-sessions'] });
      showSuccess('Call ended');
    },
    onError: (error) => {
      console.error('Error ending call:', error);
      showError('Failed to end call');
    }
  });

  // Transfer call
  const transferCall = useMutation({
    mutationFn: async ({ destination }: { destination: string }) => {
      if (!currentCall || !currentCall.provider_id) {
        throw new Error('No active call or provider to transfer');
      }

      const adapter = voiceProviderManager.getAdapter(currentCall.provider_id);
      if (!adapter || !currentCall.metadata?.provider_session_id) {
        throw new Error('Provider adapter not available');
      }

      await adapter.transferCall(currentCall.metadata.provider_session_id, destination);

      // Update session record
      const { error } = await supabase
        .from('call_sessions')
        .update({
          metadata: {
            ...currentCall.metadata,
            transferred_to: destination,
            transferred_at: new Date().toISOString()
          }
        })
        .eq('id', currentCall.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-sessions'] });
      showSuccess('Call transferred successfully');
    },
    onError: (error) => {
      console.error('Error transferring call:', error);
      showError('Failed to transfer call');
    }
  });

  // Format call duration
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCallTimer();
    };
  }, [stopCallTimer]);

  return {
    // State
    currentCall,
    callStatus,
    isCallActive,
    callDuration,
    phoneNumbers,
    callSessions,
    isLoading: numbersLoading || sessionsLoading,
    
    // Actions
    makeCall: makeCall.mutate,
    endCall: endCall.mutate,
    transferCall: transferCall.mutate,
    
    // Loading states
    isMakingCall: makeCall.isPending,
    isEndingCall: endCall.isPending,
    isTransferring: transferCall.isPending,
    
    // Utilities
    formatDuration
  };
};