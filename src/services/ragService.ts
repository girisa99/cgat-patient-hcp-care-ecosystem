import { supabase } from '@/integrations/supabase/client';

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  metadata: any;
  embedding?: number[];
  source: 'label_studio' | 'knowledge_base' | 'upload';
  created_at: string;
}

export interface RAGSearchResult {
  document: RAGDocument;
  similarity: number;
  relevantChunks: string[];
}

export class RAGService {
  private static instance: RAGService;

  static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  /**
   * Search for relevant documents using vector similarity
   */
  async searchRelevantDocuments(query: string, limit = 5): Promise<RAGSearchResult[]> {
    try {
      // Call edge function for RAG search
      const { data, error } = await supabase.functions.invoke('rag-search', {
        body: { query, limit }
      });

      if (error) throw error;
      return data.results || [];
    } catch (error) {
      console.error('RAG search error:', error);
      return [];
    }
  }

  /**
   * Enhance prompt with RAG context - with improved Label Studio fallback
   */
  async enhancePromptWithRAG(prompt: string, enabledFeatures: string[]): Promise<{
    enhancedPrompt: string;
    contextSources: string[];
    hasContext: boolean;
  }> {
    let enhancedPrompt = prompt;
    let contextSources: string[] = [];
    let hasContext = false;

    try {
      // Search for relevant documents
      const searchResults = await this.searchRelevantDocuments(prompt);
      
      if (searchResults.length > 0) {
        const contextChunks = searchResults
          .filter(result => result.similarity > 0.7) // Only high-relevance results
          .map(result => result.relevantChunks.join(' '))
          .join('\n\n');

        if (contextChunks.trim()) {
          enhancedPrompt = `Context from knowledge base:
${contextChunks}

User question: ${prompt}`;

          contextSources = searchResults.map(r => r.document.title);
          hasContext = true;
        }
      }

      // Add Label Studio annotations if available
      if (enabledFeatures.includes('label_studio')) {
        try {
          const annotations = await this.getLabelStudioAnnotations(prompt);
          if (annotations.length > 0) {
            enhancedPrompt += `\n\nRelevant annotations:\n${annotations.join('\n')}`;
            contextSources.push('Label Studio Annotations');
            hasContext = true;
          } else {
            console.log('Label Studio: No relevant annotations found for query, proceeding with LLM generation');
          }
        } catch (labelStudioError) {
          console.warn('Label Studio unavailable, proceeding with LLM generation:', labelStudioError);
          // Don't throw error - just continue without Label Studio data
        }
      }

      // If no context is found, add helpful instruction to LLM
      if (!hasContext) {
        enhancedPrompt = `${prompt}

Note: No specific context found in knowledge base. Please provide a helpful response based on your training data.`;
      }

    } catch (error) {
      console.error('Error enhancing prompt with RAG, proceeding with original prompt:', error);
      // Ensure we always return a valid prompt even if RAG fails
      enhancedPrompt = `${prompt}

Note: Knowledge base temporarily unavailable. Responding based on training data.`;
    }

    return {
      enhancedPrompt,
      contextSources,
      hasContext
    };
  }

  /**
   * Get relevant Label Studio annotations
   */
  async getLabelStudioAnnotations(query: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('label-studio-search', {
        body: { query }
      });

      if (error) throw error;
      return data.annotations || [];
    } catch (error) {
      console.error('Label Studio search error:', error);
      return [];
    }
  }

  /**
   * Add document to knowledge base
   */
  async addDocument(document: Omit<RAGDocument, 'id' | 'created_at'>): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('rag-ingest', {
        body: { document }
      });

      if (error) throw error;
      return data.documentId;
    } catch (error) {
      console.error('Document ingestion error:', error);
      throw error;
    }
  }

  /**
   * Check if RAG is available and configured
   */
  async checkRAGStatus(): Promise<{
    available: boolean;
    documentsCount: number;
    labelStudioConnected: boolean;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('rag-status');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('RAG status check error:', error);
      return {
        available: false,
        documentsCount: 0,
        labelStudioConnected: false
      };
    }
  }
}

export const ragService = RAGService.getInstance();