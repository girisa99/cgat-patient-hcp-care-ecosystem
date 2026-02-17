/**
 * SEO Optimization Service - P3 Cross-Functional
 * 
 * AI-powered SEO optimization for content across all products.
 * Generates titles, descriptions, tags, and thumbnails optimized for search.
 * 
 * Phase: P3 Week 13-14
 * Priority: Cross-Functional (All Products)
 */

import { supabase } from '@/integrations/supabase/client';

export interface SEOAnalysis {
  score: number;
  title_score: number;
  description_score: number;
  tags_score: number;
  thumbnail_score: number;
  recommendations: SEORecommendation[];
  competitors?: CompetitorAnalysis[];
}

export interface SEORecommendation {
  type: 'title' | 'description' | 'tags' | 'thumbnail' | 'timing' | 'engagement';
  priority: 'high' | 'medium' | 'low';
  current_value?: string;
  suggested_value: string;
  impact_description: string;
  estimated_improvement: number;
}

export interface CompetitorAnalysis {
  content_id: string;
  title: string;
  channel: string;
  views: number;
  engagement_rate: number;
  keywords: string[];
}

export interface OptimizedContent {
  original_title: string;
  optimized_title: string;
  original_description?: string;
  optimized_description: string;
  original_tags?: string[];
  optimized_tags: string[];
  thumbnail_suggestions: ThumbnailSuggestion[];
  seo_score: number;
}

export interface ThumbnailSuggestion {
  type: 'text_overlay' | 'face_focus' | 'contrast' | 'emoji' | 'number';
  description: string;
  example?: string;
}

export interface TrendingKeyword {
  keyword: string;
  search_volume: number;
  competition: 'low' | 'medium' | 'high';
  trending_score: number;
  related_keywords: string[];
}

class SEOOptimizationService {
  private static instance: SEOOptimizationService;

  private constructor() {}

  static getInstance(): SEOOptimizationService {
    if (!SEOOptimizationService.instance) {
      SEOOptimizationService.instance = new SEOOptimizationService();
    }
    return SEOOptimizationService.instance;
  }

  /**
   * Analyze content for SEO
   */
  async analyzeContent(
    title: string,
    description?: string,
    tags?: string[],
    platform: 'youtube' | 'tiktok' | 'instagram' | 'general' = 'general'
  ): Promise<SEOAnalysis> {
    // Calculate scores based on best practices
    const titleScore = this.calculateTitleScore(title, platform);
    const descriptionScore = this.calculateDescriptionScore(description || '', platform);
    const tagsScore = this.calculateTagsScore(tags || [], platform);
    
    const recommendations = this.generateRecommendations(title, description, tags, platform);

    return {
      score: Math.round((titleScore + descriptionScore + tagsScore) / 3),
      title_score: titleScore,
      description_score: descriptionScore,
      tags_score: tagsScore,
      thumbnail_score: 70, // Default since we don't have thumbnail analysis
      recommendations,
    };
  }

  /**
   * Optimize content with AI
   */
  async optimizeContent(
    title: string,
    description?: string,
    tags?: string[],
    platform: 'youtube' | 'tiktok' | 'instagram' | 'general' = 'general'
  ): Promise<OptimizedContent> {
    // Apply optimization rules
    const optimizedTitle = this.optimizeTitle(title, platform);
    const optimizedDescription = this.optimizeDescription(description || '', platform);
    const optimizedTags = this.optimizeTags(tags || [], title, platform);

    const analysis = await this.analyzeContent(optimizedTitle, optimizedDescription, optimizedTags, platform);

    return {
      original_title: title,
      optimized_title: optimizedTitle,
      original_description: description,
      optimized_description: optimizedDescription,
      original_tags: tags,
      optimized_tags: optimizedTags,
      thumbnail_suggestions: this.getThumbnailSuggestions(title),
      seo_score: analysis.score,
    };
  }

  /**
   * Get trending keywords for a niche
   */
  async getTrendingKeywords(
    niche: string,
    platform: 'youtube' | 'tiktok' | 'instagram' | 'general' = 'general',
    limit: number = 10
  ): Promise<TrendingKeyword[]> {
    // Would integrate with trends API
    const genericTrends: TrendingKeyword[] = [
      { keyword: `${niche} tutorial`, search_volume: 10000, competition: 'medium', trending_score: 0.8, related_keywords: [`${niche} tips`, `how to ${niche}`] },
      { keyword: `${niche} 2025`, search_volume: 8000, competition: 'low', trending_score: 0.9, related_keywords: [`best ${niche}`, `${niche} trends`] },
      { keyword: `${niche} for beginners`, search_volume: 12000, competition: 'high', trending_score: 0.7, related_keywords: [`learn ${niche}`, `${niche} basics`] },
    ];

    return genericTrends.slice(0, limit);
  }

  /**
   * Generate title variations
   */
  async generateTitleVariations(
    topic: string,
    style: 'clickbait' | 'informative' | 'question' | 'list' = 'informative',
    count: number = 5
  ): Promise<string[]> {
    const templates: Record<string, string[]> = {
      clickbait: [
        `You Won't Believe ${topic}!`,
        `${topic} - This Changed Everything`,
        `The SECRET to ${topic} They Don't Want You to Know`,
      ],
      informative: [
        `Complete Guide to ${topic}`,
        `${topic}: Everything You Need to Know`,
        `How to Master ${topic} in 2025`,
      ],
      question: [
        `What is ${topic}? Explained Simply`,
        `Why is ${topic} So Important?`,
        `How Does ${topic} Actually Work?`,
      ],
      list: [
        `10 Best ${topic} Tips for Success`,
        `Top 5 ${topic} Mistakes to Avoid`,
        `7 Ways to Improve Your ${topic}`,
      ],
    };

    return (templates[style] || templates.informative).slice(0, count);
  }

  /**
   * Analyze competitor content
   */
  async analyzeCompetitors(
    keywords: string[],
    platform: 'youtube' | 'tiktok' | 'instagram' = 'youtube'
  ): Promise<CompetitorAnalysis[]> {
    // Would integrate with platform APIs
    return [];
  }

  // Private helper methods
  private calculateTitleScore(title: string, platform: string): number {
    let score = 50;
    
    // Length check
    if (title.length >= 30 && title.length <= 60) score += 20;
    else if (title.length >= 20 && title.length <= 70) score += 10;
    
    // Power words
    const powerWords = ['how', 'why', 'best', 'top', 'ultimate', 'guide', 'tips', 'secret'];
    if (powerWords.some(w => title.toLowerCase().includes(w))) score += 15;
    
    // Numbers
    if (/\d+/.test(title)) score += 10;
    
    // Caps (not all caps)
    if (title !== title.toUpperCase() && title !== title.toLowerCase()) score += 5;

    return Math.min(100, score);
  }

  private calculateDescriptionScore(description: string, platform: string): number {
    let score = 40;
    
    if (description.length >= 100) score += 20;
    if (description.length >= 200) score += 15;
    if (description.includes('#')) score += 10;
    if (/https?:\/\//.test(description)) score += 10;
    if (description.split('\n').length >= 3) score += 5;

    return Math.min(100, score);
  }

  private calculateTagsScore(tags: string[], platform: string): number {
    let score = 30;
    
    if (tags.length >= 5) score += 20;
    if (tags.length >= 10) score += 15;
    if (tags.some(t => t.length > 10)) score += 10;
    if (tags.some(t => t.includes(' '))) score += 10; // Long-tail keywords
    if (new Set(tags).size === tags.length) score += 15; // No duplicates

    return Math.min(100, score);
  }

  private generateRecommendations(
    title: string,
    description?: string,
    tags?: string[],
    platform?: string
  ): SEORecommendation[] {
    const recommendations: SEORecommendation[] = [];

    // Title recommendations
    if (title.length < 30) {
      recommendations.push({
        type: 'title',
        priority: 'high',
        current_value: title,
        suggested_value: `${title} - Complete Guide`,
        impact_description: 'Longer titles perform better in search',
        estimated_improvement: 15,
      });
    }

    // Description recommendations
    if (!description || description.length < 100) {
      recommendations.push({
        type: 'description',
        priority: 'high',
        suggested_value: 'Add a detailed description with keywords, timestamps, and calls to action',
        impact_description: 'Detailed descriptions improve discoverability',
        estimated_improvement: 20,
      });
    }

    // Tags recommendations
    if (!tags || tags.length < 5) {
      recommendations.push({
        type: 'tags',
        priority: 'medium',
        suggested_value: 'Add at least 10 relevant tags including long-tail keywords',
        impact_description: 'More tags help with search rankings',
        estimated_improvement: 10,
      });
    }

    return recommendations;
  }

  private optimizeTitle(title: string, platform: string): string {
    let optimized = title;
    
    // Ensure proper capitalization
    optimized = optimized.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    
    // Add year if not present
    if (!/20\d{2}/.test(optimized) && optimized.length < 50) {
      optimized += ' (2025)';
    }

    return optimized;
  }

  private optimizeDescription(description: string, platform: string): string {
    if (!description) {
      return 'Check out this amazing content! Don\'t forget to like, subscribe, and share.\n\n📌 Timestamps:\n00:00 - Intro\n\n🔗 Links:\n\n#content #viral #trending';
    }
    
    let optimized = description;
    
    // Add call to action if missing
    if (!optimized.toLowerCase().includes('subscribe') && !optimized.toLowerCase().includes('follow')) {
      optimized += '\n\n👉 Subscribe for more content!';
    }

    return optimized;
  }

  private optimizeTags(tags: string[], title: string, platform: string): string[] {
    const optimized = [...tags];
    
    // Extract keywords from title
    const titleWords = title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(w => w.length > 3);
    
    // Add title keywords as tags
    titleWords.forEach(word => {
      if (!optimized.some(t => t.toLowerCase() === word)) {
        optimized.push(word);
      }
    });
    
    // Add trending generic tags
    const trendingTags = ['trending', 'viral', '2025', 'shorts', 'fyp'];
    trendingTags.forEach(tag => {
      if (!optimized.some(t => t.toLowerCase() === tag)) {
        optimized.push(tag);
      }
    });

    return optimized.slice(0, 30); // Most platforms limit to 30 tags
  }

  private getThumbnailSuggestions(title: string): ThumbnailSuggestion[] {
    return [
      { type: 'text_overlay', description: 'Add bold, readable text with 3-4 words max', example: title.split(' ').slice(0, 3).join(' ').toUpperCase() },
      { type: 'face_focus', description: 'Use a close-up face with exaggerated expression' },
      { type: 'contrast', description: 'Use high contrast colors - yellow/black or red/white work best' },
      { type: 'number', description: 'Include a number if your content is a list or tutorial' },
      { type: 'emoji', description: 'Add relevant emoji to catch attention and convey emotion' },
    ];
  }
}

export const seoOptimizationService = SEOOptimizationService.getInstance();
