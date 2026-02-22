/**
 * Zero to Video Hero Pipeline
 *
 * The killer differentiator: natural language → finished video in <5 minutes.
 * No competitor does this. CapCut requires you to KNOW what to create.
 * GenieSuite TELLS you what to create AND makes it.
 *
 * Flow:
 *   "I sell samosas near the station"
 *     → [1] Brand inference (tier, archetype, region)
 *     → [2] Script generation (via SmartContentPipeline)
 *     → [3] Voice generation (auto-selected provider)
 *     → [4] Music generation (mood-matched)
 *     → [5] Production episode created
 *     → Output: Ready-to-post video metadata
 *
 * Usage:
 *   import { zeroToHeroPipeline } from '@/services/production/zeroToHeroPipeline';
 *
 *   const result = await zeroToHeroPipeline.createFromDescription(
 *     "I sell samosas near the station in Delhi",
 *     { onStep: (step) => console.log(step) }
 *   );
 */

import { supabase } from '@/integrations/supabase/client';
import { productionEpisodesService } from './productionEpisodesService';
import { pipelineSupervisor } from './pipelineSupervisor';

// ─── Types ──────────────────────────────────────────────────────────────────

export type HeroStep =
  | 'brand_inference'
  | 'script_generation'
  | 'voice_generation'
  | 'music_generation'
  | 'episode_creation'
  | 'complete';

export interface HeroStepUpdate {
  step: HeroStep;
  status: 'started' | 'completed' | 'failed';
  data?: Record<string, unknown>;
  error?: string;
}

export interface HeroInput {
  description: string;
  language?: string;
  region?: string;
  platform?: 'whatsapp' | 'instagram' | 'youtube' | 'tiktok' | 'linkedin' | 'general';
  videoDuration?: number;
  onStep?: (update: HeroStepUpdate) => void;
}

export interface BrandInference {
  businessTier: string;
  businessType: string;
  region: string;
  language: string;
  tone: string;
  suggestedStyle: string;
  suggestedMusicMood: string;
}

export interface HeroResult {
  success: boolean;
  episodeId: string | null;
  jobId: string | null;
  brandInference: BrandInference | null;
  scriptContent: string | null;
  error: string | null;
  totalTimeMs: number;
}

// ─── Brand Inference ────────────────────────────────────────────────────────

function inferBrand(description: string, inputRegion?: string, inputLanguage?: string): BrandInference {
  const desc = description.toLowerCase();

  // Tier inference
  let businessTier = 'nano';
  if (desc.includes('enterprise') || desc.includes('corporation') || desc.includes('global')) {
    businessTier = 'enterprise';
  } else if (desc.includes('company') || desc.includes('agency') || desc.includes('firm')) {
    businessTier = 'medium';
  } else if (desc.includes('shop') || desc.includes('store') || desc.includes('restaurant')) {
    businessTier = 'small';
  } else if (desc.includes('freelanc') || desc.includes('coach') || desc.includes('consult')) {
    businessTier = 'micro';
  }

  // Region inference from context clues
  let region = inputRegion || 'global';
  const regionClues: Record<string, string[]> = {
    'in-north': ['delhi', 'mumbai', 'kolkata', 'lucknow', 'jaipur', 'samosa', 'chai', 'paneer', 'biryani'],
    'in-south': ['chennai', 'bangalore', 'hyderabad', 'kerala', 'dosa', 'idli', 'tamil'],
    'ng-west': ['lagos', 'nigeria', 'naija', 'suya', 'jollof'],
    'ke-east': ['nairobi', 'kenya', 'ugali', 'mama mboga'],
    'mx-central': ['mexico', 'taco', 'ciudad'],
    'jp': ['tokyo', 'japan', 'ramen', 'sushi'],
    'us': ['new york', 'california', 'texas', 'american'],
    'ae-gulf': ['dubai', 'abu dhabi', 'sharjah', 'shawarma'],
    'eg-nile': ['cairo', 'egypt', 'koshary'],
  };

  if (!inputRegion) {
    for (const [code, clues] of Object.entries(regionClues)) {
      if (clues.some((c) => desc.includes(c))) {
        region = code;
        break;
      }
    }
  }

  // Language inference
  const language = inputLanguage || 'en';

  // Tone inference
  const tone = businessTier === 'nano' || businessTier === 'micro'
    ? 'casual'
    : businessTier === 'enterprise'
    ? 'professional'
    : 'enthusiastic';

  // Style inference
  const styleMap: Record<string, string> = {
    nano: 'motion_graphics',
    micro: 'motion_graphics',
    small: 'realistic',
    medium: 'corporate',
    enterprise: 'cinematic',
  };

  // Music mood inference
  const moodMap: Record<string, string> = {
    nano: 'upbeat',
    micro: 'energetic',
    small: 'warm',
    medium: 'confident',
    enterprise: 'inspirational',
  };

  return {
    businessTier,
    businessType: 'general',
    region,
    language,
    tone,
    suggestedStyle: styleMap[businessTier] || 'motion_graphics',
    suggestedMusicMood: moodMap[businessTier] || 'upbeat',
  };
}

// ─── Script Generation ──────────────────────────────────────────────────────

async function generateScript(
  description: string,
  brand: BrandInference,
  platform: string,
  duration: number
): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('enhance-script', {
      body: {
        script: description,
        enhancementType: 'expand',
        instructions: [
          `Create a ${duration}-second promotional video script for a ${brand.businessTier} business.`,
          `Business description: ${description}`,
          `Tone: ${brand.tone}`,
          `Target platform: ${platform}`,
          `Region: ${brand.region}`,
          `Include: hook (first 3 seconds), value proposition, call-to-action.`,
          `Keep it concise and compelling for ${platform}.`,
        ].join(' '),
        tone: brand.tone,
        targetAudience: 'potential customers',
      },
    });

    if (error) throw error;
    return data?.data?.enhancedScript || data?.data?.cleanScript || description;
  } catch (err) {
    console.error('Script generation failed:', err);
    // Fallback: structured script from description
    return [
      `[HOOK] Discover the best ${description.slice(0, 50)}!`,
      `[VALUE] ${description}`,
      `[CTA] Visit us today and experience the difference!`,
    ].join('\n\n');
  }
}

// ─── Pipeline ───────────────────────────────────────────────────────────────

export const zeroToHeroPipeline = {
  /** Full pipeline: description → production episode with voice + music */
  async createFromDescription(input: HeroInput): Promise<HeroResult> {
    const startTime = Date.now();
    const { description, platform = 'instagram', videoDuration = 30, onStep } = input;

    let brandInference: BrandInference | null = null;
    let scriptContent: string | null = null;
    let episodeId: string | null = null;
    let jobId: string | null = null;

    try {
      // ── Step 1: Brand Inference ──
      onStep?.({ step: 'brand_inference', status: 'started' });
      brandInference = inferBrand(description, input.region, input.language);
      onStep?.({ step: 'brand_inference', status: 'completed', data: brandInference as any });

      // ── Step 2: Script Generation ──
      onStep?.({ step: 'script_generation', status: 'started' });
      scriptContent = await generateScript(description, brandInference, platform, videoDuration);
      onStep?.({ step: 'script_generation', status: 'completed', data: { scriptContent } });

      // ── Step 3: Create Production Episode ──
      onStep?.({ step: 'episode_creation', status: 'started' });

      // Save script to DB
      const { data: authData } = await supabase.auth.getUser();
      let scriptId: string | null = null;

      if (authData.user) {
        const { data: savedScript } = await supabase
          .from('genie_scripts')
          .insert({
            user_id: authData.user.id,
            name: `Hero: ${description.slice(0, 50)}`,
            content: scriptContent,
            type: 'video',
            source: 'spark',
            stats: {
              wordCount: scriptContent.split(/\s+/).length,
              estimatedDuration: videoDuration,
            },
          })
          .select('id')
          .single();

        scriptId = savedScript?.id || null;
      }

      // Create episode
      const episode = await productionEpisodesService.create({
        title: `Hero: ${description.slice(0, 50)}`,
        sparkScriptId: scriptId || undefined,
        metadata: {
          source: 'zero-to-hero',
          brandInference,
          platform,
          description,
        },
      });
      episodeId = episode.id;
      onStep?.({ step: 'episode_creation', status: 'completed', data: { episodeId } });

      // ── Step 4: Start Production Pipeline (voice + music in parallel) ──
      onStep?.({ step: 'voice_generation', status: 'started' });
      const job = await pipelineSupervisor.startProduction({
        scriptContent,
        scriptId: scriptId || undefined,
        episodeId,
        voiceProvider: 'elevenlabs',
        language: brandInference.language,
        includeMusic: true,
        musicMood: brandInference.suggestedMusicMood,
        musicGenre: 'corporate',
        includeVideo: false, // Video generation is optional / Cast handles this
        qualityThreshold: 80,
        onTaskUpdate: (task) => {
          if (task.agentName === 'voice-director' && task.status === 'complete') {
            onStep?.({ step: 'voice_generation', status: 'completed' });
            onStep?.({ step: 'music_generation', status: 'started' });
          }
          if (task.agentName === 'music-composer' && task.status === 'complete') {
            onStep?.({ step: 'music_generation', status: 'completed' });
          }
        },
      });
      jobId = job.id;

      onStep?.({ step: 'complete', status: 'completed', data: { episodeId, jobId } });

      return {
        success: true,
        episodeId,
        jobId,
        brandInference,
        scriptContent,
        error: null,
        totalTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      const failedStep: HeroStep = !brandInference
        ? 'brand_inference'
        : !scriptContent
        ? 'script_generation'
        : !episodeId
        ? 'episode_creation'
        : 'voice_generation';

      onStep?.({ step: failedStep, status: 'failed', error: err.message });

      return {
        success: false,
        episodeId,
        jobId,
        brandInference,
        scriptContent,
        error: err.message,
        totalTimeMs: Date.now() - startTime,
      };
    }
  },

  /** Get suggested content ideas based on brand inference */
  getSuggestedContent(brand: BrandInference): Array<{
    title: string;
    type: string;
    platform: string;
    duration: number;
  }> {
    const suggestions = [
      { title: 'Quick Promo Video', type: 'promo', platform: 'instagram', duration: 15 },
      { title: 'Product Showcase', type: 'showcase', platform: 'youtube', duration: 60 },
      { title: 'Customer Testimonial', type: 'testimonial', platform: 'linkedin', duration: 30 },
      { title: 'Behind the Scenes', type: 'bts', platform: 'tiktok', duration: 15 },
    ];

    // Add tier-specific suggestions
    if (brand.businessTier === 'nano' || brand.businessTier === 'micro') {
      suggestions.unshift({
        title: 'WhatsApp Status Ad',
        type: 'status_ad',
        platform: 'whatsapp',
        duration: 15,
      });
    }
    if (brand.businessTier === 'enterprise') {
      suggestions.push({
        title: 'Investor Pitch',
        type: 'pitch',
        platform: 'linkedin',
        duration: 90,
      });
    }

    return suggestions;
  },
};
