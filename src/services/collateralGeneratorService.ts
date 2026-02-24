/**
 * CollateralGenerator Service — Phase 7D
 *
 * Auto-generates marketing collaterals from production artifacts:
 *   Social cards, email banners, blog posts, show notes,
 *   social quotes, press releases, landing page heroes.
 *
 * Input: productionArtifacts + brandKit
 * Output: array of { type, format, content/url, platformTarget }
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────────────

export type CollateralType =
  | 'social_card'
  | 'email_banner'
  | 'blog_post'
  | 'show_notes'
  | 'social_quote'
  | 'press_release'
  | 'landing_hero';

export interface CollateralInput {
  title: string;
  description: string;
  script?: string;
  transcript?: string;
  thumbnailUrls?: string[];
  videoUrl?: string;
  brandKit?: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    fontFamily?: string;
    tagline?: string;
    companyName?: string;
  };
  language?: string;
  targetPlatforms?: string[];
}

export interface CollateralOutput {
  type: CollateralType;
  format: 'image' | 'text' | 'html' | 'markdown';
  content: string; // URL for images, text content for text/markdown
  platformTarget: string;
  dimensions?: { width: number; height: number };
  metadata?: Record<string, string>;
}

export interface CollateralBatch {
  id: string;
  createdAt: string;
  collaterals: CollateralOutput[];
  status: 'generating' | 'complete' | 'partial' | 'failed';
  errors: string[];
}

// ─── Collateral Definitions ─────────────────────────────────────────────────

const COLLATERAL_SPECS: Array<{
  type: CollateralType;
  format: CollateralOutput['format'];
  platforms: string[];
  dimensions?: { width: number; height: number };
  promptTemplate: string;
}> = [
  {
    type: 'social_card',
    format: 'image',
    platforms: ['facebook', 'linkedin', 'twitter'],
    dimensions: { width: 1200, height: 630 },
    promptTemplate: 'Create a professional social media card for: "{title}". Include the key message, use brand colors ({primaryColor}, {secondaryColor}). Style: clean, modern, eye-catching. Include company name: {companyName}.',
  },
  {
    type: 'social_card',
    format: 'image',
    platforms: ['instagram', 'threads'],
    dimensions: { width: 1080, height: 1080 },
    promptTemplate: 'Create a square social media card for Instagram: "{title}". Bold, visually striking, with key message overlay. Brand colors: {primaryColor}, {secondaryColor}. Company: {companyName}.',
  },
  {
    type: 'email_banner',
    format: 'image',
    platforms: ['email'],
    dimensions: { width: 600, height: 200 },
    promptTemplate: 'Create a professional email banner for: "{title}". Clean design, CTA-focused. Brand colors: {primaryColor}, {secondaryColor}. Width: 600px, Height: 200px.',
  },
  {
    type: 'blog_post',
    format: 'markdown',
    platforms: ['website', 'medium', 'linkedin'],
    promptTemplate: `Write a blog post based on this video content:

Title: "{title}"
Description: {description}
Script/Transcript: {script}

Requirements:
- 800-1200 words
- SEO-optimized with headers (H2, H3)
- Include a compelling introduction
- Break key points into sections
- End with a call to action
- Write in {language}`,
  },
  {
    type: 'show_notes',
    format: 'markdown',
    platforms: ['podcast', 'website'],
    promptTemplate: `Generate podcast/video show notes from this transcript:

Title: "{title}"
Transcript: {script}

Include:
- Episode summary (2-3 sentences)
- Key topics discussed (bulleted)
- Timestamps for major sections
- Guest information (if mentioned)
- Links and resources mentioned
- Call to action`,
  },
  {
    type: 'social_quote',
    format: 'text',
    platforms: ['twitter', 'instagram', 'linkedin', 'threads'],
    promptTemplate: `Extract 5 compelling, shareable quotes from this content:

Title: "{title}"
Script: {script}

For each quote:
- Keep under 280 characters
- Make it standalone (understandable without context)
- Include a relevant emoji
- Add 2-3 relevant hashtags`,
  },
  {
    type: 'press_release',
    format: 'text',
    platforms: ['pr', 'website'],
    promptTemplate: `Write a press release for the following content:

Title: "{title}"
Description: {description}
Company: {companyName}
Tagline: {tagline}

Format:
- Headline
- Subheadline
- Dateline and lead paragraph
- 2-3 body paragraphs
- Quote from company representative
- About section (boilerplate)
- Contact information placeholder`,
  },
  {
    type: 'landing_hero',
    format: 'html',
    platforms: ['website', 'landing_page'],
    promptTemplate: `Generate a landing page hero section HTML for:

Title: "{title}"
Description: {description}
CTA: Watch Now
Video URL: {videoUrl}
Brand Colors: {primaryColor}, {secondaryColor}

Return minimal, responsive HTML with:
- Full-width background video (autoplay, muted, loop)
- Overlay with title text
- Description text
- CTA button
- Inline CSS only`,
  },
];

// ─── Generator ──────────────────────────────────────────────────────────────

export async function generateCollaterals(
  input: CollateralInput,
  types?: CollateralType[],
  onProgress?: (progress: number, type: CollateralType) => void,
): Promise<CollateralBatch> {
  const batch: CollateralBatch = {
    id: `collateral-${Date.now()}`,
    createdAt: new Date().toISOString(),
    collaterals: [],
    status: 'generating',
    errors: [],
  };

  // Filter specs by requested types (or generate all)
  const specs = types
    ? COLLATERAL_SPECS.filter(s => types.includes(s.type))
    : COLLATERAL_SPECS;

  // Further filter by target platforms if specified
  const filteredSpecs = input.targetPlatforms
    ? specs.filter(s => s.platforms.some(p => input.targetPlatforms!.includes(p)))
    : specs;

  const total = filteredSpecs.length;

  for (let i = 0; i < filteredSpecs.length; i++) {
    const spec = filteredSpecs[i];
    onProgress?.(Math.round(((i + 1) / total) * 100), spec.type);

    try {
      // Build prompt from template
      const prompt = spec.promptTemplate
        .replace(/\{title\}/g, input.title || 'Untitled')
        .replace(/\{description\}/g, input.description || '')
        .replace(/\{script\}/g, input.script || input.transcript || input.description || '')
        .replace(/\{videoUrl\}/g, input.videoUrl || '')
        .replace(/\{language\}/g, input.language || 'English')
        .replace(/\{primaryColor\}/g, input.brandKit?.primaryColor || '#6366f1')
        .replace(/\{secondaryColor\}/g, input.brandKit?.secondaryColor || '#8b5cf6')
        .replace(/\{companyName\}/g, input.brandKit?.companyName || 'GenieSuite')
        .replace(/\{tagline\}/g, input.brandKit?.tagline || '');

      if (spec.format === 'image') {
        // Generate image collateral via AI image generation
        const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
          body: {
            action: 'image_generation',
            provider: 'gemini',
            prompt,
            aspectRatio: spec.dimensions
              ? `${spec.dimensions.width}:${spec.dimensions.height}`
              : '16:9',
          },
        });

        if (!error && data?.imageUrl) {
          batch.collaterals.push({
            type: spec.type,
            format: 'image',
            content: data.imageUrl,
            platformTarget: spec.platforms.join(', '),
            dimensions: spec.dimensions,
          });
        } else {
          batch.errors.push(`${spec.type}: Image generation failed`);
        }
      } else {
        // Generate text/markdown/html content via LLM
        const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
          body: {
            provider: 'gemini',
            model: 'gemini-2.5-flash',
            prompt,
            temperature: 0.7,
            maxTokens: 3000,
          },
        });

        if (!error && data?.content) {
          batch.collaterals.push({
            type: spec.type,
            format: spec.format,
            content: data.content,
            platformTarget: spec.platforms.join(', '),
          });
        } else {
          batch.errors.push(`${spec.type}: Content generation failed`);
        }
      }
    } catch (err) {
      batch.errors.push(`${spec.type}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Determine final status
  if (batch.collaterals.length === 0) {
    batch.status = 'failed';
  } else if (batch.errors.length > 0) {
    batch.status = 'partial';
  } else {
    batch.status = 'complete';
  }

  return batch;
}

// ─── Convenience: Generate derivatives after production approval ─────────────

export async function generatePostProductionDerivatives(
  productionId: string,
  input: CollateralInput,
  onProgress?: (phase: string, progress: number) => void,
): Promise<{
  collaterals: CollateralBatch;
  clips: { success: boolean; clipCount: number };
  shorts: { success: boolean; shortCount: number };
}> {
  // Phase 1: Collaterals
  onProgress?.('collaterals', 0);
  const collaterals = await generateCollaterals(input, undefined, (p) => {
    onProgress?.('collaterals', p);
  });

  // Phase 2: Magic clips (AI-analyzed highlight clips)
  onProgress?.('clips', 0);
  let clips = { success: false, clipCount: 0 };
  if (input.videoUrl) {
    try {
      const { data, error } = await supabase.functions.invoke('magic-clips-generator', {
        body: {
          mode: 'auto',
          videoUrl: input.videoUrl,
          title: input.title,
          description: input.description,
          platforms: input.targetPlatforms || ['youtube_shorts', 'tiktok', 'instagram_reels'],
          maxClips: 5,
        },
      });
      if (!error && data) {
        clips = { success: true, clipCount: data.clips?.length || 0 };
      }
    } catch {
      // Non-blocking
    }
  }
  onProgress?.('clips', 100);

  // Phase 3: Shorts (viral-scored short clips)
  onProgress?.('shorts', 0);
  let shorts = { success: false, shortCount: 0 };
  if (input.videoUrl) {
    try {
      const { data, error } = await supabase.functions.invoke('shorts-generator', {
        body: {
          action: 'generate',
          videoUrl: input.videoUrl,
          title: input.title,
          script: input.script || input.transcript,
          platforms: ['tiktok', 'reels', 'shorts'],
          maxDuration: 60,
        },
      });
      if (!error && data) {
        shorts = { success: true, shortCount: data.shorts?.length || 0 };
      }
    } catch {
      // Non-blocking
    }
  }
  onProgress?.('shorts', 100);

  return { collaterals, clips, shorts };
}
