import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  GenerationContext, 
  computeA2ARequirements, 
  validateTierAccess,
  VISUAL_FEATURE_A2A_ROUTING,
  FRAMEWORK_A2A_ROUTING,
  CONTENT_TYPE_A2A_ROUTING,
  GlobalTierLevel
} from "../_shared/generationContext.ts";
import { generateImageWithRouting } from "../_shared/image-providers.ts";
import { generateVideoWithRouting } from "../_shared/video-providers.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ============================================
// RATE LIMITING — In-memory per IP (protects ALL 18+ AI providers)
// ============================================
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests/min per IP (universal processor handles many actions)
const MAX_PROMPT_LENGTH = 10000; // Max chars for prompt input

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip')
    || req.headers.get('x-real-ip')
    || 'unknown';
}

function checkRateLimit(ip: string, limit: number = RATE_LIMIT_MAX): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: limit - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetIn: entry.resetAt - now };
}

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

interface AIRequest {
  provider: 'openai' | 'claude' | 'gemini' | 'alibaba';
  model: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  action?: string;
  // Image generation parameters
  imageGeneration?: boolean;
  aspectRatio?: string;
  style?: string;
  // Scene analysis context
  context?: {
    image?: string;
    analysisDepth?: 'quick' | 'standard' | 'detailed';
    focusAreas?: string[];
    projectContext?: Record<string, any>;
    nodeData?: any;
    inputData?: any;
    nodes?: any[];
    edges?: any[];
  };
  // NEW: Full Generation Context from 8-step wizard
  generationContext?: GenerationContext;
  // User tier for access validation
  userTier?: GlobalTierLevel;
}

// Universal AI supported models registry - ALL providers are primary, no Lovable-first dependency
const UNIVERSAL_AI_REGISTRY = {
  llm: {
    openai: ['gpt-5-2025-08-07', 'gpt-4.1-2025-04-14', 'o3-2025-04-16', 'o4-mini-2025-04-16', 'gpt-4o', 'gpt-4o-mini'],
    claude: ['claude-opus-4-1-20250805', 'claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    gemini: ['gemini-2.0-flash-exp', 'gemini-pro', 'gemini-1.5-pro', 'gemini-2.0-flash', 'google/gemini-3-flash-preview', 'google/gemini-2.5-pro'],
    alibaba: ['qwen-turbo', 'qwen-plus', 'qwen-max']
  },
  image: {
    gemini: ['google/gemini-2.5-flash-image-preview', 'google/gemini-3-pro-image-preview', 'gemini-nano-banana'],
    openai: ['dall-e-3', 'dall-e-2'],
    alibaba: ['wan2.6-t2i', 'wanx-v1'],
    stability: ['stable-diffusion-xl', 'stable-diffusion-3']
  },
  video: {
    alibaba: ['wan2.6-t2v', 'wan2.1-t2v-plus'],
  },
  tts: {
    alibaba: ['qwen3-tts-flash', 'qwen3-tts-instruct-flash-realtime', 'qwen3-tts-flash-realtime'],
    elevenlabs: ['eleven_multilingual_v2'],
    openai: ['tts-1'],
  },
  stt: {
    alibaba: ['qwen3-asr-flash-realtime', 'qwen3-asr-flash', 'fun-asr'],
    openai: ['whisper-1'],
  },
  vision: {
    openai: ['gpt-4o', 'o4-mini-2025-04-16'],
    claude: ['claude-3-5-sonnet-20241022'],
    gemini: ['gemini-1.5-pro-latest', 'gemini-2.0-flash-exp'],
    alibaba: ['qwen-vl-plus']
  }
};

interface AIResponse {
  content: string;
  provider: string;
  model: string;
  usage?: any;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);

  // Rate limit check — protects ALL downstream AI provider API keys
  const rateCheck = checkRateLimit(clientIP);
  if (!rateCheck.allowed) {
    console.warn(`[UniversalAI] Rate limited IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait and try again.', retryAfter: Math.ceil(rateCheck.resetIn / 1000) }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)) } }
    );
  }

  // ============================================
  // JWT AUTHENTICATION — Validate user identity
  // ============================================
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized - missing or invalid authorization header' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.2');
  const supabaseAuth = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getUser(token);
  if (claimsError || !claimsData?.user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized - invalid token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const authenticatedUserId = claimsData.user.id;
  console.log(`[UniversalAI] Authenticated user: ${authenticatedUserId}`);

  try {
    const requestBody = await req.json() as AIRequest;
    const { provider, model, prompt, systemPrompt, temperature = 0.7, maxTokens = 4000, action, imageGeneration, aspectRatio, style, context } = requestBody;

    // Input validation — prevent abuse with oversized prompts
    if (prompt && typeof prompt === 'string' && prompt.length > MAX_PROMPT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Prompt too long. Maximum ${MAX_PROMPT_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[UniversalAI] Processing request from ${clientIP} - Provider: ${provider}, Model: ${model}, Action: ${action}, ImageGen: ${imageGeneration}`);

    // Lightweight actions that don't require full params
    if (action === 'health_check' || action === 'ping') {
      return new Response(JSON.stringify({ 
        ok: true, 
        status: 'ok', 
        available: true, 
        healthy: true, 
        success: true,
        provider: provider || 'system', 
        registry: UNIVERSAL_AI_REGISTRY,
        timestamp: new Date().toISOString() 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return registry info
    if (action === 'list_models') {
      return new Response(JSON.stringify({ 
        success: true,
        registry: UNIVERSAL_AI_REGISTRY,
        timestamp: new Date().toISOString() 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============================================
    // TRANSLATION ACTION
    // ============================================
    if (action === 'translate') {
      const { text, sourceLanguage, targetLanguage, formality, domain, glossary } = await req.json().catch(() => ({})) as any;
      console.log(`[UniversalAI] Translation: ${sourceLanguage} -> ${targetLanguage}, provider: ${provider}`);
      
      const translationResult = await handleTranslation({
        text: text || prompt,
        sourceLanguage: sourceLanguage || 'auto',
        targetLanguage: targetLanguage || 'en',
        formality,
        domain,
        glossary,
        provider: provider || 'deepl',
      });
      
      return new Response(JSON.stringify(translationResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============================================
    // TTS ACTION (Text-to-Speech)
    // ============================================
    if (action === 'tts') {
      const { text: ttsText, voice, language, speed, pitch, style, outputFormat } = await req.json().catch(() => ({})) as any;
      console.log(`[UniversalAI] TTS: provider=${provider}, voice=${voice}`);
      
      const ttsResult = await handleTTS({
        text: ttsText || prompt,
        voice: voice || 'default',
        language: language || 'en',
        speed,
        pitch,
        style,
        outputFormat: outputFormat || 'mp3',
        provider: provider || 'elevenlabs',
      });
      
      return new Response(JSON.stringify(ttsResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============================================
    // STT ACTION (Speech-to-Text)
    // ============================================
    if (action === 'stt') {
      const { audio, inputType, language: sttLanguage, options: sttOptions } = await req.json().catch(() => ({})) as any;
      console.log(`[UniversalAI] STT: provider=${provider}`);
      
      const sttResult = await handleSTT({
        audio,
        inputType: inputType || 'base64',
        language: sttLanguage,
        options: sttOptions,
        provider: provider || 'openai',
      });
      
      return new Response(JSON.stringify(sttResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============================================
    // NLP ACTION (Entity Extraction, Sentiment, etc.)
    // ============================================
    if (action === 'nlp') {
      const { text: nlpText, operations, domain: nlpDomain } = await req.json().catch(() => ({})) as any;
      console.log(`[UniversalAI] NLP: operations=${operations?.join(',')}, provider=${provider}`);
      
      const nlpResult = await handleNLP({
        text: nlpText || prompt,
        operations: operations || ['entity_extraction'],
        domain: nlpDomain,
        provider: provider || 'openai',
      });
      
      return new Response(JSON.stringify(nlpResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============================================
    // IMAGE GENERATION ACTION (Gemini Direct API)
    // ============================================
    if (action === 'image_generation') {
      const { style_intent: imgStyleIntent, region: imgRegion } = requestBody as any;
      console.log(`[UniversalAI] Image generation via shared module - Style: ${imgStyleIntent || style || 'default'}, Provider: ${provider || 'auto'}`);
      
      const imageResult = await generateImageWithRouting(
        prompt,
        imgStyleIntent || style || undefined,
        provider || undefined,
        { model, aspectRatio, style, size: aspectRatio ? undefined : '1024x1024' }
      );
      
      return new Response(JSON.stringify({
        content: imageResult.imageUrl,
        imageUrl: imageResult.imageUrl,
        isImage: true,
        images: [{ image_url: { url: imageResult.imageUrl } }],
        provider: imageResult.provider,
        model: imageResult.model,
        providerChain: imageResult.providerChain,
        timestamp: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============================================
    // VIDEO GENERATION ACTION (Alibaba Wan 2.6 T2V)
    // ============================================
    if (action === 'generate_video') {
      const { duration: videoDuration, aspectRatio: videoAR, style_intent: videoStyleIntent } = requestBody as any;
      console.log(`[UniversalAI] Video generation via shared module - Provider: ${provider || 'auto'}`);
      
      try {
        const videoResult = await generateVideoWithRouting(
          prompt,
          videoStyleIntent || style || undefined,
          provider || undefined,
          {
            model,
            duration: videoDuration || 5,
            aspectRatio: videoAR || aspectRatio || '16:9',
          }
        );
        
        return new Response(JSON.stringify({
          success: true,
          ...videoResult,
          timestamp: new Date().toISOString(),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (videoError) {
        console.error(`[UniversalAI] Video generation error:`, videoError);
        return new Response(JSON.stringify({
          success: false,
          error: videoError instanceof Error ? videoError.message : 'Video generation failed',
          timestamp: new Date().toISOString(),
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ============================================
    // ENHANCE CHAPTER PROMPT ACTION
    // ============================================
    if (action === 'enhance_chapter_prompt') {
      // Parse body for content and context
      const body = await req.json().catch(() => ({})) as any;
      const content = body.content || prompt || '';
      const chapterTitle = body.context?.chapterTitle || 'Chapter';
      const visualTypes = body.context?.visualTypes || ['video'];
      
      console.log(`[UniversalAI] Enhance chapter prompt - Title: ${chapterTitle}, Visual: ${visualTypes[0]}`);
      
      const enhanceSystemPrompt = `You are an expert content creator and prompt engineer. Your task is to enhance user prompts into high-quality, detailed prompts for AI content generation. Focus on:
- Visual clarity and specificity
- Emotional engagement
- Professional tone and brand consistency
- Appropriate pacing and timing cues
- Technical details for the visual type (${visualTypes[0] || 'video'})

Return a JSON object with:
- enhancedPrompt: The improved, detailed prompt
- suggestedScript: A brief narrator script (2-3 sentences)
- visualGuidance: Key visual elements to include`;

      const enhancePrompt = `Enhance this content prompt for a ${visualTypes[0] || 'video'} segment titled "${chapterTitle}":

"${content}"

Make it more detailed, engaging, and optimized for AI generation.`;

      try {
        const result = await callGemini('gemini-2.0-flash', enhancePrompt, enhanceSystemPrompt, 0.7, 2000);
        
        // Try to parse JSON from response
        let enhancement;
        try {
          const jsonMatch = result.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            enhancement = JSON.parse(jsonMatch[0]);
          } else {
            enhancement = {
              enhancedPrompt: result.content,
              suggestedScript: '',
              visualGuidance: ''
            };
          }
        } catch {
          enhancement = {
            enhancedPrompt: result.content,
            suggestedScript: '',
            visualGuidance: ''
          };
        }
        
        return new Response(JSON.stringify({
          success: true,
          enhancement,
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          timestamp: new Date().toISOString(),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (enhanceError) {
        console.error(`[UniversalAI] Enhance prompt error:`, enhanceError);
        // Return a fallback enhancement
        return new Response(JSON.stringify({
          success: true,
          enhancement: {
            enhancedPrompt: `Create a professional ${visualTypes[0] || 'video'} segment for "${chapterTitle}": ${content}. Focus on visual clarity, audience engagement, and brand consistency.`,
            suggestedScript: `Welcome to ${chapterTitle}. Let's explore the key concepts together.`,
            visualGuidance: 'Use clear visuals, smooth transitions, and professional styling.'
          },
          provider: 'fallback',
          timestamp: new Date().toISOString(),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ============================================
    // CONTENT GENERATION ACTION (Template-based)
    // ============================================
    if (action === 'generate_content') {
      console.log(`[UniversalAI] Content generation - Provider: ${provider}, Context: ${JSON.stringify(context)}`);
      
      const contentType = context?.contentType || 'video';
      const pipelines = context?.pipelines || [];
      const language = context?.language || 'en';
      
      // For now, generate content description and placeholder preview
      // In production, this would call actual video/avatar generation APIs
      const targetProvider = provider || 'gemini';
      const targetModel = model || 'gemini-2.0-flash';
      
      try {
        // Generate content script/description using LLM
        const contentPrompt = `${prompt}\n\nGenerate a detailed ${contentType} script or content description in ${language}. Include scene directions, narration, and timing.`;
        
        let contentResult;
        if (targetProvider === 'openai') {
          contentResult = await callOpenAI(targetModel, contentPrompt, systemPrompt, temperature, maxTokens);
        } else if (targetProvider === 'claude') {
          contentResult = await callClaude(targetModel, contentPrompt, systemPrompt, temperature, maxTokens);
        } else {
          contentResult = await callGemini(targetModel, contentPrompt, systemPrompt, temperature, maxTokens);
        }
        
        // Generate a preview placeholder based on content type
        const previewBase = 'https://placehold.co';
        const previewUrls: Record<string, string> = {
          avatar: `${previewBase}/1920x1080/6366f1/ffffff?text=Avatar+Generated`,
          '3d': `${previewBase}/1920x1080/8b5cf6/ffffff?text=3D+Content+Generated`,
          video: `${previewBase}/1920x1080/ec4899/ffffff?text=Video+Generated`,
          animation: `${previewBase}/1920x1080/f59e0b/ffffff?text=Animation+Generated`,
          static: `${previewBase}/1920x1080/10b981/ffffff?text=Static+Content+Generated`,
        };
        
        return new Response(JSON.stringify({
          success: true,
          content: contentResult.content,
          videoUrl: previewUrls[contentType] || previewUrls.video,
          imageUrl: previewUrls[contentType] || previewUrls.video,
          thumbnailUrl: previewUrls[contentType] || previewUrls.video,
          provider: targetProvider,
          model: targetModel,
          contentType,
          pipelines,
          language,
          usage: contentResult.usage,
          timestamp: new Date().toISOString(),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (genError) {
        console.error(`[UniversalAI] Content generation error:`, genError);
        return new Response(JSON.stringify({
          success: false,
          error: genError instanceof Error ? genError.message : 'Content generation failed',
          timestamp: new Date().toISOString(),
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ============================================
    // GENERATE SCENE SCRIPTS ACTION
    // AI Suggest → User Approve per scene
    // Takes messaging + template scenes + capabilities → per-scene scripts
    // ============================================
    if (action === 'generate_scene_scripts') {
      const body = requestBody as any;
      const {
        sceneKey, sceneTitle, sceneType, scriptTemplate,
        messaging, capabilities, product, region, language,
        durationSeconds, previousSceneScript, nextSceneTitle,
      } = body;

      console.log(`[UniversalAI] Scene script generation: scene=${sceneKey}, type=${sceneType}, lang=${language || 'en'}`);

      const messagingContext = messaging ? `
APPROVED MESSAGING CONTEXT:
- Hook: ${messaging.hook || 'N/A'}
- Value Proposition: ${messaging.valueProposition || 'N/A'}
- Pain Points: ${(messaging.painPoints || []).join('; ')}
- Benefits: ${(messaging.benefits || []).join('; ')}
- Differentiators: ${(messaging.differentiators || []).join('; ')}
- CTA: ${messaging.cta || 'N/A'}
- Short Script (30s): ${messaging.shortScript || 'N/A'}
` : '';

      const capabilityContext = capabilities?.length
        ? `\nENABLED CAPABILITIES: ${capabilities.join(', ')} — incorporate visual/audio direction notes for these.`
        : '';

      const flowContext = [
        previousSceneScript ? `PREVIOUS SCENE ended with: "${previousSceneScript.slice(-100)}"` : '',
        nextSceneTitle ? `NEXT SCENE will be: "${nextSceneTitle}"` : '',
      ].filter(Boolean).join('\n');

      const scenePrompt = `You are a professional video script writer for marketing content.

Generate a scene script for the following scene in a video production.

SCENE: "${sceneTitle}" (key: ${sceneKey})
TYPE: ${sceneType || 'content'}
DURATION: ${durationSeconds || 15} seconds (~${Math.round((durationSeconds || 15) * 2.5)} words)
${product ? `PRODUCT: ${product}` : ''}
${region ? `TARGET REGION: ${region}` : ''}
${language && language !== 'en' ? `LANGUAGE: Write in ${language} (transcreate, don't translate)` : ''}
${scriptTemplate ? `TEMPLATE PATTERN: ${scriptTemplate}` : ''}
${messagingContext}
${capabilityContext}
${flowContext}

RULES:
1. Write ONLY the voiceover/narration script text (no stage directions)
2. Match the exact duration — aim for ${Math.round((durationSeconds || 15) * 2.5)} words
3. If template has {{variables}}, fill them with messaging content
4. Maintain natural flow from previous scene
5. For hook scenes: be attention-grabbing in first 3 words
6. For CTA scenes: be clear, actionable, urgent
7. For feature/demo scenes: lead with benefit, then explain
8. For testimonial scenes: use authentic conversational tone

Return ONLY valid JSON:
{
  "scriptText": "The actual voiceover script text...",
  "visualDirection": "Brief visual guidance for this scene (e.g., product screenshot, avatar talking, motion graphics)",
  "variablesFilled": { "variable_name": "filled_value" },
  "suggestedDuration": ${durationSeconds || 15},
  "toneNote": "energetic|professional|conversational|etc"
}`;

      const targetProvider = provider || 'gemini';
      const targetModel = model || 'gemini-2.0-flash';

      try {
        let result;
        if (targetProvider === 'openai') {
          result = await callOpenAI(targetModel, scenePrompt, '', 0.7, 800);
        } else if (targetProvider === 'claude') {
          result = await callClaude(targetModel, scenePrompt, '', 0.7, 800);
        } else if (targetProvider === 'alibaba') {
          result = await callAlibabaLLM(targetModel, scenePrompt, '', 0.7, 800);
        } else {
          result = await callGemini(targetModel, scenePrompt, '', 0.7, 800);
        }

        // Parse JSON from response
        let parsed;
        try {
          const jsonMatch = result.content.match(/\{[\s\S]*\}/);
          parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { scriptText: result.content };
        } catch {
          parsed = { scriptText: result.content.replace(/```json?\n?|\n?```/g, '').trim() };
        }

        return new Response(JSON.stringify({
          success: true,
          sceneKey,
          sceneTitle,
          ...parsed,
          provider: targetProvider,
          model: targetModel,
          usage: result.usage,
          timestamp: new Date().toISOString(),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        console.error(`[UniversalAI] Scene script generation failed:`, err);
        return new Response(JSON.stringify({
          success: false,
          sceneKey,
          error: err instanceof Error ? err.message : 'Scene script generation failed',
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Validate required parameters for generation requests
    if (!provider || !prompt) {
      throw new Error('Missing required parameters: provider or prompt');
    }

    let response;
    
    // Handle scene analysis action with vision capabilities
    if (action === 'analyze_scene' && context?.image) {
      console.log(`[UniversalAI] Scene analysis request - Provider: ${provider}`);
      response = await callVisionAnalysis(provider, model, prompt, systemPrompt, context.image, context);
    }
    // Route image generation based on provider preference - Direct API calls
    else if (imageGeneration) {
      console.log(`[UniversalAI] Image generation (flag) via shared module - Provider: ${provider}, Model: ${model}`);
      
      try {
        const imgResult = await generateImageWithRouting(
          prompt,
          style || undefined,
          provider || undefined,
          { model, aspectRatio, style }
        );
        response = {
          content: imgResult.imageUrl,
          imageUrl: imgResult.imageUrl,
          isImage: true,
          usage: { prompt_tokens: 0, completion_tokens: 0 },
        };
      } catch (imageError) {
        console.warn(`[UniversalAI] All image providers failed:`, imageError);
        throw imageError;
      }
    }
    // Route to appropriate handler based on provider for TEXT generation
    else {
      switch (provider) {
        case 'openai':
          response = await callOpenAI(model || 'gpt-4o-mini', prompt, systemPrompt, temperature, maxTokens);
          break;
        case 'claude':
          response = await callClaude(model || 'claude-3-5-haiku-20241022', prompt, systemPrompt, temperature, maxTokens);
          break;
        case 'gemini':
          try {
            response = await callGemini(model || 'gemini-2.0-flash', prompt, systemPrompt, temperature, maxTokens);
          } catch (geminiErr) {
            const errMsg = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
            if (errMsg.includes('429') || errMsg.includes('rate limit') || errMsg.includes('RESOURCE_EXHAUSTED')) {
              console.warn(`[UniversalAI] Gemini rate limited, auto-falling back to OpenAI/Claude`);
              try {
                response = await callOpenAI('gpt-4o-mini', prompt, systemPrompt || '', temperature, maxTokens);
              } catch {
                response = await callClaude('claude-3-5-haiku-20241022', prompt, systemPrompt || '', temperature, maxTokens);
              }
            } else {
              throw geminiErr;
            }
          }
          break;
        case 'alibaba':
          response = await callAlibabaLLM(model || 'qwen-turbo', prompt, systemPrompt, temperature, maxTokens);
          break;
        default:
          console.log(`[UniversalAI] Auto-selecting gemini for provider: ${provider}`);
          try {
            response = await callGemini(model || 'gemini-2.0-flash', prompt, systemPrompt, temperature, maxTokens);
          } catch (defaultErr) {
            const errMsg = defaultErr instanceof Error ? defaultErr.message : String(defaultErr);
            if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
              console.warn(`[UniversalAI] Default gemini rate limited, falling back`);
              response = await callOpenAI('gpt-4o-mini', prompt, systemPrompt || '', temperature, maxTokens);
            } else {
              throw defaultErr;
            }
          }
      }
    }

    const aiResponse: AIResponse = {
      content: response.content,
      provider,
      model,
      usage: response.usage,
      timestamp: new Date().toISOString(),
      // Include image URL if present
      ...(response.imageUrl && { imageUrl: response.imageUrl }),
      ...(response.isImage && { isImage: response.isImage }),
    };

    console.log(`AI response generated successfully - Provider: ${provider}, Content length: ${response.content?.length || 0}, HasImage: ${!!response.imageUrl}`);

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-universal-processor:', error);
    
    const errorResponse = {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      details: error instanceof Error ? error.stack : 'Unknown error'
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Normalize OpenAI model names to valid API model IDs
function normalizeOpenAIModel(model: string): string {
  const ml = model.toLowerCase();
  
  // Vision model mappings - gpt-5-vision doesn't exist, use gpt-4o which has vision
  if (ml.includes('gpt-5-vision') || ml.includes('gpt5-vision')) {
    return 'gpt-4o'; // GPT-4o has vision capabilities
  }
  // GPT-5 family - use stable dated versions
  if (ml === 'gpt-5' || ml.includes('gpt-5') && !ml.includes('mini') && !ml.includes('nano')) {
    return 'gpt-4o'; // Fall back to stable model
  }
  if (ml.includes('gpt-5-mini')) {
    return 'gpt-4o-mini';
  }
  if (ml.includes('gpt-5-nano')) {
    return 'gpt-4o-mini';
  }
  // Already valid models
  if (ml === 'gpt-4o' || ml === 'gpt-4o-mini') {
    return model;
  }
  // Default fallback
  return 'gpt-4o-mini';
}

async function callOpenAI(model: string, prompt: string, systemPrompt?: string, temperature?: number, maxTokens?: number) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your Edge Function secrets.');
  }

  // Normalize model to valid API ID
  const normalizedModel = normalizeOpenAIModel(model);
  console.log(`OpenAI model normalization: ${model} -> ${normalizedModel}`);

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  // Handle different model parameter requirements
  const requestBody: any = {
    model: normalizedModel,
    messages,
  };

  // Legacy models (gpt-4o family) use max_tokens and support temperature
  requestBody.max_tokens = maxTokens;
  requestBody.temperature = temperature;

  console.log(`Calling OpenAI API with model: ${normalizedModel}`);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`OpenAI API error (${response.status}):`, errorData);
    throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: data.usage
  };
}

/**
 * OpenAI DALL-E Image Generation
 * Uses DALL-E 3 or DALL-E 2 for image generation
 */
async function callOpenAIImage(model: string, prompt: string, aspectRatio?: string, style?: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured for image generation.');
  }

  // Map aspect ratio to DALL-E size
  const getSize = (ar?: string): string => {
    switch (ar) {
      case '16:9': return '1792x1024';
      case '9:16': return '1024x1792';
      case '1:1':
      default: return '1024x1024';
    }
  };

  const targetModel = model.includes('dall-e-2') ? 'dall-e-2' : 'dall-e-3';
  const size = getSize(aspectRatio);
  const imageStyle = style === 'natural' ? 'natural' : 'vivid';

  console.log(`[UniversalAI-OpenAI] Generating image: model=${targetModel}, size=${size}`);

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: targetModel,
      prompt: `${prompt}. Professional, high quality. Safe for all audiences.`,
      n: 1,
      size: size,
      quality: targetModel === 'dall-e-3' ? 'standard' : undefined,
      style: targetModel === 'dall-e-3' ? imageStyle : undefined,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[UniversalAI-OpenAI] DALL-E error (${response.status}):`, errorText);
    throw new Error(`DALL-E API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const imageUrl = data.data?.[0]?.url || data.data?.[0]?.b64_json;

  return {
    content: imageUrl || '',
    imageUrl: imageUrl,
    isImage: !!imageUrl,
    usage: { prompt_tokens: 0, completion_tokens: 0 }
  };
}

async function callClaude(model: string, prompt: string, systemPrompt?: string, temperature?: number, maxTokens?: number) {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY') || Deno.env.get('CLAUDE_API_KEY');
  if (!apiKey) {
    throw new Error('Claude API key not configured. Please add ANTHROPIC_API_KEY (or CLAUDE_API_KEY) to your Edge Function secrets.');
  }

  // Normalize Claude model names to valid API model IDs
  const normalizeModel = (m: string): string => {
    const ml = m.toLowerCase();
    
    // Claude 4 models - use latest stable versions
    if (ml.includes('claude-4-vision') || ml.includes('claude-sonnet-4') || ml.includes('claude-4')) {
      return 'claude-sonnet-4-20250514'; // Latest Claude 4 Sonnet
    }
    if (ml.includes('claude-opus-4')) {
      return 'claude-opus-4-5-20251101';
    }
    // Claude 3.5/3.7 models
    if (ml.includes('haiku-fast') || ml.includes('haiku')) {
      return 'claude-3-5-haiku-20241022';
    }
    if (ml === 'claude-3-5-sonnet' || ml === 'claude-3-5-sonnet-latest' || (ml.includes('sonnet') && !ml.match(/20\d{2}/))) {
      return 'claude-sonnet-4-20250514'; // Upgrade to Claude 4
    }
    // Already has dated version
    if (ml.match(/claude-.*-20\d{6}/)) {
      return m;
    }
    // Default fallback
    return 'claude-3-5-haiku-20241022';
  };

  let targetModel = normalizeModel(model);

  const buildBody = (mdl: string) => {
    const body: any = {
      model: mdl,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: 'user', content: prompt }]
    };
    if (systemPrompt) body.system = systemPrompt;
    return body;
  };

  const makeRequest = async (mdl: string) => {
    console.log(`Calling Claude API with model: ${mdl}`);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(buildBody(mdl)),
    });
    return response;
  };

  // First attempt
  let response = await makeRequest(targetModel);

  // If model not found (404), retry once with a stable fallback
  if (!response.ok && response.status === 404) {
    const errText = await response.text();
    console.error(`Claude API error (first attempt ${response.status}):`, errText);
    if (targetModel !== 'claude-3-5-haiku-20241022') {
      console.log('Retrying Claude call with fallback model: claude-3-5-haiku-20241022');
      targetModel = 'claude-3-5-haiku-20241022';
      response = await makeRequest(targetModel);
    }
  }

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`Claude API error (${response.status}):`, errorData);
    throw new Error(`Claude API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return {
    content: data.content?.[0]?.text || '',
    usage: data.usage
  };
}

// Normalize Gemini model names to valid API model IDs (updated for 2025+)
function normalizeGeminiModel(model: string, isImageGeneration?: boolean): string {
  const ml = model.toLowerCase();
  
  // Don't normalize image generation models - they need special handling
  if (isImageGeneration || ml.includes('image')) {
    console.log(`[Gemini] Image model detected, skipping normalization: ${model}`);
    return model; // Return as-is for image generation routing
  }
  
  // Map to currently available Gemini models - gemini-2.0-flash is stable now
  if (ml.includes('gemini-2.5') || ml.includes('gemini-2.0') || ml.includes('gemini-2')) {
    return 'gemini-2.0-flash';
  }
  if (ml.includes('gemini-1.5-flash') || ml.includes('flash')) {
    return 'gemini-2.0-flash'; // 1.5 deprecated, use 2.0
  }
  if (ml.includes('gemini-1.5-pro') || ml.includes('pro')) {
    return 'gemini-2.0-flash';
  }
  if (ml.includes('gemini-pro')) {
    return 'gemini-2.0-flash';
  }
  // Default to stable model
  return 'gemini-2.0-flash';
}

async function callGemini(model: string, prompt: string, systemPrompt?: string, temperature?: number, maxTokens?: number) {
  const apiKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please add GOOGLE_API_KEY (or GEMINI_API_KEY) to your Edge Function secrets.');
  }

  // Normalize model to valid API ID
  const normalizedModel = normalizeGeminiModel(model);
  console.log(`Gemini model normalization: ${model} -> ${normalizedModel}`);

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  console.log(`Calling Gemini API with model: ${normalizedModel}`);

  let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${normalizedModel}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    }),
  });

  // Handle 429 rate limiting - retry with exponential backoff then fallback to other providers
  if (!response.ok && response.status === 429) {
    console.warn(`[Gemini] Rate limited (429). Retrying with backoff...`);
    
    // Retry up to 2 times with backoff
    for (let attempt = 1; attempt <= 2; attempt++) {
      const delay = attempt * 1500; // 1.5s, 3s
      console.log(`[Gemini] Retry attempt ${attempt} after ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
      
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: temperature ?? 0.7,
            maxOutputTokens: maxTokens ?? 4096
          }
        }),
      });
      
      if (response.ok) {
        console.log(`[Gemini] Retry attempt ${attempt} succeeded`);
        break;
      }
      
      if (response.status !== 429) break; // Different error, stop retrying
    }
    
    // If still 429, try fallback to OpenAI or Claude
    if (!response.ok && response.status === 429) {
      console.warn(`[Gemini] Still rate limited after retries. Falling back to OpenAI...`);
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      if (openaiKey) {
        return await callOpenAI('gpt-4o-mini', prompt, systemPrompt || '', temperature, maxTokens);
      }
      const claudeKey = Deno.env.get('ANTHROPIC_API_KEY') || Deno.env.get('CLAUDE_API_KEY');
      if (claudeKey) {
        return await callClaude('claude-3-5-haiku-20241022', prompt, systemPrompt || '', temperature, maxTokens);
      }
      // No fallback available
      throw new Error('Gemini rate limited (429) and no fallback providers available. Please try again in a moment.');
    }
  }

  // If model not found, retry with fallback models
  if (!response.ok && response.status === 404) {
    const errText = await response.text();
    console.error(`Gemini API error (first attempt ${response.status}):`, errText);
    
    // Try fallback models in order
    const fallbackModels = ['gemini-1.5-flash-latest', 'gemini-pro'];
    
    for (const fallbackModel of fallbackModels) {
      console.log(`Retrying Gemini call with fallback model: ${fallbackModel}`);
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: temperature ?? 0.7,
            maxOutputTokens: maxTokens ?? 4096
          }
        }),
      });
      
      if (response.ok) {
        console.log(`Fallback model ${fallbackModel} succeeded`);
        break;
      }
      
      // Read error but continue to next fallback - clone to avoid body consumed
      if (!response.ok) {
        try {
          const fallbackErr = await response.clone().text();
          console.error(`Fallback model ${fallbackModel} failed (${response.status}):`, fallbackErr);
        } catch (e) {
          console.error(`Fallback model ${fallbackModel} failed (${response.status})`);
        }
      }
    }
  }

  if (!response.ok) {
    // Clone response before reading to avoid double consumption error
    let errorData: string;
    try {
      errorData = await response.clone().text();
    } catch {
      errorData = 'Unable to read error response';
    }
    console.error(`Gemini API error (${response.status}):`, errorData);
    throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  
  // Handle empty response
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.error('Gemini returned empty response:', JSON.stringify(data));
    throw new Error('Gemini returned empty response - content may have been filtered');
  }
  
  return {
    content: data.candidates[0].content.parts[0].text,
    usage: data.usageMetadata
  };
}

/**
 * Gemini Image Generation via Direct API
 * Uses Gemini's native image generation capabilities (Imagen models)
 */
async function callGeminiImage(
  model: string, 
  prompt: string, 
  systemPrompt?: string, 
  aspectRatio?: string,
  style?: string
) {
  const apiKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured. Please add GOOGLE_API_KEY or GEMINI_API_KEY to your Edge Function secrets.');
  }

  // Normalize model name for image generation
  const targetModel = model.includes('imagen') ? model : 'gemini-2.0-flash-exp';
  
  console.log(`[UniversalAI-Gemini] Generating image: model=${targetModel}`);

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  
  // Add style and aspect ratio to prompt
  const finalPrompt = style
    ? `Create a ${style} style image: ${fullPrompt}. ${aspectRatio || '1:1'} aspect ratio. Professional, high quality. Safe for all audiences.`
    : `${fullPrompt}. Professional, high quality. Safe for all audiences.`;

  // Use Gemini's generateContent with image output modality
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ 
        parts: [{ text: finalPrompt }] 
      }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        temperature: 0.7,
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[UniversalAI-Gemini] Image generation error (${response.status}):`, errorText);
    
    // If image generation fails, try text-only generation for fallback
    if (response.status === 400 || response.status === 404) {
      console.log(`[UniversalAI-Gemini] Image modality not available, using text-to-description fallback`);
      throw new Error(`Gemini image generation not available: ${response.status}`);
    }
    
    throw new Error(`Gemini image generation error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Extract image from response
  const parts = data.candidates?.[0]?.content?.parts || [];
  let imageUrl = '';
  let textContent = '';
  
  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      // Convert base64 to data URL
      imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    } else if (part.text) {
      textContent = part.text;
    }
  }

  return {
    content: imageUrl || textContent,
    imageUrl: imageUrl,
    isImage: !!imageUrl,
    usage: data.usageMetadata
  };
}

/**
 * Vision-based scene analysis - routes to appropriate provider with image
 */
async function callVisionAnalysis(
  provider: string,
  model: string,
  prompt: string,
  systemPrompt: string | undefined,
  imageBase64: string,
  context: Record<string, any>
) {
  console.log(`[UniversalAI-Vision] Analyzing scene with provider: ${provider}`);
  
  // Build the full prompt with system context
  const fullSystemPrompt = systemPrompt || `You are an expert video production AI assistant specializing in scene analysis.
Analyze the provided image and return a JSON object with:
- description: Brief scene description
- objects: Array of detected objects with name, confidence, category
- faces: Array of detected faces with expression, confidence
- emotions: Dominant emotion and mood (positive/neutral/negative/mixed)
- composition: Analysis of visual composition, brightness, color palette
- suggestions: Array of editing suggestions with type, priority, description
- quality: Overall quality score (0-100), sharpness, issues
- timing: Suggested duration and pacing (slow/medium/fast)`;

  const analysisPrompt = prompt || 'Analyze this scene for video production. Provide detailed insights for editing.';

  switch (provider) {
    case 'openai':
      return await callOpenAIVision(model || 'gpt-4o', analysisPrompt, fullSystemPrompt, imageBase64);
    case 'claude':
      return await callClaudeVision(model || 'claude-3-5-sonnet-20241022', analysisPrompt, fullSystemPrompt, imageBase64);
    case 'gemini':
      return await callGeminiVision(model || 'gemini-2.0-flash-exp', analysisPrompt, fullSystemPrompt, imageBase64);
    case 'lovable': // DEPRECATED - route to Gemini direct API
    case 'default':
    default:
      // Default to Gemini Vision (NO LOVABLE AI)
      return await callGeminiVision(model || 'gemini-2.0-flash-exp', analysisPrompt, fullSystemPrompt, imageBase64);
  }
}

/**
 * OpenAI Vision API call
 */
async function callOpenAIVision(model: string, prompt: string, systemPrompt: string, imageBase64: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured for vision analysis.');
  }

  const normalizedModel = model.includes('vision') || model === 'gpt-4o' || model.includes('o4-mini') 
    ? model : 'gpt-4o';

  console.log(`[Vision-OpenAI] Using model: ${normalizedModel}`);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: normalizedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 4000
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`[Vision-OpenAI] Error (${response.status}):`, errorData);
    throw new Error(`OpenAI Vision API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: data.usage
  };
}

/**
 * Claude Vision API call
 */
async function callClaudeVision(model: string, prompt: string, systemPrompt: string, imageBase64: string) {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY') || Deno.env.get('CLAUDE_API_KEY');
  if (!apiKey) {
    throw new Error('Claude API key not configured for vision analysis.');
  }

  const normalizedModel = model.includes('sonnet') ? model : 'claude-3-5-sonnet-20241022';

  console.log(`[Vision-Claude] Using model: ${normalizedModel}`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: normalizedModel,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64
              }
            },
            { type: 'text', text: prompt }
          ]
        }
      ]
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`[Vision-Claude] Error (${response.status}):`, errorData);
    throw new Error(`Claude Vision API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.content?.[0]?.text || '',
    usage: data.usage
  };
}

/**
 * Gemini Vision API call (via direct API)
 */
async function callGeminiVision(model: string, prompt: string, systemPrompt: string, imageBase64: string) {
  const apiKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('Gemini API key not configured for vision analysis.');
  }

  const normalizedModel = 'gemini-2.0-flash-exp'; // Best vision model

  console.log(`[Vision-Gemini] Using model: ${normalizedModel}`);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${normalizedModel}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: `${systemPrompt}\n\n${prompt}` },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: imageBase64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`[Vision-Gemini] Error (${response.status}):`, errorData);
    throw new Error(`Gemini Vision API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    usage: data.usageMetadata
  };
}

/**
 * DEPRECATED: Lovable AI Gateway Vision call
 * Replaced with direct Gemini Vision API calls
 * Kept for backward compatibility - routes to Gemini
 */
async function callLovableAIVision(model: string, prompt: string, systemPrompt: string, imageBase64: string) {
  console.log('[Vision] DEPRECATED: callLovableAIVision routing to Gemini Vision API');
  return await callGeminiVision('gemini-2.0-flash-exp', prompt, systemPrompt, imageBase64);
}

/**
 * DEPRECATED: Lovable AI Gateway LLM call
 * Replaced with direct Gemini API calls
 * Kept for backward compatibility - routes to Gemini
 */
async function callLovableAI(model: string, prompt: string, systemPrompt: string, json?: boolean) {
  console.log('[LLM] DEPRECATED: callLovableAI routing to Gemini API');
  return await callGemini('gemini-2.0-flash', prompt, systemPrompt);
}

// ============================================
// TRANSLATION HANDLER
// ============================================

interface TranslationParams {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  formality?: string;
  domain?: string;
  glossary?: Record<string, string>;
  provider: string;
}

async function handleTranslation(params: TranslationParams) {
  const { text, sourceLanguage, targetLanguage, formality, domain, glossary, provider } = params;
  
  // Route to appropriate translation provider
  switch (provider) {
    case 'deepl':
      return await translateWithDeepL(text, sourceLanguage, targetLanguage, formality);
    case 'google':
      return await translateWithGoogle(text, sourceLanguage, targetLanguage);
    case 'microsoft':
      return await translateWithMicrosoft(text, sourceLanguage, targetLanguage);
    case 'claude':
    case 'openai':
    case 'gemini':
    default:
      // Use LLM for translation
      return await translateWithLLM(text, sourceLanguage, targetLanguage, formality, domain, provider);
  }
}

async function translateWithDeepL(text: string, source: string, target: string, formality?: string) {
  const apiKey = Deno.env.get('DEEPL_API_KEY');
  if (!apiKey) throw new Error('DEEPL_API_KEY not configured');

  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      source_lang: source !== 'auto' ? source.toUpperCase() : undefined,
      target_lang: target.toUpperCase(),
      formality: formality || 'default',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepL error: ${err}`);
  }

  const data = await response.json();
  return {
    translatedText: data.translations?.[0]?.text || '',
    detectedLanguage: data.translations?.[0]?.detected_source_language,
    confidence: 0.95,
    provider: 'deepl',
    timestamp: new Date().toISOString(),
  };
}

async function translateWithGoogle(text: string, source: string, target: string) {
  const apiKey = Deno.env.get('GOOGLE_API_KEY');
  if (!apiKey) throw new Error('GOOGLE_API_KEY not configured');

  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: source !== 'auto' ? source : undefined,
      target: target,
      format: 'text',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Google Translate error: ${err}`);
  }

  const data = await response.json();
  return {
    translatedText: data.data?.translations?.[0]?.translatedText || '',
    detectedLanguage: data.data?.translations?.[0]?.detectedSourceLanguage,
    confidence: 0.9,
    provider: 'google',
    timestamp: new Date().toISOString(),
  };
}

async function translateWithMicrosoft(text: string, source: string, target: string) {
  const apiKey = Deno.env.get('MICROSOFT_TRANSLATE_API_KEY');
  const region = Deno.env.get('MICROSOFT_TRANSLATE_REGION') || 'global';
  if (!apiKey) throw new Error('MICROSOFT_TRANSLATE_API_KEY not configured');

  const endpoint = 'https://api.cognitive.microsofttranslator.com/translate';
  const params = new URLSearchParams({
    'api-version': '3.0',
    to: target,
    ...(source !== 'auto' && { from: source }),
  });

  const response = await fetch(`${endpoint}?${params}`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Ocp-Apim-Subscription-Region': region,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{ text }]),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Microsoft Translate error: ${err}`);
  }

  const data = await response.json();
  return {
    translatedText: data[0]?.translations?.[0]?.text || '',
    detectedLanguage: data[0]?.detectedLanguage?.language,
    confidence: data[0]?.detectedLanguage?.score || 0.9,
    provider: 'microsoft',
    timestamp: new Date().toISOString(),
  };
}

async function translateWithLLM(text: string, source: string, target: string, formality?: string, domain?: string, provider?: string) {
  const systemPrompt = `You are a professional translator. Translate the following text from ${source === 'auto' ? 'the detected language' : source} to ${target}.
${formality ? `Use ${formality} register.` : ''}
${domain ? `This is ${domain} content.` : ''}
Return ONLY the translated text, no explanations.`;

  let result;
  switch (provider) {
    case 'claude':
      result = await callClaude('claude-3-5-haiku-20241022', text, systemPrompt, 0.3, 4000);
      break;
    case 'openai':
      result = await callOpenAI('gpt-4o-mini', text, systemPrompt, 0.3, 4000);
      break;
    case 'gemini':
    default:
      // Use Gemini direct API (NO LOVABLE AI)
      result = await callGemini('gemini-2.0-flash', text, systemPrompt, 0.3, 4000);
  }

  return {
    translatedText: result.content,
    confidence: 0.85,
    provider: provider || 'gemini',
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// TTS HANDLER
// ============================================

interface TTSParams {
  text: string;
  voice: string;
  language: string;
  speed?: number;
  pitch?: number;
  style?: string;
  outputFormat: string;
  provider: string;
}

async function handleTTS(params: TTSParams) {
  const { text, voice, language, speed, provider } = params;
  
  switch (provider) {
    case 'elevenlabs':
      return await ttsWithElevenLabs(text, voice);
    case 'openai':
      return await ttsWithOpenAI(text, voice, speed);
    case 'google':
      return await ttsWithGoogle(text, language, voice);
    case 'alibaba':
      return await ttsWithAlibaba(text, voice, language);
    default:
      // Default to ElevenLabs
      return await ttsWithElevenLabs(text, voice);
  }
}

async function ttsWithElevenLabs(text: string, voice: string) {
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not configured');

  // Default voice if not specified
  const voiceId = voice === 'default' ? 'EXAVITQu4vr4xnSDxMaL' : voice; // Sarah voice

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs TTS error: ${err}`);
  }

  // Convert audio to base64
  const arrayBuffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

  return {
    audioUrl: `data:audio/mpeg;base64,${base64}`,
    duration: text.length / 15, // Rough estimate
    voice: voiceId,
    provider: 'elevenlabs',
    timestamp: new Date().toISOString(),
  };
}

async function ttsWithOpenAI(text: string, voice: string, speed?: number) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const voiceName = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].includes(voice) 
    ? voice : 'nova';

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: voiceName,
      speed: speed || 1.0,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI TTS error: ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

  return {
    audioUrl: `data:audio/mpeg;base64,${base64}`,
    duration: text.length / 15,
    voice: voiceName,
    provider: 'openai',
    timestamp: new Date().toISOString(),
  };
}

async function ttsWithGoogle(text: string, language: string, voice: string) {
  const apiKey = Deno.env.get('GOOGLE_API_KEY');
  if (!apiKey) throw new Error('GOOGLE_API_KEY not configured');

  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: language || 'en-US',
        name: voice !== 'default' ? voice : undefined,
      },
      audioConfig: { audioEncoding: 'MP3' },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Google TTS error: ${err}`);
  }

  const data = await response.json();
  return {
    audioUrl: `data:audio/mpeg;base64,${data.audioContent}`,
    duration: text.length / 15,
    voice: voice,
    provider: 'google',
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// STT HANDLER
// ============================================

interface STTParams {
  audio: string;
  inputType: string;
  language?: string;
  options?: any;
  provider: string;
}

async function handleSTT(params: STTParams) {
  const { audio, language, provider } = params;
  
  switch (provider) {
    case 'openai':
      return await sttWithOpenAI(audio, language);
    case 'google':
      return await sttWithGoogle(audio, language);
    case 'alibaba':
      return await sttWithAlibaba(audio, language);
    default:
      return await sttWithOpenAI(audio, language);
  }
}

async function sttWithOpenAI(audio: string, language?: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  // Convert base64 to blob
  const binaryString = atob(audio.replace(/^data:audio\/\w+;base64,/, ''));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const formData = new FormData();
  formData.append('file', new Blob([bytes], { type: 'audio/webm' }), 'audio.webm');
  formData.append('model', 'whisper-1');
  if (language) formData.append('language', language);

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI STT error: ${err}`);
  }

  const data = await response.json();
  return {
    text: data.text,
    confidence: 0.95,
    language: language || 'en',
    provider: 'openai',
    timestamp: new Date().toISOString(),
  };
}

async function sttWithGoogle(audio: string, language?: string) {
  const apiKey = Deno.env.get('GOOGLE_API_KEY');
  if (!apiKey) throw new Error('GOOGLE_API_KEY not configured');

  const audioContent = audio.replace(/^data:audio\/\w+;base64,/, '');

  const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: language || 'en-US',
        enableAutomaticPunctuation: true,
      },
      audio: { content: audioContent },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Google STT error: ${err}`);
  }

  const data = await response.json();
  const transcript = data.results?.map((r: any) => r.alternatives?.[0]?.transcript).join(' ') || '';

  return {
    text: transcript,
    confidence: data.results?.[0]?.alternatives?.[0]?.confidence || 0.9,
    language: language || 'en',
    provider: 'google',
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// NLP HANDLER
// ============================================

interface NLPParams {
  text: string;
  operations: string[];
  domain?: string;
  provider: string;
}

async function handleNLP(params: NLPParams) {
  const { text, operations, domain, provider } = params;
  
  const systemPrompt = `You are an NLP expert. Analyze the following text and provide:
${operations.includes('entity_extraction') ? '- entities: Array of {name, type, confidence}' : ''}
${operations.includes('sentiment_analysis') ? '- sentiment: {label: positive/negative/neutral, score: 0-1}' : ''}
${operations.includes('summarization') ? '- summary: A concise summary (2-3 sentences)' : ''}
${operations.includes('keywords') ? '- keywords: Array of important keywords' : ''}
${domain ? `Context: This is ${domain} content.` : ''}
Return as JSON.`;

  let result;
  switch (provider) {
    case 'claude':
      result = await callClaude('claude-3-5-haiku-20241022', text, systemPrompt, 0.3, 4000);
      break;
    case 'openai':
      result = await callOpenAI('gpt-4o-mini', text, systemPrompt, 0.3, 4000);
      break;
    case 'gemini':
    default:
      // Use Gemini direct API (NO LOVABLE AI)
      result = await callGemini('gemini-2.0-flash', text, systemPrompt, 0.3, 4000);
  }

  // Try to parse JSON from response
  let parsed: any = {};
  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.warn('[NLP] Failed to parse JSON response:', e);
  }

  return {
    entities: parsed.entities || [],
    sentiment: parsed.sentiment,
    summary: parsed.summary,
    keywords: parsed.keywords,
    provider,
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// ALIBABA CLOUD PROVIDERS (Singapore International Endpoint)
// ============================================

const ALIBABA_INTL_ENDPOINT = 'https://dashscope-intl.aliyuncs.com';

function getAlibabaKey(): string {
  const key = Deno.env.get('ALIBABA_SINGAPORE_API_KEY') || Deno.env.get('ALIBABA_API_KEY') || Deno.env.get('DASHSCOPE_API_KEY');
  if (!key) throw new Error('Alibaba API key not configured. Add ALIBABA_SINGAPORE_API_KEY.');
  return key;
}

/**
 * Alibaba Qwen LLM (qwen-turbo, qwen-plus, qwen-max)
 */
async function callAlibabaLLM(model: string, prompt: string, systemPrompt?: string, temperature?: number, maxTokens?: number) {
  const apiKey = getAlibabaKey();
  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  console.log(`[Alibaba-LLM] Calling ${model}`);
  const response = await fetch(`${ALIBABA_INTL_ENDPOINT}/compatible-mode/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'qwen-turbo',
      messages,
      temperature: temperature ?? 0.7,
      max_tokens: maxTokens ?? 4000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`[Alibaba-LLM] Error ${response.status}:`, err);
    throw new Error(`Alibaba LLM error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage,
  };
}

/**
 * Alibaba Wan 2.6 T2I (Image Generation) - Async task
 */
async function callAlibabaImage(model: string, prompt: string, aspectRatio?: string) {
  const apiKey = getAlibabaKey();
  const sizeMap: Record<string, string> = {
    '16:9': '1280*720', '9:16': '720*1280', '1:1': '1024*1024',
  };
  const size = sizeMap[aspectRatio || '16:9'] || '1280*720';

  console.log(`[Alibaba-Image] Submitting ${model} task`);
  // Wan 2.6 uses multimodal-generation endpoint
  const endpoint = model.includes('wan2.6') 
    ? `${ALIBABA_INTL_ENDPOINT}/api/v1/services/aigc/multimodal-generation/generation`
    : `${ALIBABA_INTL_ENDPOINT}/api/v1/services/aigc/text2image/image-synthesis`;
  
  const body = model.includes('wan2.6') ? {
    model: 'wan2.6-t2i',
    input: { messages: [{ role: 'user', content: [{ text: `${prompt}. Professional, high quality.` }] }] },
    parameters: { size, n: 1 },
  } : {
    model: model || 'wanx-v1',
    input: { prompt: `${prompt}. Professional, high quality, safe for all audiences.` },
    parameters: { size, n: 1 },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Alibaba Image error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const taskId = data.output?.task_id;
  if (!taskId) throw new Error('Alibaba Image: no task_id returned');

  // Poll for result (max 60s)
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const statusRes = await fetch(`${ALIBABA_INTL_ENDPOINT}/api/v1/tasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    const statusData = await statusRes.json();
    const status = statusData.output?.task_status;
    
    if (status === 'SUCCEEDED') {
      const imageUrl = statusData.output?.results?.[0]?.url;
      console.log(`[Alibaba-Image] ✅ Generated: ${imageUrl?.substring(0, 60)}...`);
      return { content: imageUrl || '', imageUrl, isImage: true, usage: statusData.usage };
    }
    if (status === 'FAILED') {
      throw new Error(`Alibaba Image task failed: ${JSON.stringify(statusData.output)}`);
    }
  }
  throw new Error('Alibaba Image: timeout waiting for result');
}

/**
 * Alibaba Qwen3 TTS (Text-to-Speech)
 * Uses DashScope native speech synthesis API
 */
async function ttsWithAlibaba(text: string, voice: string, language: string) {
  const apiKey = getAlibabaKey();
  const voiceName = voice !== 'default' ? voice : 'Cherry';
  
  // Use qwen3-tts-flash (confirmed available in Singapore workspace)
  const model = 'qwen3-tts-flash';
  console.log(`[Alibaba-TTS] Generating speech via ${model}, voice=${voiceName}, lang=${language}`);
  
  try {
    // DashScope multimodal-generation endpoint for Qwen3-TTS
    const response = await fetch(`${ALIBABA_INTL_ENDPOINT}/api/v1/services/aigc/multimodal-generation/generation`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${apiKey}`, 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: { text },
        parameters: { voice: voiceName },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`[Alibaba-TTS] ${model} error: ${response.status} - ${err}`);
      console.log('[Alibaba-TTS] Falling back to ElevenLabs');
      return await ttsWithElevenLabs(text, voice);
    }

    // Check content type
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('audio')) {
      const buffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      return {
        audioUrl: `data:audio/mpeg;base64,${base64}`,
        duration: text.length / 15,
        voice: voiceName,
        provider: 'alibaba_qwen3_tts_flash',
        timestamp: new Date().toISOString(),
      };
    }
    
    const data = await response.json();
    
    // Check for audio URL
    const audioUrl = data.output?.audio?.url || data.output?.audio;
    if (audioUrl && typeof audioUrl === 'string' && audioUrl.startsWith('http')) {
      return {
        audioUrl,
        duration: text.length / 15,
        voice: voiceName,
        provider: 'alibaba_qwen3_tts_flash',
        timestamp: new Date().toISOString(),
      };
    }
    
    // Check for base64 audio
    const audioBase64 = data.output?.audio?.data;
    if (audioBase64) {
      return {
        audioUrl: `data:audio/mpeg;base64,${audioBase64}`,
        duration: text.length / 15,
        voice: voiceName,
        provider: 'alibaba_qwen3_tts_flash',
        timestamp: new Date().toISOString(),
      };
    }
    
    console.log('[Alibaba-TTS] No audio data, falling back to ElevenLabs');
    return await ttsWithElevenLabs(text, voice);
  } catch (error) {
    console.error('[Alibaba-TTS] Exception:', error);
    return await ttsWithElevenLabs(text, voice);
  }
}

/**
 * Alibaba Paraformer STT (Speech-to-Text) - Async task
 */
async function sttWithAlibaba(audio: string, language?: string) {
  const apiKey = getAlibabaKey();
  const audioContent = audio.replace(/^data:audio\/\w+;base64,/, '');

  // Use qwen3-asr-flash-realtime (confirmed available in Singapore)
  const model = 'qwen3-asr-flash-realtime';
  console.log(`[Alibaba-STT] Submitting ${model} transcription task`);
  
  try {
    const response = await fetch(`${ALIBABA_INTL_ENDPOINT}/api/v1/services/audio/asr/transcription`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model,
        input: { file_urls: [] },
        parameters: { language_hints: [language || 'en'] },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`[Alibaba-STT] ${model} error: ${err}`);
      
      // Try fun-asr as fallback
      console.log('[Alibaba-STT] Trying fun-asr...');
      const fallbackRes = await fetch(`${ALIBABA_INTL_ENDPOINT}/api/v1/services/audio/asr/transcription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable',
        },
        body: JSON.stringify({
          model: 'fun-asr',
          input: { file_urls: [] },
          parameters: { language_hints: [language || 'en'] },
        }),
      });
      
      if (!fallbackRes.ok) {
        console.log('[Alibaba-STT] Falling back to OpenAI Whisper');
        return await sttWithOpenAI(audio, language);
      }
      
      const fbData = await fallbackRes.json();
      return {
        text: fbData.output?.text || '',
        confidence: 0.9,
        language: language || 'en',
        provider: 'alibaba_fun_asr',
        timestamp: new Date().toISOString(),
      };
    }

    const data = await response.json();
    return {
      text: data.output?.text || '',
      confidence: 0.9,
      language: language || 'en',
      provider: 'alibaba_qwen3_asr',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Alibaba-STT] Exception:', error);
    return await sttWithOpenAI(audio, language);
  }
}

/**
 * Alibaba Wan 2.6 T2V (Video Generation) - Async task
 */
async function callAlibabaVideo(model: string, prompt: string, duration?: number, aspectRatio?: string) {
  const apiKey = getAlibabaKey();
  const sizeMap: Record<string, string> = {
    '16:9': '1280*720', '9:16': '720*1280', '1:1': '960*960',
  };
  const size = sizeMap[aspectRatio || '16:9'] || '1280*720';

  console.log(`[Alibaba-Video] Submitting ${model} task`);
  const response = await fetch(`${ALIBABA_INTL_ENDPOINT}/api/v1/services/aigc/video-generation/video-synthesis`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: model || 'wan2.6-t2v',
      input: { prompt },
      parameters: { size, duration: duration || 5 },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Alibaba Video error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const taskId = data.output?.task_id;
  if (!taskId) throw new Error('Alibaba Video: no task_id returned');

  // Return task ID for async polling (video gen takes minutes)
  return {
    content: `Video generation task submitted. Task ID: ${taskId}`,
    taskId,
    provider: 'alibaba_wan',
    model: model || 'wan2.6-t2v',
    status: 'processing',
    pollUrl: `${ALIBABA_INTL_ENDPOINT}/api/v1/tasks/${taskId}`,
  };
}