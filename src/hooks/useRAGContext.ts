/**
 * RAG CONTEXT HOOK
 * Manages Retrieval-Augmented Generation context and future conversation memory
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RAGContext {
  conversationHistory: string[];
  userPreferences: Record<string, any>;
  domainKnowledge: string[];
  futureContext: string[];
}

export const useRAGContext = () => {
  const [context, setContext] = useState<RAGContext>({
    conversationHistory: [],
    userPreferences: {},
    domainKnowledge: [],
    futureContext: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const enhanceWithRAG = useCallback(async (
    originalPrompt: string,
    userId?: string,
    conversationId?: string
  ): Promise<string> => {
    if (!userId) return originalPrompt;

    setIsLoading(true);
    try {
      // Get user's conversation history
      const { data: conversations } = await supabase
        .from('user_conversations')
        .select('conversation_context, rag_context')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get relevant knowledge base entries
      const { data: knowledgeEntries } = await supabase
        .from('knowledge_base_contributions')
        .select('content_summary, contribution_type')
        .eq('user_id', userId)
        .limit(5);

      let enhancedPrompt = originalPrompt;
      
      // Add conversation context
      if (conversations && conversations.length > 0) {
        const recentContext = conversations
          .map(conv => JSON.stringify(conv.conversation_context))
          .filter(Boolean)
          .slice(0, 5)
          .join('\n');
        
        enhancedPrompt = `Based on our previous conversations: ${recentContext}\n\nCurrent question: ${originalPrompt}`;
      }

      // Add domain knowledge
      if (knowledgeEntries && knowledgeEntries.length > 0) {
        const domainContext = knowledgeEntries
          .map(entry => `${entry.contribution_type}: ${entry.content_summary}`)
          .join('\n');
        
        enhancedPrompt = `Relevant context:\n${domainContext}\n\n${enhancedPrompt}`;
      }

      // Update local context
      setContext(prev => ({
        ...prev,
        conversationHistory: conversations?.map(c => JSON.stringify(c.conversation_context)).filter(Boolean) || [],
        domainKnowledge: knowledgeEntries?.map(k => k.content_summary).filter(Boolean) || []
      }));

      return enhancedPrompt;
    } catch (error) {
      console.error('Failed to enhance with RAG:', error);
      return originalPrompt;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addFutureContext = useCallback(async (
    contextItem: string,
    contextType: 'preference' | 'knowledge' | 'conversation',
    userId?: string
  ) => {
    if (!userId) return;

    try {
      if (contextType === 'knowledge') {
        await supabase
          .from('knowledge_base_contributions')
          .insert({
            user_id: userId,
            content_summary: contextItem,
            contribution_type: contextType,
            rag_enhancement_data: { source: 'future_context', timestamp: new Date().toISOString() }
          });
      }

      // Update local state
      setContext(prev => ({
        ...prev,
        futureContext: [...prev.futureContext, contextItem]
      }));
    } catch (error) {
      console.error('Failed to add future context:', error);
    }
  }, []);

  const clearContext = useCallback(() => {
    setContext({
      conversationHistory: [],
      userPreferences: {},
      domainKnowledge: [],
      futureContext: []
    });
  }, []);

  return {
    context,
    enhanceWithRAG,
    addFutureContext,
    clearContext,
    isLoading
  };
};

export default useRAGContext;