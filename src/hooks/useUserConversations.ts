import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

interface UserConversationData {
  id?: string;
  user_id?: string;
  first_name: string;
  email: string;
  conversation_context?: any;
  rag_context?: any;
  knowledge_contributions?: any[];
  created_at?: string;
  updated_at?: string;
}

interface KnowledgeContribution {
  id?: string;
  user_id?: string;
  conversation_id?: string;
  contribution_type: string;
  content_summary?: string;
  context_sources?: string[];
  rag_enhancement_data?: any;
  relevance_score?: number;
  created_at?: string;
}

export const useUserConversations = () => {
  const [userConversation, setUserConversation] = useState<UserConversationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useMasterToast();

  // Create or update user conversation data
  const saveUserConversation = useCallback(async (userData: UserConversationData) => {
    if (!userData.first_name || !userData.email) {
      showError('Missing required information', 'First name and email are required');
      return false;
    }

    try {
      setIsLoading(true);

      const userAuth = await supabase.auth.getUser();
      if (!userAuth.data.user) throw new Error('User not authenticated');

      const { data: existingData, error: checkError } = await supabase
        .from('user_conversations')
        .select('*')
        .eq('user_id', userAuth.data.user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let result;
      if (existingData) {
        // Update existing record
        const { data, error } = await supabase
          .from('user_conversations')
          .update({
            first_name: userData.first_name,
            email: userData.email,
            conversation_context: userData.conversation_context || existingData.conversation_context,
            rag_context: userData.rag_context || existingData.rag_context,
            knowledge_contributions: userData.knowledge_contributions || existingData.knowledge_contributions
          })
          .eq('id', existingData.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('user_conversations')
          .insert({
            user_id: userAuth.data.user.id,
            first_name: userData.first_name,
            email: userData.email,
            conversation_context: userData.conversation_context || {},
            rag_context: userData.rag_context || {},
            knowledge_contributions: userData.knowledge_contributions || []
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      setUserConversation(result as UserConversationData);
      showSuccess('Profile saved', 'Your conversation profile has been updated');
      return true;
    } catch (error: any) {
      console.error('Error saving user conversation:', error);
      showError('Failed to save profile', error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError]);

  // Add knowledge contribution
  const addKnowledgeContribution = useCallback(async (contribution: Omit<KnowledgeContribution, 'id' | 'user_id'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('knowledge_base_contributions')
        .insert({
          user_id: user.user.id,
          conversation_id: userConversation?.id,
          contribution_type: contribution.contribution_type,
          content_summary: contribution.content_summary,
          context_sources: contribution.context_sources || [],
          rag_enhancement_data: contribution.rag_enhancement_data || {},
          relevance_score: contribution.relevance_score || 0.0
        })
        .select()
        .single();

      if (error) throw error;

      // Update user conversation with new contribution
      if (userConversation) {
        const updatedContributions = [...((userConversation.knowledge_contributions as any[]) || []), data];
        const updated = await supabase
          .from('user_conversations')
          .update({ 
            knowledge_contributions: updatedContributions,
            rag_context: {
              ...(userConversation.rag_context as any || {}),
              last_contribution: new Date().toISOString(),
              total_contributions: updatedContributions.length
            }
          })
          .eq('id', userConversation.id)
          .select()
          .single();

        if (updated.data) {
          setUserConversation(updated.data as UserConversationData);
        }
      }

      return data;
    } catch (error: any) {
      console.error('Error adding knowledge contribution:', error);
      showError('Failed to add contribution', error.message);
      return null;
    }
  }, [userConversation, showError]);

  // Load user conversation data
  const loadUserConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('user_conversations')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUserConversation(data as UserConversationData);
      }
    } catch (error: any) {
      console.error('Error loading user conversation:', error);
      // Don't show error for missing records, that's normal
      if (error.code !== 'PGRST116') {
        showError('Failed to load profile', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  // Get user's knowledge contributions
  const getUserContributions = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('knowledge_base_contributions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error loading contributions:', error);
      return [];
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    loadUserConversation();
  }, [loadUserConversation]);

  return {
    userConversation,
    isLoading,
    saveUserConversation,
    addKnowledgeContribution,
    loadUserConversation,
    getUserContributions
  };
};