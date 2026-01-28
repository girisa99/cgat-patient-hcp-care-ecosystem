/**
 * SUPPORT CHAT HOOK
 * Manages Ask Genie support conversations with real AI
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGenieStudioAuth } from './useGenieStudioAuth';
import { useToast } from './use-toast';

export interface SupportMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isEscalation?: boolean;
}

interface SupportSession {
  id: string;
  status: 'active' | 'escalated' | 'resolved';
  escalationReason?: string;
}

export function useSupportChat() {
  const { genieUser, isAuthenticated } = useGenieStudioAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm Ask Genie, your AI support assistant. How can I help you today? I can answer questions about your account, features, subscriptions, or help troubleshoot issues.",
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<SupportSession | null>(null);
  const [escalationNeeded, setEscalationNeeded] = useState(false);

  // Create a new support session
  const createSession = useCallback(async () => {
    if (!isAuthenticated || session) return;
    
    try {
      const { data, error } = await supabase
        .from('genie_support_sessions')
        .insert({
          user_id: genieUser?.auth_user_id,
          status: 'active',
          user_tier: genieUser?.current_subscription_tier,
        })
        .select()
        .single();
      
      if (error) throw error;
      setSession({ id: data.id, status: 'active' });
    } catch (err) {
      console.error('Failed to create support session:', err);
    }
  }, [isAuthenticated, genieUser, session]);

  // Send message to Ask Genie
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage: SupportMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create session on first message if authenticated
      if (!session && isAuthenticated) {
        await createSession();
      }

      // Call edge function
      const { data, error } = await supabase.functions.invoke('ask-genie-support', {
        body: {
          message: content,
          sessionId: session?.id,
          userId: genieUser?.id,
          userTier: genieUser?.current_subscription_tier || 'free',
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) throw error;

      // Add AI response
      const aiMessage: SupportMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        isEscalation: data.escalationNeeded,
      };
      setMessages(prev => [...prev, aiMessage]);

      // Track escalation state
      if (data.escalationNeeded) {
        setEscalationNeeded(true);
      }

    } catch (err) {
      console.error('Support chat error:', err);
      
      // Fallback response
      const errorMessage: SupportMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again, or you can submit a support ticket for detailed assistance.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: 'Connection Issue',
        description: 'Unable to reach support AI. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, session, isAuthenticated, genieUser, messages, createSession, toast]);

  // Escalate to human support
  const escalateToHuman = useCallback(async (reason?: string) => {
    if (!session) {
      toast({
        title: 'Session Required',
        description: 'Please sign in and start a conversation first.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      // Update session status
      await supabase
        .from('genie_support_sessions')
        .update({
          status: 'escalated',
          escalation_requested: true,
          ended_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      setSession(prev => prev ? { ...prev, status: 'escalated', escalationReason: reason } : null);
      
      // Add system message
      const escalationMessage: SupportMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `✅ **Escalation Requested**\n\nI've flagged this conversation for human review. A support agent will reach out to you via email within your SLA timeframe based on your subscription tier.\n\nReason: ${reason || 'User requested human support'}`,
        timestamp: new Date(),
        isEscalation: true,
      };
      setMessages(prev => [...prev, escalationMessage]);

      toast({
        title: 'Escalation Submitted',
        description: 'A support agent will contact you soon.',
      });

      return session.id;
    } catch (err) {
      console.error('Escalation failed:', err);
      toast({
        title: 'Escalation Failed',
        description: 'Please try again or submit a ticket manually.',
        variant: 'destructive',
      });
      return null;
    }
  }, [session, toast]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm Ask Genie, your AI support assistant. How can I help you today?",
      timestamp: new Date(),
    }]);
    setSession(null);
    setEscalationNeeded(false);
  }, []);

  return {
    messages,
    isLoading,
    session,
    escalationNeeded,
    sendMessage,
    escalateToHuman,
    clearConversation,
  };
}
