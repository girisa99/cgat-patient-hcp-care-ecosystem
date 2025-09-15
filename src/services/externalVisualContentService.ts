/**
 * EXTERNAL VISUAL CONTENT SERVICE
 * Integrates with scientific and medical visual content sources
 */
import { supabase } from '@/integrations/supabase/client';

export interface VisualContentSource {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  sourceType: 'youtube' | 'website' | 'infographic' | 'research_paper';
  sourceName: string;
  publishedDate?: string;
  tags: string[];
  relevanceScore: number;
}

export interface VisualSearchResult {
  sources: VisualContentSource[];
  query: string;
  totalFound: number;
}

export class ExternalVisualContentService {
  private static instance: ExternalVisualContentService;

  static getInstance(): ExternalVisualContentService {
    if (!ExternalVisualContentService.instance) {
      ExternalVisualContentService.instance = new ExternalVisualContentService();
    }
    return ExternalVisualContentService.instance;
  }

  /**
   * Search for visual content from external sources
   */
  async searchVisualContent(query: string, limit = 10): Promise<VisualSearchResult> {
    try {
      const { data, error } = await supabase.functions.invoke('visual-content-search', {
        body: { query, limit }
      });

      if (error) throw error;
      const sources = (data?.sources || [])
        .filter((s: VisualContentSource) => (s.relevanceScore ?? 0) >= 0.6)
        .sort((a: VisualContentSource, b: VisualContentSource) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
        .slice(0, limit);
      return { sources, query, totalFound: sources.length };
    } catch (error) {
      console.error('Visual content search error:', error);
      return {
        sources: [],
        query,
        totalFound: 0
      };
    }
  }

  /**
   * Get curated visual content by category
   */
  async getVisualContentByCategory(category: string): Promise<VisualContentSource[]> {
    try {
      const { data, error } = await supabase.functions.invoke('visual-content-search', {
        body: { category, limit: 20 }
      });

      if (error) throw error;
      return data.sources || [];
    } catch (error) {
      console.error('Category visual content error:', error);
      return [];
    }
  }

  /**
   * Get trending visual content from scientific sources
   */
  async getTrendingContent(timeframe = '7d'): Promise<VisualContentSource[]> {
    try {
      const { data, error } = await supabase.functions.invoke('visual-content-trending', {
        body: { timeframe }
      });

      if (error) throw error;
      return data.content || [];
    } catch (error) {
      console.error('Trending content error:', error);
      return [];
    }
  }

  /**
   * Enhanced RAG search that includes visual content
   */
  async enhancedRAGSearch(query: string): Promise<{
    textResults: any[];
    visualResults: VisualContentSource[];
    hasVisualContent: boolean;
  }> {
    try {
      // Parallel search for both text and visual content
      const [textData, visualData] = await Promise.all([
        supabase.functions.invoke('rag-search', { body: { query, limit: 5 } }),
        this.searchVisualContent(query, 8)
      ]);

      return {
        textResults: textData.data?.results || [],
        visualResults: visualData.sources || [],
        hasVisualContent: (visualData.sources || []).length > 0
      };
    } catch (error) {
      console.error('Enhanced RAG search error:', error);
      return {
        textResults: [],
        visualResults: [],
        hasVisualContent: false
      };
    }
  }
}

export const externalVisualContentService = ExternalVisualContentService.getInstance();