/**
 * communityCollaborationService - Idea Marketplace & Regional Success Stories
 * 
 * Enables community-driven content collaboration:
 * - Share and remix ideas/templates
 * - Regional success stories for cross-pollination
 * - Credit rewards for contributions
 */

import { supabase } from '@/integrations/supabase/client';

// Types
export interface CommunityIdea {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  contentType: 'template' | 'concept' | 'campaign' | 'story';
  category: string;
  region: string | null;
  industry: string | null;
  contentData: Record<string, unknown>;
  thumbnailUrl: string | null;
  remixCount: number;
  likeCount: number;
  viewCount: number;
  creditReward: number;
  isFeatured: boolean;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  authorAvatar?: string;
}

export interface IdeaRemix {
  id: string;
  originalIdeaId: string;
  remixerUserId: string;
  remixContent: Record<string, unknown>;
  creditsAwarded: number;
  createdAt: string;
}

export interface RegionalSuccessStory {
  id: string;
  userId: string;
  title: string;
  storyContent: string;
  region: string;
  industry: string | null;
  metrics: {
    engagement?: number;
    reach?: number;
    conversions?: number;
    views?: number;
  };
  learnings: string[];
  applicableRegions: string[];
  platform: string | null;
  contentType: string | null;
  upvotes: number;
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  authorRegion?: string;
}

export interface IdeaFilters {
  category?: string;
  region?: string;
  industry?: string;
  contentType?: string;
  featured?: boolean;
  search?: string;
}

export interface StoryFilters {
  region?: string;
  industry?: string;
  platform?: string;
  featured?: boolean;
  verified?: boolean;
  search?: string;
}

export const IDEA_CATEGORIES = [
  'marketing',
  'social-media',
  'video-content',
  'presentations',
  'sales',
  'education',
  'healthcare',
  'finance',
  'technology',
  'lifestyle',
  'entertainment',
  'general',
] as const;

export const REGIONS = [
  { code: 'NA', name: 'North America' },
  { code: 'EU', name: 'Europe' },
  { code: 'MENA', name: 'Middle East & North Africa' },
  { code: 'SSA', name: 'Sub-Saharan Africa' },
  { code: 'SA', name: 'South Asia' },
  { code: 'SEA', name: 'Southeast Asia' },
  { code: 'EA', name: 'East Asia' },
  { code: 'LATAM', name: 'Latin America' },
  { code: 'ANZ', name: 'Australia & New Zealand' },
] as const;

class CommunityCollaborationService {
  private mapIdeaFromDb(data: Record<string, unknown>): CommunityIdea {
    const contentData = data.content_data;
    return {
      id: data.id as string,
      userId: data.user_id as string,
      title: data.title as string,
      description: data.description as string | null,
      contentType: data.content_type as 'template' | 'concept' | 'campaign' | 'story',
      category: data.category as string,
      region: data.region as string | null,
      industry: data.industry as string | null,
      contentData: (typeof contentData === 'object' && contentData !== null && !Array.isArray(contentData)) 
        ? contentData as Record<string, unknown> 
        : {},
      thumbnailUrl: data.thumbnail_url as string | null,
      remixCount: (data.remix_count as number) || 0,
      likeCount: (data.like_count as number) || 0,
      viewCount: (data.view_count as number) || 0,
      creditReward: (data.credit_reward as number) || 5,
      isFeatured: (data.is_featured as boolean) || false,
      isPublic: data.is_public !== false,
      tags: (data.tags as string[]) || [],
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  private mapStoryFromDb(data: Record<string, unknown>): RegionalSuccessStory {
    const metrics = data.metrics;
    return {
      id: data.id as string,
      userId: data.user_id as string,
      title: data.title as string,
      storyContent: data.story_content as string,
      region: data.region as string,
      industry: data.industry as string | null,
      metrics: (typeof metrics === 'object' && metrics !== null && !Array.isArray(metrics)) 
        ? metrics as { engagement?: number; reach?: number; conversions?: number; views?: number }
        : {},
      learnings: (data.learnings as string[]) || [],
      applicableRegions: (data.applicable_regions as string[]) || [],
      platform: data.platform as string | null,
      contentType: data.content_type as string | null,
      upvotes: (data.upvotes as number) || 0,
      isVerified: (data.is_verified as boolean) || false,
      isFeatured: (data.is_featured as boolean) || false,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  async getIdeas(filters: IdeaFilters = {}, limit = 20, offset = 0): Promise<CommunityIdea[]> {
    let query = supabase
      .from('community_ideas')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.category) query = query.eq('category', filters.category);
    if (filters.region) query = query.eq('region', filters.region);
    if (filters.industry) query = query.eq('industry', filters.industry);
    if (filters.contentType) query = query.eq('content_type', filters.contentType);
    if (filters.featured) query = query.eq('is_featured', true);
    if (filters.search) query = query.ilike('title', `%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((d) => this.mapIdeaFromDb(d as unknown as Record<string, unknown>));
  }

  async getFeaturedIdeas(limit = 6): Promise<CommunityIdea[]> {
    const { data, error } = await supabase
      .from('community_ideas')
      .select('*')
      .eq('is_public', true)
      .eq('is_featured', true)
      .order('remix_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((d) => this.mapIdeaFromDb(d as unknown as Record<string, unknown>));
  }

  async getIdeaById(id: string): Promise<CommunityIdea | null> {
    const { data, error } = await supabase
      .from('community_ideas')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    await supabase
      .from('community_ideas')
      .update({ view_count: ((data.view_count as number) || 0) + 1 })
      .eq('id', id);

    return this.mapIdeaFromDb(data as unknown as Record<string, unknown>);
  }

  async createIdea(idea: Omit<CommunityIdea, 'id' | 'createdAt' | 'updatedAt' | 'remixCount' | 'likeCount' | 'viewCount'>): Promise<CommunityIdea> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const insertData = {
      user_id: session.user.id,
      title: idea.title,
      description: idea.description,
      content_type: idea.contentType,
      category: idea.category,
      region: idea.region,
      industry: idea.industry,
      content_data: idea.contentData,
      thumbnail_url: idea.thumbnailUrl,
      credit_reward: idea.creditReward,
      is_featured: false,
      is_public: idea.isPublic,
      tags: idea.tags,
    };

    const { data, error } = await supabase
      .from('community_ideas')
      .insert(insertData as never)
      .select()
      .single();

    if (error) throw error;
    return this.mapIdeaFromDb(data as unknown as Record<string, unknown>);
  }

  async remixIdea(originalIdeaId: string, remixContent: Record<string, unknown>): Promise<IdeaRemix> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const remixData = {
      original_idea_id: originalIdeaId,
      remixer_user_id: session.user.id,
      remix_content: remixContent,
    };

    const { data, error } = await supabase
      .from('idea_remixes')
      .insert(remixData as never)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      originalIdeaId: data.original_idea_id,
      remixerUserId: data.remixer_user_id,
      remixContent: (typeof data.remix_content === 'object' && data.remix_content !== null) 
        ? data.remix_content as Record<string, unknown> 
        : {},
      creditsAwarded: data.credits_awarded,
      createdAt: data.created_at,
    };
  }

  async likeIdea(ideaId: string): Promise<void> {
    const { data, error } = await supabase
      .from('community_ideas')
      .select('like_count')
      .eq('id', ideaId)
      .single();

    if (error) throw error;

    await supabase
      .from('community_ideas')
      .update({ like_count: ((data?.like_count as number) || 0) + 1 })
      .eq('id', ideaId);
  }

  async getStories(filters: StoryFilters = {}, limit = 20, offset = 0): Promise<RegionalSuccessStory[]> {
    let query = supabase
      .from('regional_success_stories')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.region) query = query.eq('region', filters.region);
    if (filters.industry) query = query.eq('industry', filters.industry);
    if (filters.platform) query = query.eq('platform', filters.platform);
    if (filters.featured) query = query.eq('is_featured', true);
    if (filters.verified) query = query.eq('is_verified', true);
    if (filters.search) query = query.ilike('title', `%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((d) => this.mapStoryFromDb(d as unknown as Record<string, unknown>));
  }

  async getFeaturedStories(limit = 4): Promise<RegionalSuccessStory[]> {
    const { data, error } = await supabase
      .from('regional_success_stories')
      .select('*')
      .eq('is_featured', true)
      .order('upvotes', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((d) => this.mapStoryFromDb(d as unknown as Record<string, unknown>));
  }

  async getStoriesByRegion(region: string): Promise<RegionalSuccessStory[]> {
    const { data, error } = await supabase
      .from('regional_success_stories')
      .select('*')
      .eq('region', region)
      .order('upvotes', { ascending: false })
      .limit(10);

    if (error) throw error;
    return (data || []).map((d) => this.mapStoryFromDb(d as unknown as Record<string, unknown>));
  }

  async getStoriesApplicableToRegion(region: string): Promise<RegionalSuccessStory[]> {
    const { data, error } = await supabase
      .from('regional_success_stories')
      .select('*')
      .contains('applicable_regions', [region])
      .order('upvotes', { ascending: false })
      .limit(10);

    if (error) throw error;
    return (data || []).map((d) => this.mapStoryFromDb(d as unknown as Record<string, unknown>));
  }

  async createStory(story: Omit<RegionalSuccessStory, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'isVerified' | 'isFeatured'>): Promise<RegionalSuccessStory> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('regional_success_stories')
      .insert({
        user_id: session.user.id,
        title: story.title,
        story_content: story.storyContent,
        region: story.region,
        industry: story.industry,
        metrics: story.metrics,
        learnings: story.learnings,
        applicable_regions: story.applicableRegions,
        platform: story.platform,
        content_type: story.contentType,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapStoryFromDb(data as unknown as Record<string, unknown>);
  }

  async upvoteStory(storyId: string): Promise<void> {
    const { data, error } = await supabase
      .from('regional_success_stories')
      .select('upvotes')
      .eq('id', storyId)
      .single();

    if (error) throw error;

    await supabase
      .from('regional_success_stories')
      .update({ upvotes: ((data?.upvotes as number) || 0) + 1 })
      .eq('id', storyId);
  }
}

export const communityCollaborationService = new CommunityCollaborationService();
export default communityCollaborationService;
