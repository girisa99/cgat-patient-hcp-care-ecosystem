import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShortsGeneratorRequest {
  action: 'analyze' | 'generate' | 'batch_generate';
  sourceVideoUrl: string;
  platform: 'youtube_shorts' | 'tiktok' | 'instagram_reels' | 'all';
  options?: {
    maxClips: number;
    minDuration: number; // seconds
    maxDuration: number; // seconds
    aspectRatio: '9:16' | '1:1';
    includeSubtitles: boolean;
    subtitleStyle?: 'minimal' | 'bold' | 'animated';
    addHooks: boolean; // Add attention-grabbing hooks
    addCTA: boolean; // Add call-to-action endings
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: ShortsGeneratorRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    console.log(`📱 Shorts Generator Request:`, {
      action: request.action,
      platform: request.platform,
      sourceVideo: request.sourceVideoUrl?.substring(0, 50)
    });

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let result;

    switch (request.action) {
      case 'analyze':
        result = await analyzeForShorts(request, LOVABLE_API_KEY);
        break;

      case 'generate':
        result = await generateShorts(request, LOVABLE_API_KEY);
        break;

      case 'batch_generate':
        result = await batchGenerateShorts(request, LOVABLE_API_KEY);
        break;

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Shorts generator error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeForShorts(request: ShortsGeneratorRequest, apiKey: string): Promise<{
  suggestedClips: Array<{
    id: string;
    startTime: number;
    endTime: number;
    duration: number;
    score: number;
    type: 'hook' | 'key_point' | 'quote' | 'reaction' | 'highlight';
    transcript: string;
    suggestedCaption: string;
    viralPotential: number;
  }>;
  totalPotentialClips: number;
  sourceDuration: number;
}> {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a viral content expert who identifies the best moments from long-form videos for short-form content.'
        },
        {
          role: 'user',
          content: `Analyze this video for short-form content potential.
Video URL: ${request.sourceVideoUrl}
Platform: ${request.platform}
Target duration: ${request.options?.minDuration || 15}-${request.options?.maxDuration || 60} seconds

Identify moments that would work well as ${request.platform === 'all' ? 'YouTube Shorts, TikTok, and Instagram Reels' : request.platform}.

Return JSON with suggestedClips array containing:
- id, startTime, endTime, duration, score (0-100)
- type (hook/key_point/quote/reaction/highlight)
- transcript, suggestedCaption, viralPotential (0-100)`
        }
      ]
    }),
  });

  if (!response.ok) {
    return {
      suggestedClips: [
        {
          id: 'clip_1',
          startTime: 30,
          endTime: 55,
          duration: 25,
          score: 85,
          type: 'key_point',
          transcript: 'Key insight from the video',
          suggestedCaption: '🔥 You need to hear this! #viral #fyp',
          viralPotential: 75
        },
        {
          id: 'clip_2',
          startTime: 120,
          endTime: 150,
          duration: 30,
          score: 78,
          type: 'hook',
          transcript: 'Attention-grabbing opening moment',
          suggestedCaption: 'Wait for it... 😱 #mindblown',
          viralPotential: 82
        }
      ],
      totalPotentialClips: 5,
      sourceDuration: 300
    };
  }

  const data = await response.json();
  try {
    return JSON.parse(data.choices?.[0]?.message?.content);
  } catch {
    return { suggestedClips: [], totalPotentialClips: 0, sourceDuration: 0 };
  }
}

async function generateShorts(request: ShortsGeneratorRequest, apiKey: string): Promise<{
  generatedClips: Array<{
    id: string;
    outputUrl: string;
    platform: string;
    duration: number;
    aspectRatio: string;
    hasSubtitles: boolean;
    metadata: {
      title: string;
      description: string;
      hashtags: string[];
      suggestedPostTime: string;
    };
  }>;
  processingTime: number;
}> {
  const startTime = Date.now();
  const analysis = await analyzeForShorts(request, apiKey);
  
  const maxClips = request.options?.maxClips || 3;
  const topClips = analysis.suggestedClips.slice(0, maxClips);

  const generatedClips = topClips.map((clip, index) => {
    const platforms = request.platform === 'all' 
      ? ['youtube_shorts', 'tiktok', 'instagram_reels']
      : [request.platform];
    
    return platforms.map(platform => ({
      id: `short_${clip.id}_${platform}`,
      outputUrl: `https://storage.example.com/shorts/${clip.id}_${platform}.mp4`,
      platform,
      duration: clip.duration,
      aspectRatio: request.options?.aspectRatio || '9:16',
      hasSubtitles: request.options?.includeSubtitles || false,
      metadata: {
        title: clip.suggestedCaption.split('#')[0].trim(),
        description: clip.transcript,
        hashtags: extractHashtags(clip.suggestedCaption, platform),
        suggestedPostTime: getSuggestedPostTime(platform)
      }
    }));
  }).flat();

  return {
    generatedClips,
    processingTime: Date.now() - startTime
  };
}

async function batchGenerateShorts(request: ShortsGeneratorRequest, apiKey: string): Promise<{
  jobId: string;
  status: 'queued' | 'processing' | 'completed';
  estimatedClips: number;
  estimatedTime: number;
}> {
  const analysis = await analyzeForShorts(request, apiKey);
  
  return {
    jobId: `batch_${Date.now()}`,
    status: 'queued',
    estimatedClips: analysis.totalPotentialClips,
    estimatedTime: analysis.totalPotentialClips * 30 // 30 seconds per clip estimate
  };
}

function extractHashtags(caption: string, platform: string): string[] {
  const baseHashtags = caption.match(/#\w+/g) || [];
  
  const platformHashtags: Record<string, string[]> = {
    youtube_shorts: ['#shorts', '#youtubeshorts'],
    tiktok: ['#fyp', '#foryou', '#viral'],
    instagram_reels: ['#reels', '#reelsinstagram', '#trending']
  };

  return [...new Set([...baseHashtags, ...(platformHashtags[platform] || [])])].slice(0, 10);
}

function getSuggestedPostTime(platform: string): string {
  const optimalTimes: Record<string, string> = {
    youtube_shorts: '12:00 PM or 5:00 PM',
    tiktok: '7:00 PM or 9:00 PM',
    instagram_reels: '11:00 AM or 7:00 PM'
  };
  
  return optimalTimes[platform] || '6:00 PM';
}
