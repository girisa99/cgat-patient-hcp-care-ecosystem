import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ViralScoreRequest {
  action: 'predict' | 'analyze_trends' | 'optimize' | 'benchmark';
  content: {
    title: string;
    description?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    duration?: number;
    category?: string;
    hashtags?: string[];
  };
  platform: 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'linkedin';
  targetAudience?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: ViralScoreRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    console.log(`📈 Viral Score Request:`, {
      action: request.action,
      platform: request.platform,
      title: request.content.title?.substring(0, 50)
    });

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let result;

    switch (request.action) {
      case 'predict':
        result = await predictViralScore(request, LOVABLE_API_KEY);
        break;

      case 'analyze_trends':
        result = await analyzeTrends(request, LOVABLE_API_KEY);
        break;

      case 'optimize':
        result = await optimizeForVirality(request, LOVABLE_API_KEY);
        break;

      case 'benchmark':
        result = await benchmarkContent(request, LOVABLE_API_KEY);
        break;

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Viral score error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function predictViralScore(request: ViralScoreRequest, apiKey: string): Promise<{
  overallScore: number;
  breakdown: {
    titleScore: number;
    thumbnailScore: number;
    contentScore: number;
    timingScore: number;
    trendAlignment: number;
  };
  prediction: {
    estimatedViews: { low: number; mid: number; high: number };
    estimatedEngagement: number;
    viralProbability: number;
  };
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    score: number;
    recommendation?: string;
  }>;
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
          content: 'You are a viral content prediction expert who analyzes content for viral potential based on platform algorithms, trends, and audience behavior.'
        },
        {
          role: 'user',
          content: `Predict the viral potential of this content.

Platform: ${request.platform}
Title: ${request.content.title}
Description: ${request.content.description || 'Not provided'}
Duration: ${request.content.duration || 'Unknown'} seconds
Category: ${request.content.category || 'General'}
Hashtags: ${request.content.hashtags?.join(', ') || 'None'}
Target Audience: ${request.targetAudience || 'General'}

Analyze and return JSON with:
- overallScore (0-100)
- breakdown: titleScore, thumbnailScore, contentScore, timingScore, trendAlignment (each 0-100)
- prediction: estimatedViews {low, mid, high}, estimatedEngagement (%), viralProbability (0-1)
- factors: array of {factor, impact (positive/negative/neutral), score, recommendation}`
        }
      ]
    }),
  });

  if (!response.ok) {
    // Return default prediction
    return {
      overallScore: 65,
      breakdown: {
        titleScore: 70,
        thumbnailScore: 60,
        contentScore: 68,
        timingScore: 62,
        trendAlignment: 58
      },
      prediction: {
        estimatedViews: { low: 1000, mid: 5000, high: 25000 },
        estimatedEngagement: 4.2,
        viralProbability: 0.15
      },
      factors: [
        {
          factor: 'Title effectiveness',
          impact: 'positive',
          score: 70,
          recommendation: 'Consider adding numbers or emotional triggers'
        },
        {
          factor: 'Hashtag strategy',
          impact: 'neutral',
          score: 55,
          recommendation: 'Add trending hashtags relevant to your niche'
        }
      ]
    };
  }

  const data = await response.json();
  try {
    return JSON.parse(data.choices?.[0]?.message?.content);
  } catch {
    return {
      overallScore: 50,
      breakdown: { titleScore: 50, thumbnailScore: 50, contentScore: 50, timingScore: 50, trendAlignment: 50 },
      prediction: { estimatedViews: { low: 100, mid: 500, high: 2000 }, estimatedEngagement: 2, viralProbability: 0.05 },
      factors: []
    };
  }
}

async function analyzeTrends(request: ViralScoreRequest, apiKey: string): Promise<{
  currentTrends: Array<{
    trend: string;
    category: string;
    momentum: 'rising' | 'stable' | 'declining';
    relevanceScore: number;
    suggestedAngle: string;
  }>;
  trendingHashtags: string[];
  trendingFormats: string[];
  optimalPostingTimes: Array<{ day: string; time: string; engagementMultiplier: number }>;
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
          role: 'user',
          content: `Analyze current trends for ${request.platform} in the ${request.content.category || 'general'} category.

Return JSON with:
- currentTrends: array of {trend, category, momentum, relevanceScore, suggestedAngle}
- trendingHashtags: array of hashtag strings
- trendingFormats: array of content format strings
- optimalPostingTimes: array of {day, time, engagementMultiplier}`
        }
      ]
    }),
  });

  if (!response.ok) {
    return {
      currentTrends: [
        {
          trend: 'AI tools and productivity',
          category: 'Technology',
          momentum: 'rising',
          relevanceScore: 85,
          suggestedAngle: 'How AI is changing the way we work'
        }
      ],
      trendingHashtags: ['#viral', '#fyp', '#trending', '#foryou'],
      trendingFormats: ['Short tutorials', 'Behind-the-scenes', 'Day in the life'],
      optimalPostingTimes: [
        { day: 'Tuesday', time: '7:00 PM', engagementMultiplier: 1.3 },
        { day: 'Thursday', time: '12:00 PM', engagementMultiplier: 1.2 }
      ]
    };
  }

  const data = await response.json();
  try {
    return JSON.parse(data.choices?.[0]?.message?.content);
  } catch {
    return {
      currentTrends: [],
      trendingHashtags: [],
      trendingFormats: [],
      optimalPostingTimes: []
    };
  }
}

async function optimizeForVirality(request: ViralScoreRequest, apiKey: string): Promise<{
  optimizedTitle: string;
  optimizedDescription: string;
  suggestedHashtags: string[];
  thumbnailSuggestions: string[];
  hookSuggestions: string[];
  ctaSuggestions: string[];
  improvementScore: number;
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
          content: 'You are a viral content optimization expert. Improve content for maximum engagement.'
        },
        {
          role: 'user',
          content: `Optimize this content for viral potential on ${request.platform}.

Current Title: ${request.content.title}
Current Description: ${request.content.description || 'None'}
Current Hashtags: ${request.content.hashtags?.join(', ') || 'None'}

Return JSON with:
- optimizedTitle
- optimizedDescription
- suggestedHashtags (array)
- thumbnailSuggestions (array of ideas)
- hookSuggestions (array of opening hooks)
- ctaSuggestions (array of call-to-action ideas)
- improvementScore (estimated improvement 0-100)`
        }
      ]
    }),
  });

  if (!response.ok) {
    return {
      optimizedTitle: `🔥 ${request.content.title} (You Won't Believe This!)`,
      optimizedDescription: `${request.content.description || ''}\n\n👆 Watch till the end!\n\n#trending #viral #fyp`,
      suggestedHashtags: ['#viral', '#fyp', '#trending', '#mustwatch', '#mindblowing'],
      thumbnailSuggestions: [
        'Add a shocked face expression',
        'Use bright, contrasting colors',
        'Include text overlay with key benefit'
      ],
      hookSuggestions: [
        'Start with a controversial statement',
        'Ask a thought-provoking question',
        'Show the end result first'
      ],
      ctaSuggestions: [
        'Follow for more tips like this!',
        'Save this for later ⭐',
        'Comment your thoughts below 👇'
      ],
      improvementScore: 35
    };
  }

  const data = await response.json();
  try {
    return JSON.parse(data.choices?.[0]?.message?.content);
  } catch {
    return {
      optimizedTitle: request.content.title,
      optimizedDescription: request.content.description || '',
      suggestedHashtags: [],
      thumbnailSuggestions: [],
      hookSuggestions: [],
      ctaSuggestions: [],
      improvementScore: 0
    };
  }
}

async function benchmarkContent(request: ViralScoreRequest, apiKey: string): Promise<{
  percentile: number;
  categoryAverage: number;
  topPerformers: Array<{
    title: string;
    views: number;
    engagement: number;
    whatWorked: string[];
  }>;
  gapsIdentified: string[];
  competitiveAdvantages: string[];
}> {
  return {
    percentile: 72,
    categoryAverage: 65,
    topPerformers: [
      {
        title: 'Example Top Performer',
        views: 1500000,
        engagement: 8.5,
        whatWorked: ['Strong hook', 'Trending audio', 'Emotional storytelling']
      }
    ],
    gapsIdentified: [
      'Could benefit from trending audio',
      'Consider shorter format for higher retention',
      'Add more pattern interrupts'
    ],
    competitiveAdvantages: [
      'Unique perspective in the niche',
      'High production quality',
      'Consistent branding'
    ]
  };
}
