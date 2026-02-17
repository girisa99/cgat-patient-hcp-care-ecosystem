import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CaptionRequest {
  action: 'generate' | 'optimize' | 'hashtags';
  title?: string;
  description?: string;
  transcript?: string;
  keywords?: string[];
  tone?: string;
  platform?: string;
  length?: string;
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  includeCTA?: boolean;
  ctaType?: string;
  customCTA?: string;
  brandVoice?: string;
  caption?: string;
  content?: string;
  count?: number;
  maxLength?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: CaptionRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    console.log(`📝 Caption Request:`, {
      action: request.action,
      platform: request.platform,
      tone: request.tone,
    });

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY not configured', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;

    switch (request.action) {
      case 'generate':
        result = await generateCaptions(LOVABLE_API_KEY, request);
        break;

      case 'optimize':
        result = await optimizeCaption(LOVABLE_API_KEY, request);
        break;

      case 'hashtags':
        result = await suggestHashtags(LOVABLE_API_KEY, request);
        break;

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Caption generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateCaptions(apiKey: string, request: CaptionRequest) {
  const platformGuidelines: Record<string, string> = {
    youtube: 'YouTube: Can be longer (up to 5000 chars), include timestamps, call-to-actions, and detailed descriptions',
    tiktok: 'TikTok: Short, punchy, trending language, heavy emoji use, 2-5 hashtags',
    instagram: 'Instagram: Storytelling format, strategic line breaks, 5-30 hashtags at end',
    linkedin: 'LinkedIn: Professional tone, industry insights, thought leadership, 3-5 hashtags',
    twitter: 'Twitter/X: Concise (280 chars max), witty, 1-3 hashtags, thread-friendly',
    facebook: 'Facebook: Conversational, question-based engagement, moderate length',
  };

  const toneInstructions: Record<string, string> = {
    professional: 'Use formal language, industry terminology, and authoritative voice',
    casual: 'Use friendly, conversational language with contractions',
    humorous: 'Include wit, wordplay, and light humor where appropriate',
    inspirational: 'Use motivational language, empowering phrases',
    educational: 'Use clear explanations, bullet points for clarity',
    promotional: 'Include value propositions, urgency, and clear CTAs',
  };

  const lengthGuide: Record<string, string> = {
    short: '1-2 sentences, under 100 characters',
    medium: '2-4 sentences, 100-280 characters',
    long: 'Full paragraph, 280-500+ characters',
  };

  const prompt = `Generate ${request.length || 'medium'} social media captions for the following content:

Title: ${request.title || 'Untitled'}
Description: ${request.description || 'No description provided'}
${request.transcript ? `Transcript excerpt: ${request.transcript.substring(0, 500)}` : ''}
${request.keywords?.length ? `Keywords: ${request.keywords.join(', ')}` : ''}

Platform: ${request.platform || 'general'}
${platformGuidelines[request.platform || 'general'] || ''}

Tone: ${request.tone || 'casual'}
${toneInstructions[request.tone || 'casual'] || ''}

Length: ${lengthGuide[request.length || 'medium']}

Requirements:
${request.includeHashtags ? '- Include relevant hashtags' : '- No hashtags'}
${request.includeEmojis ? '- Include appropriate emojis' : '- Minimal or no emojis'}
${request.includeCTA ? `- Include a call-to-action (${request.ctaType || 'engage'})${request.customCTA ? `: "${request.customCTA}"` : ''}` : ''}
${request.brandVoice ? `- Match this brand voice: ${request.brandVoice}` : ''}

Generate 3 different caption variants. For each caption, provide:
1. The caption text
2. Suggested hashtags (5-10)
3. Estimated engagement score (1-100)

Format as JSON array with objects containing: caption, hashtags (array), estimatedEngagement (number)`;

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
          content: 'You are an expert social media copywriter. Generate engaging, platform-optimized captions. Always respond with valid JSON.'
        },
        { role: 'user', content: prompt }
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'generate_captions',
            description: 'Generate social media caption variants',
            parameters: {
              type: 'object',
              properties: {
                captions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      caption: { type: 'string' },
                      hashtags: { type: 'array', items: { type: 'string' } },
                      estimatedEngagement: { type: 'number' }
                    },
                    required: ['caption', 'hashtags', 'estimatedEngagement']
                  }
                }
              },
              required: ['captions']
            }
          }
        }
      ],
      tool_choice: { type: 'function', function: { name: 'generate_captions' } }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API error:', response.status, errorText);
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    const parsed = JSON.parse(toolCall.function.arguments);
    const captions = parsed.captions.map((c: any, index: number) => ({
      id: `caption-${Date.now()}-${index}`,
      platform: request.platform || 'general',
      caption: c.caption,
      hashtags: c.hashtags || [],
      characterCount: c.caption.length,
      wordCount: c.caption.split(/\s+/).length,
      estimatedEngagement: c.estimatedEngagement || 50,
      tone: request.tone || 'casual',
      hasCTA: request.includeCTA || false,
      hasEmojis: request.includeEmojis || false,
    }));
    
    return { captions };
  }

  // Fallback
  return {
    captions: [{
      id: `caption-${Date.now()}-0`,
      platform: request.platform || 'general',
      caption: `Check out our latest content: ${request.title || 'Amazing content'}! 🎬`,
      hashtags: ['#content', '#video', '#trending'],
      characterCount: 50,
      wordCount: 8,
      estimatedEngagement: 60,
      tone: request.tone || 'casual',
      hasCTA: false,
      hasEmojis: true,
    }]
  };
}

async function optimizeCaption(apiKey: string, request: CaptionRequest) {
  const maxLength = request.maxLength || 280;
  
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
          content: 'You are a social media optimization expert. Shorten and optimize captions while preserving key message and engagement potential.'
        },
        {
          role: 'user',
          content: `Optimize this caption for ${request.platform || 'social media'} (max ${maxLength} characters):

"${request.caption}"

Keep the core message, improve engagement potential, and ensure it fits within ${maxLength} characters.`
        }
      ]
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to optimize caption');
  }

  const data = await response.json();
  const optimizedCaption = data.choices?.[0]?.message?.content || request.caption;

  return { optimizedCaption };
}

async function suggestHashtags(apiKey: string, request: CaptionRequest) {
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
          content: 'You are a social media hashtag expert. Suggest relevant, trending, and effective hashtags.'
        },
        {
          role: 'user',
          content: `Suggest ${request.count || 10} hashtags for this content on ${request.platform || 'social media'}:

"${request.content}"

Mix popular hashtags (high reach) with niche hashtags (high engagement). Return as JSON array of strings.`
        }
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'suggest_hashtags',
            description: 'Return hashtag suggestions',
            parameters: {
              type: 'object',
              properties: {
                hashtags: {
                  type: 'array',
                  items: { type: 'string' }
                }
              },
              required: ['hashtags']
            }
          }
        }
      ],
      tool_choice: { type: 'function', function: { name: 'suggest_hashtags' } }
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to suggest hashtags');
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    const parsed = JSON.parse(toolCall.function.arguments);
    return { hashtags: parsed.hashtags || [] };
  }

  return { hashtags: ['#trending', '#viral', '#content'] };
}
