import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';
import { voiceProviderManager } from '@/utils/voice-provider-factory';

export type CallStatus = 'idle' | 'dialing' | 'ringing' | 'connected' | 'ended' | 'failed';

interface CallSession {
  id: string;
  caller_number: string;
  callee_number: string;
  call_status: string;
  call_direction: 'inbound' | 'outbound';
  call_duration?: number;
  voice_provider_id?: string;
  agent_id?: string;
  metadata?: any;
  created_at: string;
  session_id?: string;
  end_time?: string;
  
  // Helper properties for compatibility
  phone_number?: string;
  status?: CallStatus;
  direction?: 'inbound' | 'outbound';
  duration?: number;
  provider_id?: string;
  
  // Index signature for DataTable compatibility
  [key: string]: any;
}

interface PhoneNumber {
  id: string;
  phone_number: string;
  assigned_to_agent_id: string | null;
  assigned_to_brand: string | null;
  provider_type: string;
  is_active: boolean;
  created_at: string;
  
  // Helper properties for compatibility
  assigned_to_type?: 'agent' | 'brand';
  assigned_to_id?: string;
  provider_id?: string;
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
      return data.map((item): PhoneNumber => ({
        ...item,
        assigned_to_type: item.assigned_to_agent_id ? 'agent' : 'brand',
        assigned_to_id: item.assigned_to_agent_id || item.assigned_to_brand || '',
        provider_id: item.provider_type
      }));
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
      return data.map((item): CallSession => ({
        ...item,
        call_direction: item.call_direction as 'inbound' | 'outbound',
        phone_number: item.callee_number || item.caller_number,
        status: (item.call_status as CallStatus) || 'idle',
        direction: item.call_direction as 'inbound' | 'outbound',
        duration: (item as any).call_duration || 0,
        provider_id: item.voice_provider_id,
        session_id: item.session_id || item.id
      }));
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
          callee_number: phoneNumber,
          caller_number: 'softphone',
          call_direction: 'outbound',
          call_status: 'dialing',
          voice_provider_id: providerId,
          agent_id: agentId,
          session_id: `session_${Date.now()}`,
          metadata: {
            initiated_at: new Date().toISOString(),
            channel: 'softphone'
          }
        })
        .select()
        .maybeSingle();

       if (error || !session) throw (error || new Error('Failed to create call session'));


      // Initialize voice provider if specified
      if (providerId) {
        try {
          const adapter = voiceProviderManager.getAdapter(providerId);
          if (adapter && typeof adapter.makeCall === 'function') {
            const providerCallSession = await adapter.makeCall(phoneNumber, { agentId });
            
            // Update session with provider details if available
            if (providerCallSession && typeof providerCallSession === 'object') {
              await supabase
                .from('call_sessions')
                .update({
                  metadata: {
                    ...(typeof session.metadata === 'object' && session.metadata !== null ? session.metadata : {}),
                    provider_session_id: (providerCallSession as any).sessionId || session.id,
                    provider_metadata: (providerCallSession as any).metadata || {}
                  }
                })
                .eq('id', session.id);
            }
          }
        } catch (providerError) {
          console.warn('Voice provider initialization failed:', providerError);
          // Continue without provider - this is non-blocking
        }
      }

      return session;
    },
    onSuccess: (session) => {
      const callSession: CallSession = {
        id: session.id,
        caller_number: session.caller_number,
        callee_number: session.callee_number,
        call_status: session.call_status,
        call_direction: 'outbound' as 'inbound' | 'outbound',
        voice_provider_id: session.voice_provider_id,
        agent_id: session.agent_id,
        metadata: session.metadata,
        created_at: session.created_at,
        session_id: session.session_id,
        phone_number: session.callee_number,
        status: 'dialing' as CallStatus,
        direction: 'outbound' as 'inbound' | 'outbound',
        duration: 0,
        provider_id: session.voice_provider_id
      };
      setCurrentCall(callSession);
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
      showSuccess(`Calling ${session.callee_number}...`);
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
          call_status: 'ended',
          call_duration: callDuration,
          end_time: new Date().toISOString(),
          metadata: {
            ...currentCall.metadata,
            ended_by: 'user',
            final_duration: callDuration
          }
        })
        .eq('id', currentCall.id);

      if (error) throw error;

      // End call with provider if applicable
      if (currentCall.provider_id || currentCall.voice_provider_id) {
        const providerId = currentCall.provider_id || currentCall.voice_provider_id;
        const adapter = voiceProviderManager.getAdapter(providerId);
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
      const providerId = currentCall?.provider_id || currentCall?.voice_provider_id;
      if (!currentCall || !providerId) {
        throw new Error('No active call or provider to transfer');
      }

      const adapter = voiceProviderManager.getAdapter(providerId);
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