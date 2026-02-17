/**
 * Marketing Daily Scheduler
 * 
 * Cron-triggered edge function for Genie Cast content scheduling.
 * Manages daily content rotation across 14 regional bundles and 6 platforms.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Regional timezone configurations
const REGIONAL_TIMEZONES: Record<string, { tz: string; postTimes: string[] }> = {
  us_east: { tz: 'America/New_York', postTimes: ['09:00', '13:00', '18:00'] },
  us_west: { tz: 'America/Los_Angeles', postTimes: ['09:00', '13:00', '18:00'] },
  uk: { tz: 'Europe/London', postTimes: ['09:00', '12:30', '17:30'] },
  eu_central: { tz: 'Europe/Berlin', postTimes: ['09:00', '12:30', '17:30'] },
  india: { tz: 'Asia/Kolkata', postTimes: ['09:00', '13:00', '19:00'] },
  sea: { tz: 'Asia/Singapore', postTimes: ['09:00', '12:30', '18:00'] },
  china: { tz: 'Asia/Shanghai', postTimes: ['09:00', '12:30', '18:00'] },
  japan: { tz: 'Asia/Tokyo', postTimes: ['09:00', '12:30', '18:00'] },
  korea: { tz: 'Asia/Seoul', postTimes: ['09:00', '12:30', '18:30'] },
  australia: { tz: 'Australia/Sydney', postTimes: ['09:00', '12:30', '17:30'] },
  mena: { tz: 'Asia/Dubai', postTimes: ['10:00', '14:00', '20:00'] },
  latam: { tz: 'America/Sao_Paulo', postTimes: ['09:00', '13:00', '18:00'] },
  africa: { tz: 'Africa/Lagos', postTimes: ['09:00', '13:00', '18:00'] },
  russia: { tz: 'Europe/Moscow', postTimes: ['09:00', '13:00', '18:00'] },
};

// Platform configurations
const PLATFORMS = ['youtube', 'linkedin', 'tiktok', 'instagram', 'twitter', 'blog'] as const;
type Platform = typeof PLATFORMS[number];

// Pipeline categories for rotation
const PIPELINE_CATEGORIES = [
  'presentation', 'video', 'training', 'marketing', 
  'social', 'localization', 'repurposing', 'sales'
];

interface ScheduledPost {
  id: string;
  region: string;
  platform: Platform;
  scheduledTime: string;
  pipelineId: string;
  content: {
    title: string;
    description: string;
    hashtags: string[];
    mediaType: 'video' | 'image' | 'carousel' | 'article';
  };
  status: 'pending' | 'processing' | 'published' | 'failed';
}

interface SchedulerResult {
  success: boolean;
  postsScheduled: number;
  postsPublished: number;
  errors: string[];
  regions: string[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action } = await req.json().catch(() => ({ action: 'schedule' }));

    switch (action) {
      case 'schedule':
        return await handleScheduleGeneration(supabase);
      case 'publish':
        return await handlePublishPending(supabase);
      case 'status':
        return await handleGetStatus(supabase);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Scheduler error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function handleScheduleGeneration(supabase: any): Promise<Response> {
  const result: SchedulerResult = {
    success: true,
    postsScheduled: 0,
    postsPublished: 0,
    errors: [],
    regions: [],
  };

  const today = new Date().toISOString().split('T')[0];

  // Check for existing schedule for today
  const { data: existingSchedule } = await supabase
    .from('scheduled_posts')
    .select('id')
    .gte('scheduled_time', `${today}T00:00:00Z`)
    .lt('scheduled_time', `${today}T23:59:59Z`)
    .limit(1);

  if (existingSchedule && existingSchedule.length > 0) {
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Schedule already exists for today',
        postsScheduled: 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Generate schedule for each region
  for (const [region, config] of Object.entries(REGIONAL_TIMEZONES)) {
    try {
      const posts = await generateRegionalSchedule(region, config, today);
      
      if (posts.length > 0) {
        const { error } = await supabase
          .from('scheduled_posts')
          .insert(posts);

        if (error) {
          result.errors.push(`${region}: ${error.message}`);
        } else {
          result.postsScheduled += posts.length;
          result.regions.push(region);
        }
      }
    } catch (error) {
      result.errors.push(`${region}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (result.errors.length > 0) {
    result.success = false;
  }

  return new Response(
    JSON.stringify(result),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateRegionalSchedule(
  region: string, 
  config: { tz: string; postTimes: string[] },
  date: string
): Promise<Partial<ScheduledPost>[]> {
  const posts: Partial<ScheduledPost>[] = [];
  
  // Rotate through platforms for each time slot
  for (let i = 0; i < config.postTimes.length; i++) {
    const time = config.postTimes[i];
    const platform = PLATFORMS[i % PLATFORMS.length];
    const category = PIPELINE_CATEGORIES[(new Date(date).getDay() + i) % PIPELINE_CATEGORIES.length];
    
    // Generate unique pipeline ID based on rotation
    const pipelineIndex = Math.floor(Math.random() * 181) + 1;
    const pipelineId = `pipeline_${category}_${pipelineIndex}`;

    posts.push({
      region,
      platform,
      scheduledTime: `${date}T${time}:00Z`,
      pipelineId,
      content: {
        title: generateTitle(category, region),
        description: generateDescription(category),
        hashtags: generateHashtags(category, platform),
        mediaType: getMediaTypeForPlatform(platform),
      },
      status: 'pending',
    });
  }

  return posts;
}

async function handlePublishPending(supabase: any): Promise<Response> {
  const now = new Date().toISOString();
  
  // Get pending posts that are due
  const { data: pendingPosts, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_time', now)
    .limit(10);

  if (error) {
    throw error;
  }

  let publishedCount = 0;
  const errors: string[] = [];

  for (const post of pendingPosts || []) {
    try {
      // Mark as processing
      await supabase
        .from('scheduled_posts')
        .update({ status: 'processing' })
        .eq('id', post.id);

      // Simulate publishing (in production, call actual platform APIs)
      await simulatePublish(post);

      // Mark as published
      await supabase
        .from('scheduled_posts')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', post.id);

      publishedCount++;
    } catch (error) {
      errors.push(`${post.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      await supabase
        .from('scheduled_posts')
        .update({ status: 'failed', error_message: error instanceof Error ? error.message : 'Unknown error' })
        .eq('id', post.id);
    }
  }

  return new Response(
    JSON.stringify({ 
      success: errors.length === 0,
      published: publishedCount,
      errors 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleGetStatus(supabase: any): Promise<Response> {
  const today = new Date().toISOString().split('T')[0];

  const { data: stats } = await supabase
    .from('scheduled_posts')
    .select('status, region')
    .gte('scheduled_time', `${today}T00:00:00Z`)
    .lt('scheduled_time', `${today}T23:59:59Z`);

  const summary = {
    total: stats?.length || 0,
    pending: stats?.filter((p: any) => p.status === 'pending').length || 0,
    processing: stats?.filter((p: any) => p.status === 'processing').length || 0,
    published: stats?.filter((p: any) => p.status === 'published').length || 0,
    failed: stats?.filter((p: any) => p.status === 'failed').length || 0,
    regions: [...new Set(stats?.map((p: any) => p.region) || [])],
  };

  return new Response(
    JSON.stringify(summary),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper functions
function generateTitle(category: string, region: string): string {
  const titles: Record<string, string[]> = {
    presentation: ['Transform Ideas into Impact', 'AI-Powered Presentations'],
    video: ['Script to Screen in Minutes', 'Professional Video Made Easy'],
    training: ['Learning Content That Engages', 'Training Transformed by AI'],
    marketing: ['Marketing Content at Scale', 'Creative Campaigns Automated'],
    social: ['Social Media Magic', 'Content That Converts'],
    localization: ['Go Global Instantly', 'Speak Every Language'],
    repurposing: ['One Content, Endless Formats', 'Maximize Your Content ROI'],
    sales: ['Sales Decks That Close', 'Pitch Perfect Presentations'],
  };
  
  const categoryTitles = titles[category] || titles.presentation;
  return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
}

function generateDescription(category: string): string {
  return `Discover how Genie Suite transforms your ${category} workflow with AI-powered automation. From concept to creation in minutes, not hours.`;
}

function generateHashtags(category: string, platform: Platform): string[] {
  const base = ['#GenieAI', '#AIContent', '#ContentCreation'];
  const categoryTags: Record<string, string[]> = {
    presentation: ['#Presentations', '#BusinessPitch', '#DeckDesign'],
    video: ['#VideoMarketing', '#VideoProduction', '#AIVideo'],
    training: ['#LearningDevelopment', '#TrainingContent', '#eLearning'],
    marketing: ['#MarketingAutomation', '#DigitalMarketing', '#ContentMarketing'],
  };
  
  return [...base, ...(categoryTags[category] || [])].slice(0, platform === 'twitter' ? 3 : 10);
}

function getMediaTypeForPlatform(platform: Platform): 'video' | 'image' | 'carousel' | 'article' {
  const mediaTypes: Record<Platform, 'video' | 'image' | 'carousel' | 'article'> = {
    youtube: 'video',
    tiktok: 'video',
    instagram: 'carousel',
    linkedin: 'article',
    twitter: 'image',
    blog: 'article',
  };
  return mediaTypes[platform];
}

async function simulatePublish(post: ScheduledPost): Promise<void> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // In production, this would call actual platform APIs:
  // - YouTube Data API
  // - LinkedIn Marketing API
  // - TikTok for Business API
  // - Instagram Graph API
  // - Twitter API v2
  
  console.log(`[SIMULATED] Published to ${post.platform} for ${post.region}: ${post.content.title}`);
}
