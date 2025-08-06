import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  agent_id: string;
  user_id?: string;
  session_id: string;
  title?: string;
  status: 'active' | 'completed' | 'transferred' | 'failed';
  conversation_data: any[];
  metadata?: Record<string, any>;
  healthcare_context?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface ConversationMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const useAgentConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations
  const fetchConversations = async (agentId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('agent_conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setConversations((data || []) as Conversation[]);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Create new conversation
  const createConversation = async (
    agentId: string,
    sessionId: string,
    title?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const { data, error: createError } = await supabase
        .from('agent_conversations')
        .insert({
          agent_id: agentId,
          session_id: sessionId,
          title: title || `Conversation ${new Date().toLocaleString()}`,
          status: 'active',
          conversation_data: [],
          metadata: metadata || {},
          healthcare_context: {},
        })
        .select()
        .single();

      if (createError) throw createError;

      await fetchConversations();
      
      toast({
        title: "Conversation Created",
        description: "New conversation session started",
      });

      return data as Conversation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create conversation';
      setError(errorMessage);
      toast({
        title: "Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Send message in conversation
  const sendMessage = async (
    conversationId: string,
    message: ConversationMessage
  ) => {
    try {
      // Get current conversation
      const { data: conversation, error: fetchError } = await supabase
        .from('agent_conversations')
        .select('conversation_data')
        .eq('id', conversationId)
        .single();

      if (fetchError) throw fetchError;

      // Add new message to conversation data
      const existingData = Array.isArray(conversation.conversation_data) ? conversation.conversation_data : [];
      const messageAsJson = JSON.parse(JSON.stringify(message)); // Convert to JSON-compatible format
      const updatedData = [...existingData, messageAsJson];

      const { error: updateError } = await supabase
        .from('agent_conversations')
        .update({
          conversation_data: updatedData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      if (updateError) throw updateError;

      await fetchConversations();
      
      return message;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      throw err;
    }
  };

  // Update conversation status
  const updateConversationStatus = async (
    conversationId: string,
    status: Conversation['status'],
    metadata?: Record<string, any>
  ) => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (metadata) {
        updateData.metadata = metadata;
      }

      const { error: updateError } = await supabase
        .from('agent_conversations')
        .update(updateData)
        .eq('id', conversationId);

      if (updateError) throw updateError;

      await fetchConversations();
      
      toast({
        title: "Status Updated",
        description: `Conversation status updated to ${status}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Transfer conversation to live agent
  const transferToLiveAgent = async (
    conversationId: string,
    transferReason?: string,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ) => {
    try {
      // Update conversation status to transferred
      await updateConversationStatus(conversationId, 'transferred', {
        transfer_reason: transferReason,
        transfer_priority: priority,
        transferred_at: new Date().toISOString(),
      });

      // Add system message about transfer
      const transferMessage: ConversationMessage = {
        id: `msg_${Date.now()}`,
        type: 'system',
        content: `Conversation transferred to live agent. Reason: ${transferReason || 'User request'}`,
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'transfer',
          priority,
          reason: transferReason,
        },
      };

      await sendMessage(conversationId, transferMessage);

      toast({
        title: "Transfer Successful",
        description: "Conversation transferred to live agent queue",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to transfer conversation';
      setError(errorMessage);
      toast({
        title: "Transfer Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Get conversation by ID
  const getConversation = (conversationId: string): Conversation | undefined => {
    return conversations.find(conv => conv.id === conversationId);
  };

  // Get conversations by agent
  const getConversationsByAgent = (agentId: string): Conversation[] => {
    return conversations.filter(conv => conv.agent_id === agentId);
  };

  // Get conversations by status
  const getConversationsByStatus = (status: Conversation['status']): Conversation[] => {
    return conversations.filter(conv => conv.status === status);
  };

  useEffect(() => {
    fetchConversations();

    // Set up real-time subscription
    const subscription = supabase
      .channel('agent_conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return {
    conversations,
    loading,
    error,
    createConversation,
    sendMessage,
    updateConversationStatus,
    transferToLiveAgent,
    getConversation,
    getConversationsByAgent,
    getConversationsByStatus,
    refetch: fetchConversations,
  };
};