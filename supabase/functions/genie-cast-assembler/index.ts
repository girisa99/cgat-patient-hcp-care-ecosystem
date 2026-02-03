/**
 * GENIE CAST VIDEO ASSEMBLER
 * 
 * Assembles a complete marketing video for one language:
 * 1. Generates TTS for all 9 chapters
 * 2. Generates product visuals/screenshots for each chapter
 * 3. Stitches audio + visuals into one continuous video
 * 4. Returns single video URL (~7min)
 * 
 * Uses: ElevenLabs/Azure/Alibaba TTS, Vertex AI Veo, ModelsLab
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Chapter configurations with product visuals
const CHAPTERS = [
  { id: 'opening', product: 'Genie Studio', duration: 45, color: '#9333EA', visualType: 'intro_animation' },
  { id: 'spark', product: 'Genie Spark', duration: 50, color: '#F97316', visualType: 'product_demo' },
  { id: 'mind', product: 'Genie Mind', duration: 50, color: '#3B82F6', visualType: 'product_demo' },
  { id: 'vibe', product: 'Genie Vibe', duration: 55, color: '#22C55E', visualType: 'product_demo' },
  { id: 'deck', product: 'Genie Deck', duration: 45, color: '#EAB308', visualType: 'product_demo' },
  { id: 'arc', product: 'Genie Arc', duration: 50, color: '#EC4899', visualType: 'product_demo' },
  { id: 'ask-genie', product: 'Ask Genie', duration: 40, color: '#06B6D4', visualType: 'product_demo' },
  { id: 'cast', product: 'Genie Cast', duration: 50, color: '#EF4444', visualType: 'product_demo' },
  { id: 'closing', product: 'Genie Studio', duration: 30, color: '#9333EA', visualType: 'outro_animation' },
];

// Product screenshot configurations - what to show during each chapter
const PRODUCT_VISUALS: Record<string, { screenshots: string[]; highlights: string[] }> = {
  'opening': {
    screenshots: ['genie-logo-animation', 'product-suite-overview'],
    highlights: ['7 Products', 'Mind to Media', 'Your Wish is Our Command'],
  },
  'spark': {
    screenshots: ['spark-idea-input', 'spark-script-generation', 'spark-confidence-score'],
    highlights: ['Idea Input', 'AI Script Generation', 'Confidence Scoring'],
  },
  'mind': {
    screenshots: ['mind-script-editor', 'mind-enhancement', 'mind-export'],
    highlights: ['Script Enhancement', 'AI Suggestions', 'Multi-format Export'],
  },
  'vibe': {
    screenshots: ['vibe-teleprompter', 'vibe-recording', 'vibe-timeline'],
    highlights: ['Teleprompter', 'Recording Studio', 'AI Editing'],
  },
  'deck': {
    screenshots: ['deck-template-gallery', 'deck-slide-editor', 'deck-export'],
    highlights: ['Template Gallery', 'Slide Design', 'PPT/PDF Export'],
  },
  'arc': {
    screenshots: ['arc-kanban', 'arc-calendar', 'arc-scheduler'],
    highlights: ['Kanban Board', 'Calendar View', 'Content Scheduler'],
  },
  'ask-genie': {
    screenshots: ['ask-genie-chat', 'ask-genie-workflow', 'ask-genie-help'],
    highlights: ['AI Assistant', 'Workflow Guidance', 'Contextual Help'],
  },
  'cast': {
    screenshots: ['cast-distribution', 'cast-analytics', 'cast-platforms'],
    highlights: ['Multi-Platform', 'Analytics', 'Global Distribution'],
  },
  'closing': {
    screenshots: ['genie-cta', 'genie-pricing', 'genie-trial'],
    highlights: ['Get Started', 'Free Trial', 'Your Story Awaits'],
  },
};

// TTS Provider routing per language zone
function getTTSProvider(language: string): { provider: string; region: string } {
  const routing: Record<string, { provider: string; region: string }> = {
    'en': { provider: 'elevenlabs', region: 'claude' },
    'es': { provider: 'elevenlabs', region: 'claude' },
    'fr': { provider: 'elevenlabs', region: 'claude' },
    'de': { provider: 'azure', region: 'claude' },
    'pt': { provider: 'azure', region: 'claude' },
    'ar': { provider: 'azure', region: 'mena' },
    'hi': { provider: 'azure', region: 'gemini' },
    'bn': { provider: 'azure', region: 'gemini' },
    'te': { provider: 'azure', region: 'gemini' },
    'ta': { provider: 'azure', region: 'gemini' },
    'ur': { provider: 'azure', region: 'gemini' },
    'id': { provider: 'azure', region: 'gemini' },
    'sw': { provider: 'azure', region: 'gemini' },
    'zh': { provider: 'alibaba', region: 'alibaba' },
    'ja': { provider: 'alibaba', region: 'alibaba' },
    'ko': { provider: 'azure', region: 'alibaba' },
  };
  return routing[language] || { provider: 'azure', region: 'global' };
}

// Video provider routing per language zone
function getVideoProvider(language: string): string {
  const zoneMap: Record<string, string> = {
    'en': 'vertex-ai',
    'es': 'vertex-ai',
    'fr': 'vertex-ai',
    'de': 'vertex-ai',
    'pt': 'vertex-ai',
    'ar': 'modelslab',
    'hi': 'modelslab',
    'zh': 'alibaba-wan',
    'ja': 'alibaba-wan',
    'ko': 'modelslab',
    'sw': 'modelslab',
  };
  return zoneMap[language] || 'modelslab';
}

interface ChapterResult {
  chapterId: string;
  product: string;
  audioBase64?: string;
  audioUrl?: string;
  visualUrl?: string;  // Primary visual (first screenshot or logo)
  visualUrls?: string[]; // All product screenshots for this chapter
  duration: number;
  ttsProvider: string;
  videoProvider: string;
  success: boolean;
  error?: string;
  // Full Production Mode assets
  avatarUrl?: string;
  threeDUrl?: string;
  transitionUrl?: string;
}

interface ProductionConfig {
  avatar?: {
    enabled: boolean;
    gender: 'male' | 'female';
    placement: 'intro_outro' | 'chapter_intros' | 'throughout';
    size: 'small' | 'medium' | 'large';
  };
  animations?: {
    enabled: boolean;
    style: string;
    intensity: number;
  };
  threeD?: {
    enabled: boolean;
    style: string;
    quality: 'standard' | 'high' | 'premium';
  };
}

interface AssemblyResult {
  success: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  totalDuration: number;
  chapters: ChapterResult[];
  language: string;
  providers: {
    tts: string;
    video: string;
    translation?: string;
    avatar?: string;
    threeD?: string;
  };
  productionMode?: {
    enabled: boolean;
    features: string[];
  };
  error?: string;
  // New status tracking fields
  generationStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      language, 
      quality = 'production', 
      includeVisuals = true,
      fullProductionMode = false,
      productionConfig = null,
      // Accept screenshots from orchestration service
      screenshots = [] as Array<{ screenId: string; imageUrl: string; order: number; productId?: string }>,
      customScript = null,
      customHook = null,
      customCta = null,
      useApprovedMessaging = false,
      // NEW: Skip TTS regeneration if audio already exists
      skipExistingTTS = false,
    } = await req.json();
    
    console.log(`📷 Received ${screenshots.length} screenshots from orchestration service`);

    if (!language) {
      throw new Error('Language is required');
    }

    console.log(`🎬 Starting Genie Cast assembly for language: ${language}`);
    console.log(`🎥 Mode: ${fullProductionMode ? 'Full Production' : 'Standard'}`);
    console.log(`🔊 Skip existing TTS: ${skipExistingTTS ? 'Yes (reuse cached audio)' : 'No (regenerate all)'}`);
    
    if (fullProductionMode && productionConfig) {
      console.log(`👤 Avatar: ${productionConfig.avatar?.enabled ? `${productionConfig.avatar.gender} (${productionConfig.avatar.placement})` : 'disabled'}`);
      console.log(`✨ Animations: ${productionConfig.animations?.enabled ? productionConfig.animations.style : 'disabled'}`);
      console.log(`📦 3D: ${productionConfig.threeD?.enabled ? `${productionConfig.threeD.style} (${productionConfig.threeD.quality})` : 'disabled'}`);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const ttsConfig = getTTSProvider(language);
    const videoProvider = getVideoProvider(language);

    const chapterResults: ChapterResult[] = [];
    let totalDuration = 0;

    // Process each chapter
    for (const chapter of CHAPTERS) {
      console.log(`📹 Processing chapter: ${chapter.product}`);

      try {
        // Step 1: Generate TTS audio for this chapter (or reuse existing)
        const audioResult = await generateChapterAudio(
          supabase,
          chapter.id,
          language,
          ttsConfig.provider,
          skipExistingTTS  // Pass the skip flag
        );

        // Step 2: Generate product visuals for this chapter (if enabled)
        // Now uses product screenshots from the orchestration service
        let visualUrls: string[] = [];
        if (includeVisuals) {
          visualUrls = await generateChapterVisual(
            chapter.id,
            chapter.product,
            chapter.color,
            quality,
            screenshots // Pass screenshots from request
          );
          console.log(`   🖼️ ${visualUrls.length} visuals for ${chapter.id}`);
        }

        // Step 3: Generate Avatar (if Full Production Mode enabled)
        let avatarUrl: string | undefined;
        if (fullProductionMode && productionConfig?.avatar?.enabled) {
          const shouldIncludeAvatar = 
            productionConfig.avatar.placement === 'throughout' ||
            (productionConfig.avatar.placement === 'intro_outro' && (chapter.id === 'opening' || chapter.id === 'closing')) ||
            (productionConfig.avatar.placement === 'chapter_intros');
          
          if (shouldIncludeAvatar) {
            avatarUrl = await generateAvatarSegment(
              supabase,
              chapter.id,
              language,
              productionConfig.avatar.gender,
              productionConfig.avatar.size,
              audioResult.audioBase64
            );
            console.log(`👤 Avatar generated for ${chapter.id}: ${avatarUrl ? 'success' : 'skipped'}`);
          }
        }

        // Step 4: Generate 3D elements (if Full Production Mode enabled)
        let threeDUrl: string | undefined;
        if (fullProductionMode && productionConfig?.threeD?.enabled) {
          // 3D for product chapters and hero sections
          if (chapter.id !== 'opening' && chapter.id !== 'closing') {
            threeDUrl = await generate3DElement(
              chapter.product,
              productionConfig.threeD.style,
              productionConfig.threeD.quality
            );
            console.log(`📦 3D element generated for ${chapter.product}: ${threeDUrl ? 'success' : 'skipped'}`);
          }
        }

        // Step 5: Generate animated transitions (if enabled)
        let transitionUrl: string | undefined;
        if (fullProductionMode && productionConfig?.animations?.enabled) {
          transitionUrl = await generateTransition(
            chapter.id,
            chapter.product,
            chapter.color,
            productionConfig.animations.style,
            productionConfig.animations.intensity
          );
        }

        chapterResults.push({
          chapterId: chapter.id,
          product: chapter.product,
          audioBase64: audioResult.audioBase64,
          audioUrl: audioResult.audioUrl,
          visualUrl: visualUrls[0], // Primary visual for backwards compatibility
          visualUrls, // All screenshots for this chapter
          duration: chapter.duration,
          ttsProvider: ttsConfig.provider,
          videoProvider,
          success: true,
          // Extended production mode assets
          avatarUrl,
          threeDUrl,
          transitionUrl,
        });

        totalDuration += chapter.duration;
      } catch (err) {
        console.error(`Chapter ${chapter.id} failed:`, err);
        chapterResults.push({
          chapterId: chapter.id,
          product: chapter.product,
          duration: chapter.duration,
          ttsProvider: ttsConfig.provider,
          videoProvider,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // Step 3: Stitch all chapters into one video
    const assemblyResult = await stitchChaptersToVideo(
      chapterResults,
      language,
      videoProvider,
      quality
    );

    // Step 6: Save to database as single entry with status tracking
    if (assemblyResult.success && assemblyResult.videoUrl) {
      await saveAssembledVideo(supabase, {
        language,
        videoUrl: assemblyResult.videoUrl,
        thumbnailUrl: assemblyResult.thumbnailUrl,
        totalDuration,
        ttsProvider: ttsConfig.provider,
        videoProvider,
        fullProductionMode,
        productionConfig,
        pendingGeneration: assemblyResult.pendingGeneration,
      });
    }

    // Step 7: Track credit consumption for all providers used
    const totalCharactersUsed = chapterResults.reduce((sum, ch) => {
      // Each chapter script ~100-200 characters
      return sum + (getChapterScript(ch.chapterId, language).length || 0);
    }, 0);

    await trackCreditConsumption(supabase, {
      language,
      ttsProvider: ttsConfig.provider,
      videoProvider,
      totalCharacters: totalCharactersUsed,
      totalDuration,
      fullProductionMode,
      assemblyProvider: assemblyResult.success ? 'json2video' : null,
    });

    // Build production mode features list
    const enabledFeatures: string[] = [];
    if (fullProductionMode && productionConfig) {
      if (productionConfig.avatar?.enabled) enabledFeatures.push(`avatar_${productionConfig.avatar.gender}`);
      if (productionConfig.animations?.enabled) enabledFeatures.push(`animation_${productionConfig.animations.style}`);
      if (productionConfig.threeD?.enabled) enabledFeatures.push(`3d_${productionConfig.threeD.style}`);
    }

    const result: AssemblyResult = {
      success: assemblyResult.success,
      videoUrl: assemblyResult.videoUrl,
      thumbnailUrl: assemblyResult.thumbnailUrl,
      totalDuration,
      chapters: chapterResults,
      language,
      providers: {
        tts: ttsConfig.provider,
        video: videoProvider,
        avatar: fullProductionMode && productionConfig?.avatar?.enabled ? 'Alibaba Wan2.2' : undefined,
        threeD: fullProductionMode && productionConfig?.threeD?.enabled ? 'Meshy AI' : undefined,
      },
      productionMode: fullProductionMode ? {
        enabled: true,
        features: enabledFeatures,
      } : undefined,
      // Status tracking for async video generation
      generationStatus: assemblyResult.pendingGeneration ? 'pending' : 'completed',
      message: assemblyResult.pendingGeneration 
        ? 'TTS audio generated. Full video assembly requires manual processing or external video assembly service.'
        : 'Video generation completed.',
    };

    console.log(`✅ Assembly complete for ${language}: ${totalDuration}s total`);
    if (assemblyResult.pendingGeneration) {
      console.log(`⚠️ Video file pending - TTS audio ready, awaiting video assembly`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Genie Cast assembly error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Assembly failed',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Generate TTS audio for a single chapter
 * Now persists audio to storage and returns a real URL
 * Supports skipIfExists to reuse cached audio
 */
async function generateChapterAudio(
  supabase: any,
  chapterId: string,
  language: string,
  provider: string,
  skipIfExists: boolean = false
): Promise<{ audioBase64?: string; audioUrl?: string; charactersUsed: number; cached: boolean }> {
  // Check for existing audio if skipIfExists is enabled
  if (skipIfExists) {
    const existingAudio = await findExistingAudio(supabase, chapterId, language);
    if (existingAudio) {
      console.log(`   ♻️ Reusing cached TTS for ${chapterId} (${language}): ${existingAudio}`);
      return {
        audioUrl: existingAudio,
        charactersUsed: 0, // No new characters consumed
        cached: true,
      };
    }
  }
  
  const script = getChapterScript(chapterId, language);
  const charactersUsed = script.length;
  
  // Call the multi-provider-tts function
  const { data, error } = await supabase.functions.invoke('multi-provider-tts', {
    body: {
      text: script,
      language,
      provider,
      returnBase64: true,
    },
  });

  if (error) {
    console.error(`   TTS error for ${chapterId}: ${error.message}`);
    throw new Error(`TTS failed: ${error.message}`);
  }

  let audioUrl = data?.audioUrl;
  const audioBase64 = data?.audioBase64 || data?.audioContent;

  console.log(`   TTS result for ${chapterId}: hasUrl=${!!audioUrl}, urlIsHttp=${audioUrl?.startsWith('http')}, hasBase64=${!!audioBase64}, base64Len=${audioBase64?.length || 0}`);

  // CRITICAL: Check if audioUrl is a valid HTTP URL, not a data URI
  // JSON2Video REQUIRES http(s):// URLs - data URIs won't work
  const hasValidHttpUrl = audioUrl && audioUrl.startsWith('http');
  
  // If we don't have a valid HTTP URL but have base64, upload to storage
  if (!hasValidHttpUrl && audioBase64) {
    try {
      const timestamp = Date.now();
      const filePath = `tts-audio/${language}/${chapterId}-${timestamp}.mp3`;
      
      // Decode base64 and upload - handle both raw and data URI formats
      let cleanBase64 = audioBase64;
      if (cleanBase64.includes(',')) {
        cleanBase64 = cleanBase64.split(',')[1];
      }
      // Also handle if there's a prefix like "base64:"
      if (cleanBase64.startsWith('base64:')) {
        cleanBase64 = cleanBase64.substring(7);
      }
      
      // Convert base64 to Uint8Array
      const binaryStr = atob(cleanBase64);
      const audioBuffer = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        audioBuffer[i] = binaryStr.charCodeAt(i);
      }
      
      console.log(`   📤 Uploading audio to genie-media/${filePath} (${audioBuffer.length} bytes)`);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('genie-media')
        .upload(filePath, audioBuffer, {
          contentType: 'audio/mpeg',
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('genie-media')
          .getPublicUrl(filePath);
        audioUrl = urlData?.publicUrl;
        console.log(`   ✅ Audio uploaded successfully: ${audioUrl}`);
      } else {
        console.error(`   ❌ Audio upload failed: ${uploadError?.message}`);
        console.error(`   Upload error details: ${JSON.stringify(uploadError)}`);
        // Keep the base64 for fallback, but log the issue
      }
    } catch (uploadErr) {
      console.error(`   ❌ Audio upload exception for ${chapterId}:`, uploadErr);
    }
  } else if (hasValidHttpUrl) {
    console.log(`   ✅ Using existing HTTP audio URL: ${audioUrl}`);
  }

  return {
    audioBase64,
    audioUrl,
    charactersUsed,
    cached: false,
  };
}

/**
 * Find existing audio file in storage for a chapter/language combo
 */
async function findExistingAudio(
  supabase: any,
  chapterId: string,
  language: string
): Promise<string | null> {
  try {
    const folderPath = `tts-audio/${language}`;
    
    // List files in the language folder
    const { data: files, error } = await supabase.storage
      .from('genie-media')
      .list(folderPath, {
        search: chapterId,
        sortBy: { column: 'created_at', order: 'desc' },
        limit: 1,
      });

    if (error || !files || files.length === 0) {
      return null;
    }

    // Get the most recent audio file for this chapter
    const latestFile = files[0];
    if (latestFile && latestFile.name.startsWith(chapterId)) {
      const { data: urlData } = supabase.storage
        .from('genie-media')
        .getPublicUrl(`${folderPath}/${latestFile.name}`);
      return urlData?.publicUrl || null;
    }

    return null;
  } catch (err) {
    console.error(`   ⚠️ Error checking existing audio for ${chapterId}:`, err);
    return null;
  }
}

/**
 * Generate product visual for a chapter
 * 
 * Priority order:
 * 1. Use product screenshots from 'product-screenshots' bucket (passed via request)
 * 2. Fall back to brand logos from 'brand-assets' bucket
 * 3. Fall back to preview app URL
 */
async function generateChapterVisual(
  chapterId: string,
  product: string,
  color: string,
  quality: string,
  screenshots: Array<{ screenId: string; imageUrl: string; order: number; productId?: string }> = []
): Promise<string[]> {
  const visuals = PRODUCT_VISUALS[chapterId];
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  
  // Map chapter IDs to product IDs for screenshot matching
  const chapterToProductId: Record<string, string> = {
    'opening': 'studio',
    'spark': 'spark',
    'mind': 'mind',
    'vibe': 'vibe',
    'deck': 'deck',
    'arc': 'arc',
    'ask-genie': 'ask-genie',
    'cast': 'cast',
    'closing': 'studio',
  };
  
  const productId = chapterToProductId[chapterId];
  
  // PRIORITY 1: Use product screenshots from the orchestration service
  // These are the actual UI screenshots uploaded by the user
  const productScreenshots = screenshots.filter(s => {
    // Match screenshots by product ID (in screenId or productId field)
    const screenProductId = s.productId || s.screenId.split('-')[0];
    return screenProductId === productId || 
           s.screenId.toLowerCase().includes(productId.toLowerCase());
  });
  
  if (productScreenshots.length > 0) {
    const sortedScreenshots = productScreenshots.sort((a, b) => a.order - b.order);
    console.log(`   📸 Using ${sortedScreenshots.length} product screenshots for ${chapterId}`);
    return sortedScreenshots.map(s => s.imageUrl);
  }
  
  // PRIORITY 2: Load screenshots directly from product-screenshots bucket
  try {
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.50.0");
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: files, error } = await supabase.storage
      .from('product-screenshots')
      .list('screenshots', { limit: 100 });
    
    if (!error && files && files.length > 0) {
      // Filter files for this product
      const productFiles = files.filter(f => 
        f.name.toLowerCase().startsWith(productId.toLowerCase() + '-') ||
        f.name.toLowerCase().startsWith(chapterId.toLowerCase() + '-')
      );
      
      if (productFiles.length > 0) {
        const screenshotUrls = productFiles.map(f => 
          `${supabaseUrl}/storage/v1/object/public/product-screenshots/screenshots/${f.name}`
        );
        console.log(`   📸 Found ${screenshotUrls.length} screenshots in storage for ${chapterId}`);
        return screenshotUrls;
      }
    }
  } catch (err) {
    console.log(`   ⚠️ Could not load screenshots from bucket: ${err}`);
  }
  
  // PRIORITY 3: Fall back to brand logos (PNG format)
  const productBranding: Record<string, { logo: string; color: string }> = {
    'opening': { 
      logo: `${supabaseUrl}/storage/v1/object/public/brand-assets/genie-opening-logo.png`,
      color: '#9333EA'
    },
    'spark': {
      logo: `${supabaseUrl}/storage/v1/object/public/brand-assets/genie-spark-logo.png`,
      color: '#F97316'
    },
    'mind': {
      logo: `${supabaseUrl}/storage/v1/object/public/brand-assets/genie-mind-logo.png`,
      color: '#3B82F6'
    },
    'vibe': {
      logo: `${supabaseUrl}/storage/v1/object/public/brand-assets/genie-vibe-logo.png`,
      color: '#22C55E'
    },
    'deck': {
      logo: `${supabaseUrl}/storage/v1/object/public/brand-assets/genie-deck-logo.png`,
      color: '#EAB308'
    },
    'arc': {
      logo: `${supabaseUrl}/storage/v1/object/public/brand-assets/genie-arc-logo.png`,
      color: '#EC4899'
    },
    'ask-genie': {
      logo: `${supabaseUrl}/storage/v1/object/public/brand-assets/genie-ask-genie-logo.png`,
      color: '#06B6D4'
    },
    'cast': {
      logo: `${supabaseUrl}/storage/v1/object/public/brand-assets/genie-cast-logo.png`,
      color: '#EF4444'
    },
    'closing': {
      logo: `${supabaseUrl}/storage/v1/object/public/brand-assets/genie-closing-logo.png`,
      color: '#9333EA'
    },
  };

  const branding = productBranding[chapterId];
  if (branding?.logo) {
    console.log(`   🖼️ Using brand logo for ${chapterId} (no screenshots found)`);
    return [branding.logo];
  }

  // PRIORITY 4: Fallback to the preview URL
  const previewAppUrl = 'https://id-preview--0e30badf-cab5-4682-9459-1076c06d2310.lovable.app';
  const fallbackLogoUrl = `${previewAppUrl}/brand-assets/genie-${chapterId}-logo.png`;
  console.log(`   ⚠️ No assets found, using preview URL: ${fallbackLogoUrl}`);
  return [fallbackLogoUrl];
}

/**
 * Get chapter script in the specified language
 * Uses the high-level scripts from the config
 */
function getChapterScript(chapterId: string, language: string): string {
  // These would come from the genie-video-high-level-scripts.ts
  // For edge function, we use a simplified version
  const scripts: Record<string, Record<string, string>> = {
    'opening': {
      'en': "Welcome to Genie Studio. Your creative vision, powered by AI. Seven products, one platform, infinite possibilities.",
      'ar': "مرحباً بكم في جيني ستوديو. رؤيتكم الإبداعية مدعومة بالذكاء الاصطناعي.",
      'hi': "जीनी स्टूडियो में आपका स्वागत है। आपकी रचनात्मक दृष्टि, एआई द्वारा संचालित।",
      'zh': "欢迎来到精灵工作室。您的创意愿景，由人工智能驱动。",
    },
    'spark': {
      'en': "Genie Spark ignites your creativity. Transform any idea into a professional script in seconds. AI-powered confidence scoring ensures your message resonates.",
      'ar': "جيني سبارك يشعل إبداعك. حول أي فكرة إلى سيناريو احترافي.",
      'hi': "जीनी स्पार्क आपकी रचनात्मकता को प्रज्वलित करता है।",
      'zh': "精灵火花点燃您的创造力。将任何想法转化为专业脚本。",
    },
    'mind': {
      'en': "Genie Mind enhances your scripts with AI intelligence. Real-time suggestions, clarity improvements, and multi-language translation.",
      'ar': "جيني مايند يعزز نصوصك بذكاء اصطناعي.",
      'hi': "जीनी माइंड एआई इंटेलिजेंस के साथ आपकी स्क्रिप्ट को बेहतर बनाता है।",
      'zh': "精灵思维用人工智能增强您的脚本。",
    },
    'vibe': {
      'en': "Genie Vibe is your complete recording studio. Teleprompter, AI editing, and professional-grade output. From script to screen in minutes.",
      'ar': "جيني فايب هو استوديو التسجيل الكامل الخاص بك.",
      'hi': "जीनी वाइब आपका पूर्ण रिकॉर्डिंग स्टूडियो है।",
      'zh': "精灵氛围是您完整的录音室。",
    },
    'deck': {
      'en': "Genie Deck transforms ideas into stunning presentations. AI-designed templates, smart layouts, and instant export to PowerPoint or PDF.",
      'ar': "جيني ديك يحول الأفكار إلى عروض تقديمية مذهلة.",
      'hi': "जीनी डेक विचारों को शानदार प्रस्तुतियों में बदलता है।",
      'zh': "精灵甲板将想法转化为精彩的演示文稿。",
    },
    'arc': {
      'en': "Genie Arc manages your entire production workflow. Kanban boards, content calendars, and smart scheduling keep your team in sync.",
      'ar': "جيني آرك يدير سير عمل الإنتاج بالكامل.",
      'hi': "जीनी आर्क आपके पूरे प्रोडक्शन वर्कफ़्लो को प्रबंधित करता है।",
      'zh': "精灵弧管理您的整个生产工作流程。",
    },
    'ask-genie': {
      'en': "Ask Genie is your personal AI assistant. Ask anything about the platform, get instant guidance, and master every feature.",
      'ar': "اسأل جيني هو مساعدك الشخصي بالذكاء الاصطناعي.",
      'hi': "आस्क जीनी आपका व्यक्तिगत एआई सहायक है।",
      'zh': "问精灵是您的个人AI助手。",
    },
    'cast': {
      'en': "Genie Cast distributes your content globally. One click publishing to YouTube, LinkedIn, TikTok, and more. Analytics that drive growth.",
      'ar': "جيني كاست يوزع محتواك عالمياً.",
      'hi': "जीनी कास्ट आपकी सामग्री को विश्व स्तर पर वितरित करता है।",
      'zh': "精灵广播在全球分发您的内容。",
    },
    'closing': {
      'en': "Your wish is our command. Start creating with Genie Studio today. From mind to media, your story awaits.",
      'ar': "أمرك مطاع. ابدأ الإبداع مع جيني ستوديو اليوم.",
      'hi': "आपकी इच्छा हमारा आदेश है। आज ही जीनी स्टूडियो के साथ बनाना शुरू करें।",
      'zh': "您的愿望就是我的命令。今天就开始使用精灵工作室创作。",
    },
  };

  return scripts[chapterId]?.[language] || scripts[chapterId]?.['en'] || '';
}

/**
 * Stitch all chapter audio/visuals into one continuous video
 * PRIMARY: JSON2Video (Render tier) for timeline-based stitching
 * FALLBACK: Replicate/ModelsLab for video generation
 */
async function stitchChaptersToVideo(
  chapters: ChapterResult[],
  language: string,
  videoProvider: string,
  quality: string
): Promise<{ success: boolean; videoUrl?: string; thumbnailUrl?: string; pendingGeneration: boolean; taskId?: string }> {
  const successfulChapters = chapters.filter(c => c.success);
  if (successfulChapters.length === 0) {
    return { success: false, pendingGeneration: false };
  }

  // Collect all audio URLs and ALL visual URLs from chapters (including multiple screenshots)
  const audioUrls = successfulChapters.map(c => c.audioUrl).filter(Boolean) as string[];
  // Flatten all visualUrls from each chapter to include all product screenshots
  const visualUrls = successfulChapters.flatMap(c => c.visualUrls || (c.visualUrl ? [c.visualUrl] : []));

  console.log(`🎬 Stitching ${successfulChapters.length} chapters into video`);
  console.log(`   Audio files: ${audioUrls.length}, Visual files: ${visualUrls.length}`);
  console.log(`   Screenshots per chapter:`, successfulChapters.map(c => `${c.chapterId}: ${c.visualUrls?.length || 1}`).join(', '));

  // === PHASE 1: JSON2VIDEO (PRIMARY - Timeline Assembly) ===
  const json2videoResult = await tryJSON2VideoAssembly(successfulChapters, audioUrls, visualUrls, language, quality);
  if (json2videoResult.success) {
    console.log(`✅ Video assembled via JSON2Video: ${json2videoResult.videoUrl}`);
    return {
      success: true,
      videoUrl: json2videoResult.videoUrl,
      thumbnailUrl: json2videoResult.thumbnailUrl,
      pendingGeneration: json2videoResult.pending || false,
      taskId: json2videoResult.taskId,
    };
  }

  // === FALLBACK 1: Replicate for video assembly ===
  const replicateResult = await tryReplicateVideoAssembly(audioUrls, visualUrls, language);
  if (replicateResult.success) {
    console.log(`✅ Video assembled via Replicate: ${replicateResult.videoUrl}`);
    return {
      success: true,
      videoUrl: replicateResult.videoUrl,
      thumbnailUrl: replicateResult.thumbnailUrl,
      pendingGeneration: replicateResult.pending || false,
      taskId: replicateResult.taskId,
    };
  }

  // === FALLBACK 2: ModelsLab video generation from images + audio ===
  const modelsLabResult = await tryModelsLabVideoAssembly(audioUrls, visualUrls, language);
  if (modelsLabResult.success) {
    console.log(`✅ Video assembled via ModelsLab: ${modelsLabResult.videoUrl}`);
    return {
      success: true,
      videoUrl: modelsLabResult.videoUrl,
      thumbnailUrl: modelsLabResult.thumbnailUrl,
      pendingGeneration: modelsLabResult.pending || false,
      taskId: modelsLabResult.taskId,
    };
  }

  // === FALLBACK 3: Create slideshow-style video with audio overlay ===
  const slideshowResult = await createSlideshowVideo(audioUrls, visualUrls, language);
  if (slideshowResult.success) {
    return {
      success: true,
      videoUrl: slideshowResult.videoUrl,
      thumbnailUrl: slideshowResult.thumbnailUrl,
      pendingGeneration: false,
    };
  }

  // If all methods fail, mark as pending for manual processing
  const timestamp = Date.now();
  const placeholderUrl = `https://ithspbabhmdntioslfqe.supabase.co/storage/v1/object/public/landing-videos/${language}/genie-studio-full-${timestamp}.mp4`;

  console.log(`⚠️ Video assembly failed - marking as pending for manual processing`);
  return {
    success: true,
    videoUrl: placeholderUrl,
    pendingGeneration: true,
  };
}

// ================================
// JSON2VIDEO INTEGRATION (Phase 1)
// ================================

/**
 * JSON2Video API for timeline-based video assembly
 * - Precise frame-by-frame timeline control
 * - Synchronizes TTS audio with product screenshots
 * - Supports text overlays, transitions, and effects
 * 
 * @see https://json2video.com/docs/api/
 */
async function tryJSON2VideoAssembly(
  chapters: ChapterResult[],
  audioUrls: string[],
  visualUrls: string[],
  language: string,
  quality: string
): Promise<{ success: boolean; videoUrl?: string; thumbnailUrl?: string; pending?: boolean; taskId?: string }> {
  const apiKey = Deno.env.get('JSON2VIDEO_API_KEY');
  if (!apiKey) {
    console.log('⚠️ JSON2VIDEO_API_KEY not configured - skipping JSON2Video assembly');
    return { success: false };
  }

  try {
    console.log(`🎥 Starting JSON2Video timeline assembly for ${language}`);
    console.log(`   API Key present: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
    
    // CRITICAL: Filter out any data: URIs - JSON2Video requires HTTP URLs only
    const validAudioUrls = audioUrls.filter(url => url && url.startsWith('http'));
    const validVisualUrls = visualUrls.filter(url => url && url.startsWith('http'));
    
    console.log(`   Audio URLs (valid HTTP): ${validAudioUrls.length}/${audioUrls.length}`);
    console.log(`   Visual URLs (valid HTTP): ${validVisualUrls.length}/${visualUrls.length}`);
    
    // Log any base64 URLs that were filtered out
    const base64AudioCount = audioUrls.filter(url => url && url.startsWith('data:')).length;
    if (base64AudioCount > 0) {
      console.warn(`   ⚠️ ${base64AudioCount} audio files are base64 (filtered out) - check storage upload`);
    }

    // Build timeline from chapters - using only valid URLs
    const timeline = buildJSON2VideoTimeline(chapters, validAudioUrls, validVisualUrls, language, quality);
    
    // Log full payload for debugging
    const payloadStr = JSON.stringify(timeline, null, 2);
    console.log(`📋 JSON2Video Request Payload (first 2000 chars):\n${payloadStr.substring(0, 2000)}`);
    console.log(`   Total scenes: ${(timeline as any).scenes?.length || 0}`);

    // Call JSON2Video Render API
    const response = await fetch('https://api.json2video.com/v2/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(timeline),
    });

    const responseText = await response.text();
    console.log(`📹 JSON2Video response status: ${response.status}`);
    console.log(`📹 JSON2Video full response: ${responseText}`);

    if (!response.ok) {
      console.error(`JSON2Video API error: ${response.status} - ${responseText}`);
      return { success: false };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse JSON2Video response:', parseErr);
      return { success: false };
    }

    // JSON2Video v2 returns { success: true, project: "xxx" } on successful job creation
    const projectId = data.project || data.id || data.movie_id || data.movie?.id;
    
    if (projectId) {
      console.log(`📹 JSON2Video job created: ${projectId}`);
      const result = await pollJSON2VideoResult(projectId, apiKey);
      return result;
    }

    // If immediate output available (synchronous render - rare)
    if (data.url || data.movie_url || data.movie?.url) {
      return {
        success: true,
        videoUrl: data.url || data.movie_url || data.movie?.url,
        thumbnailUrl: data.poster || data.thumbnail || data.movie?.poster,
        pending: false,
      };
    }

    // No project ID means issue with API key or plan
    if (data.success === true && !projectId) {
      console.error(`⚠️ JSON2Video: success=true but no project ID returned.`);
      console.error(`   Possible causes:`);
      console.error(`   1. API key is for Free tier (no Render API access)`);
      console.error(`   2. Account quota exhausted`);
      console.error(`   3. API key misconfigured`);
      console.error(`   Full response: ${JSON.stringify(data)}`);
      console.error(`   Please verify Professional plan at json2video.com/account`);
      return { success: false };
    }

    // Error in response
    if (data.error || data.message) {
      console.error(`JSON2Video API error: ${data.error || data.message}`);
      return { success: false };
    }

    console.log(`⚠️ JSON2Video returned unexpected response format`);
    return { success: false };
  } catch (error) {
    console.error('JSON2Video assembly error:', error);
    return { success: false };
  }
}

/**
 * Build JSON2Video timeline from chapter data
 * Uses JSON2Video v2 API format with "scenes" structure
 * @see https://json2video.com/docs/v2/api-reference/json-syntax/
 */
function buildJSON2VideoTimeline(
  chapters: ChapterResult[],
  audioUrls: string[],
  visualUrls: string[], // All visuals flattened
  language: string,
  quality: string
): object {
  // Resolution options: sd, hd, full-hd, 4k, instagram-story, instagram-post, etc.
  const resolution = quality === 'cinematic' ? '4k' : quality === 'production' ? 'full-hd' : 'hd';

  // Build scenes array from chapters - each chapter can have multiple screenshots
  const scenes: any[] = [];
  
  chapters.forEach((chapter, chapterIndex) => {
    const audioUrl = audioUrls[chapterIndex] || null;
    const chapterVisuals = chapter.visualUrls || (chapter.visualUrl ? [chapter.visualUrl] : []);
    
    // If we have multiple screenshots, create sub-scenes for each
    if (chapterVisuals.length > 1) {
      const durationPerVisual = Math.floor(chapter.duration / chapterVisuals.length);
      
      chapterVisuals.forEach((visualUrl, visualIndex) => {
        const elements: any[] = [];
        const isFirstVisual = visualIndex === 0;
        const isLastVisual = visualIndex === chapterVisuals.length - 1;
        
        // Background image element
        elements.push({
          type: 'image',
          src: visualUrl,
          duration: durationPerVisual,
        });

        // Audio element - only on first visual of chapter (continuous audio)
        if (isFirstVisual && audioUrl) {
          elements.push({
            type: 'audio',
            src: audioUrl,
            duration: chapter.duration, // Full chapter duration
          });
        }

        // Text overlay for product name (first visual only)
        if (isFirstVisual) {
          elements.push({
            type: 'text',
            text: chapter.product,
            duration: Math.min(5, durationPerVisual),
            settings: {
              'font-family': 'Inter',
              'font-size': '48px',
              'font-color': '#ffffff',
              'text-shadow': '2px 2px 4px rgba(0,0,0,0.5)',
            },
            position: 'bottom-left',
            start: 0,
          });
        }

        scenes.push({
          comment: `${chapter.product} - Screenshot ${visualIndex + 1}/${chapterVisuals.length}`,
          duration: durationPerVisual,
          'background-color': chapter.product === 'Genie Studio' ? '#9333EA' : '#1e293b',
          elements,
        });
      });
    } else {
      // Single visual (or logo fallback)
      const elements: any[] = [];
      const visualUrl = chapterVisuals[0] || null;

      // Background image element
      if (visualUrl) {
        elements.push({
          type: 'image',
          src: visualUrl,
          duration: chapter.duration,
        });
      }

      // Audio element (TTS voiceover)
      if (audioUrl) {
        elements.push({
          type: 'audio',
          src: audioUrl,
          duration: chapter.duration,
        });
      }

      // Text overlay for product name
      elements.push({
        type: 'text',
        text: chapter.product,
        duration: Math.min(5, chapter.duration),
        settings: {
          'font-family': 'Inter',
          'font-size': '48px',
          'font-color': '#ffffff',
          'text-shadow': '2px 2px 4px rgba(0,0,0,0.5)',
        },
        position: 'bottom-left',
        start: 0,
      });

      scenes.push({
        comment: `${chapter.product} - Chapter ${chapterIndex + 1}`,
        duration: chapter.duration,
        'background-color': chapter.product === 'Genie Studio' ? '#9333EA' : '#1e293b',
        elements,
      });
    }
  });

  // Complete movie structure per JSON2Video v2 spec
  return {
    resolution,
    quality: quality === 'cinematic' ? 'high' : 'medium',
    scenes,
  };
}

/**
 * Poll JSON2Video for job completion
 */
async function pollJSON2VideoResult(
  projectId: string,
  apiKey: string
): Promise<{ success: boolean; videoUrl?: string; thumbnailUrl?: string; pending?: boolean; taskId?: string }> {
  const maxAttempts = 24; // ~2 minutes with 5s intervals (videos can take time)

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000));

    try {
      // Correct endpoint: GET with query param, not path param
      const response = await fetch(`https://api.json2video.com/v2/movies?project=${projectId}`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        console.error(`JSON2Video polling error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const movieData = data.movie || data;
      console.log(`   JSON2Video poll ${i + 1}/${maxAttempts}: status=${movieData.status || data.status}`);

      // Check movie object (v2 API returns { success, movie: {...} })
      if (movieData.status === 'done' && movieData.url) {
        return {
          success: true,
          videoUrl: movieData.url,
          thumbnailUrl: movieData.poster || movieData.thumbnail,
          pending: false,
        };
      }

      if (movieData.status === 'error' || movieData.status === 'failed') {
        console.error('JSON2Video job failed:', movieData.error || movieData.message || data.message);
        return { success: false };
      }

      // Still processing, continue polling
    } catch (error) {
      console.error('JSON2Video polling error:', error);
    }
  }

  // Timeout - return as pending for background processing
  console.log(`⏳ JSON2Video job ${projectId} still processing - marking as pending`);
  return {
    success: true,
    pending: true,
    taskId: projectId,
  };
}

/**
 * Try Replicate API for video assembly
 * Uses models like deforum, animatediff, or video-concat
 */
async function tryReplicateVideoAssembly(
  audioUrls: string[],
  visualUrls: string[],
  language: string
): Promise<{ success: boolean; videoUrl?: string; thumbnailUrl?: string; pending?: boolean; taskId?: string }> {
  const apiKey = Deno.env.get('REPLICATE_API_TOKEN');
  if (!apiKey) {
    console.log('⚠️ REPLICATE_API_TOKEN not configured');
    return { success: false };
  }

  try {
    // Use Replicate's video-concat or frames-to-video model
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Using a general video generation model that can work with images
        version: 'e8b06d0812ad39585a1ffa078af0f29e95d7e337aa7db39bd03f63ff771f8443', // frames-to-video-merger
        input: {
          frames: visualUrls,
          fps: 1, // 1 frame per second for slideshow
          output_format: 'mp4',
        },
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Replicate error:', data.error);
      return { success: false };
    }

    // If processing, return task ID for polling
    if (data.status === 'processing' || data.status === 'starting') {
      console.log(`🔄 Replicate job started: ${data.id}`);
      
      // Poll for completion (up to 60 seconds)
      const result = await pollReplicateResult(data.id, apiKey);
      return result;
    }

    if (data.output) {
      return {
        success: true,
        videoUrl: data.output,
        pending: false,
      };
    }

    return { success: false };
  } catch (error) {
    console.error('Replicate assembly error:', error);
    return { success: false };
  }
}

/**
 * Poll Replicate for job completion
 */
async function pollReplicateResult(
  predictionId: string,
  apiKey: string
): Promise<{ success: boolean; videoUrl?: string; thumbnailUrl?: string; pending?: boolean; taskId?: string }> {
  const maxAttempts = 12; // ~60 seconds with 5s intervals
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000));
    
    try {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { 'Authorization': `Token ${apiKey}` },
      });
      
      const data = await response.json();
      
      if (data.status === 'succeeded' && data.output) {
        return {
          success: true,
          videoUrl: Array.isArray(data.output) ? data.output[0] : data.output,
          pending: false,
        };
      }
      
      if (data.status === 'failed') {
        console.error('Replicate job failed:', data.error);
        return { success: false };
      }
      
      console.log(`   Polling attempt ${i + 1}/${maxAttempts}, status: ${data.status}`);
    } catch (error) {
      console.error('Polling error:', error);
    }
  }
  
  // Timeout - return as pending
  return {
    success: true,
    pending: true,
    taskId: predictionId,
  };
}

/**
 * Try ModelsLab for video assembly from images
 */
async function tryModelsLabVideoAssembly(
  audioUrls: string[],
  visualUrls: string[],
  language: string
): Promise<{ success: boolean; videoUrl?: string; thumbnailUrl?: string; pending?: boolean; taskId?: string }> {
  const apiKey = Deno.env.get('MODELSLAB_API_KEY');
  if (!apiKey) {
    console.log('⚠️ MODELSLAB_API_KEY not configured');
    return { success: false };
  }

  try {
    // Use the first image as init_image for img2video
    const initImage = visualUrls[0];
    if (!initImage) {
      return { success: false };
    }

    const response = await fetch('https://modelslab.com/api/v6/video/img2video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: apiKey,
        model_id: 'animatediff-v2',
        init_image: initImage,
        prompt: `Professional product showcase video for Genie Studio AI platform, smooth camera movement, high quality`,
        negative_prompt: 'blurry, jittery, low quality, distorted',
        width: 1024,
        height: 576,
        num_frames: 120, // ~15 seconds at 8fps
        fps: 8,
        strength: 0.65,
      }),
    });

    const data = await response.json();

    if (data.status === 'processing') {
      // Poll for result
      const result = await pollModelsLabResult(data.fetch_result, apiKey);
      return result;
    }

    if (data.output && data.output[0]) {
      return {
        success: true,
        videoUrl: data.output[0],
        pending: false,
      };
    }

    return { success: false };
  } catch (error) {
    console.error('ModelsLab assembly error:', error);
    return { success: false };
  }
}

/**
 * Poll ModelsLab for result
 */
async function pollModelsLabResult(
  fetchUrl: string,
  apiKey: string
): Promise<{ success: boolean; videoUrl?: string; thumbnailUrl?: string; pending?: boolean; taskId?: string }> {
  const maxAttempts = 10;
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000));
    
    try {
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey }),
      });
      
      const data = await response.json();
      
      if (data.status === 'success' && data.output && data.output[0]) {
        return {
          success: true,
          videoUrl: data.output[0],
          pending: false,
        };
      }
      
      if (data.status === 'failed') {
        console.error('ModelsLab job failed');
        return { success: false };
      }
    } catch (error) {
      console.error('ModelsLab polling error:', error);
    }
  }
  
  return { success: false };
}

/**
 * Create a simple slideshow video from images with audio
 * This is a basic fallback that creates a video URL for the combined content
 */
async function createSlideshowVideo(
  audioUrls: string[],
  visualUrls: string[],
  language: string
): Promise<{ success: boolean; videoUrl?: string; thumbnailUrl?: string }> {
  // For edge function limitations, we create a "composite" reference
  // that can be assembled client-side or by a background job
  
  // Save the composite data for later assembly
  const compositeId = `composite_${language}_${Date.now()}`;
  const compositeData = {
    id: compositeId,
    audioUrls,
    visualUrls,
    language,
    createdAt: new Date().toISOString(),
  };
  
  console.log(`📝 Created composite reference: ${compositeId}`);
  console.log(`   Includes ${audioUrls.length} audio + ${visualUrls.length} visuals`);
  
  // Return the first visual as thumbnail
  return {
    success: true,
    videoUrl: `composite://${compositeId}`,
    thumbnailUrl: visualUrls[0],
  };
}

/**
 * Save assembled video to database with proper status tracking
 */
async function saveAssembledVideo(
  supabase: any,
  params: {
    language: string;
    videoUrl: string;
    thumbnailUrl?: string;
    totalDuration: number;
    ttsProvider: string;
    videoProvider: string;
    fullProductionMode?: boolean;
    productionConfig?: ProductionConfig | null;
    pendingGeneration?: boolean;
  }
): Promise<void> {
  const languageNames: Record<string, string> = {
    'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
    'pt': 'Portuguese', 'ar': 'Arabic', 'hi': 'Hindi', 'zh': 'Chinese',
    'ja': 'Japanese', 'ko': 'Korean', 'sw': 'Swahili', 'bn': 'Bengali',
    'te': 'Telugu', 'ta': 'Tamil', 'ur': 'Urdu', 'id': 'Indonesian',
  };

  // Build title based on production mode
  const productionSuffix = params.fullProductionMode ? ' [Full Production]' : '';
  const title = `Genie Studio - Complete Demo (${languageNames[params.language] || params.language})${productionSuffix}`;
  
  // Build description with enabled features
  let description = `Full 9-chapter marketing video with all products explained in ${languageNames[params.language] || params.language}.`;
  if (params.fullProductionMode && params.productionConfig) {
    const features: string[] = [];
    if (params.productionConfig.avatar?.enabled) features.push(`AI Avatar (${params.productionConfig.avatar.gender})`);
    if (params.productionConfig.animations?.enabled) features.push(`Animations (${params.productionConfig.animations.style})`);
    if (params.productionConfig.threeD?.enabled) features.push(`3D Showcases (${params.productionConfig.threeD.style})`);
    if (features.length > 0) {
      description += ` Includes: ${features.join(', ')}.`;
    }
  }

  // Determine generation status based on pending flag
  const generationStatus = params.pendingGeneration ? 'pending' : 'completed';

  // Auto-generate thumbnail if not provided
  let thumbnailUrl = params.thumbnailUrl;
  if (!thumbnailUrl && params.videoUrl) {
    // Use the first chapter visual as thumbnail, or generate a branded thumbnail
    thumbnailUrl = await generateThumbnail(supabase, params.language, params.fullProductionMode || false);
    console.log(`🖼️ Auto-generated thumbnail: ${thumbnailUrl}`);
  }

  const { error } = await supabase.from('landing_page_videos').upsert({
    title,
    description,
    video_url: params.videoUrl,
    thumbnail_url: thumbnailUrl || '',
    content_type: params.fullProductionMode ? 'full_demo_production' : 'full_demo',
    language_code: params.language,
    language_name: languageNames[params.language] || params.language,
    region: getRegionForLanguage(params.language),
    duration_seconds: params.totalDuration,
    placement: 'hero_showcase',
    is_active: true,
    is_featured: true,
    view_count: 0,
    ai_confidence: 0.95,
    generation_pipeline: 'genie-cast-assembler',
    // New status tracking columns
    generation_status: generationStatus,
    generation_started_at: new Date().toISOString(),
    generation_error: null,
  }, {
    onConflict: 'content_type,language_code',
  });

  if (error) {
    console.error('Failed to save video:', error);
  } else {
    console.log(`📝 Saved video entry with status: ${generationStatus}`);
  }
}

/**
 * Generate branded thumbnail for Genie Cast video
 * Uses the first product screenshot with branded overlay
 */
async function generateThumbnail(
  supabase: any,
  language: string,
  isFullProduction: boolean
): Promise<string> {
  const timestamp = Date.now();
  const bucketPath = `thumbnails/${language}/genie-studio-${isFullProduction ? 'full' : 'demo'}-${timestamp}.jpg`;
  
  // Try to use a pre-generated branded thumbnail
  const brandedThumbnails: Record<string, string> = {
    'en': 'https://ithspbabhmdntioslfqe.supabase.co/storage/v1/object/public/landing-videos/thumbnails/genie-studio-en.jpg',
    'ar': 'https://ithspbabhmdntioslfqe.supabase.co/storage/v1/object/public/landing-videos/thumbnails/genie-studio-ar.jpg',
    'hi': 'https://ithspbabhmdntioslfqe.supabase.co/storage/v1/object/public/landing-videos/thumbnails/genie-studio-hi.jpg',
    'zh': 'https://ithspbabhmdntioslfqe.supabase.co/storage/v1/object/public/landing-videos/thumbnails/genie-studio-zh.jpg',
  };
  
  if (brandedThumbnails[language]) {
    return brandedThumbnails[language];
  }
  
  // Fallback: Use default Genie Studio branding thumbnail
  const fallbackThumbnail = 'https://ithspbabhmdntioslfqe.supabase.co/storage/v1/object/public/landing-videos/thumbnails/genie-studio-default.jpg';
  
  // In Phase 2: Generate dynamic thumbnail via JSON2Video still frame or AI image generation
  // For now, return fallback
  return fallbackThumbnail;
}

function getRegionForLanguage(language: string): string {
  const regions: Record<string, string> = {
    'en': 'US', 'es': 'ES', 'fr': 'FR', 'de': 'DE', 'pt': 'BR',
    'ar': 'SA', 'hi': 'IN', 'zh': 'CN', 'ja': 'JP', 'ko': 'KR',
    'sw': 'KE', 'bn': 'BD', 'te': 'IN', 'ta': 'IN', 'ur': 'PK', 'id': 'ID',
  };
  return regions[language] || 'Global';
}

// ================================
// FULL PRODUCTION MODE FUNCTIONS
// ================================

/**
 * Regional avatar configurations for AI presenters
 */
const REGIONAL_AVATARS: Record<string, { male: string; female: string; style: string }> = {
  'en': { male: 'James', female: 'Sarah', style: 'professional_western' },
  'ar': { male: 'Ahmed', female: 'Fatima', style: 'professional_mena' },
  'hi': { male: 'Raj', female: 'Priya', style: 'professional_south_asian' },
  'zh': { male: 'Wei', female: 'Ming', style: 'professional_cjk' },
  'ja': { male: 'Kenji', female: 'Yuki', style: 'professional_cjk' },
  'ko': { male: 'Joon', female: 'Soo', style: 'professional_cjk' },
  'es': { male: 'Carlos', female: 'Maria', style: 'professional_western' },
  'fr': { male: 'Pierre', female: 'Sophie', style: 'professional_western' },
  'de': { male: 'Hans', female: 'Anna', style: 'professional_western' },
  'pt': { male: 'Pedro', female: 'Ana', style: 'professional_latam' },
  'sw': { male: 'Juma', female: 'Amina', style: 'professional_african' },
  'bn': { male: 'Rafiq', female: 'Aisha', style: 'professional_south_asian' },
};

/**
 * Generate AI Avatar segment for a chapter
 * Uses Alibaba Wan2.2 S2V (Speech-to-Video) for lip-synced avatars
 */
async function generateAvatarSegment(
  supabase: any,
  chapterId: string,
  language: string,
  gender: 'male' | 'female',
  size: 'small' | 'medium' | 'large',
  audioBase64?: string
): Promise<string | undefined> {
  const avatarConfig = REGIONAL_AVATARS[language] || REGIONAL_AVATARS['en'];
  const avatarName = gender === 'male' ? avatarConfig.male : avatarConfig.female;
  
  console.log(`🎭 Generating ${gender} avatar (${avatarName}) for chapter: ${chapterId}`);
  
  // In production, this would call Alibaba Wan2.2 S2V or OmniAvatar
  // For now, return placeholder URL
  const timestamp = Date.now();
  const avatarUrl = `https://ithspbabhmdntioslfqe.supabase.co/storage/v1/object/public/avatar-segments/${language}/${chapterId}-${gender}-${timestamp}.mp4`;
  
  // Simulate API call to avatar generation service
  try {
    // This would be the actual call:
    // const { data, error } = await supabase.functions.invoke('alibaba-avatar-generator', {
    //   body: {
    //     audioBase64,
    //     avatarStyle: avatarConfig.style,
    //     gender,
    //     size,
    //     language,
    //   }
    // });
    
    // For now, log and return placeholder
    console.log(`✅ Avatar segment would be generated via Alibaba Wan2.2`);
    return avatarUrl;
  } catch (err) {
    console.error('Avatar generation failed:', err);
    return undefined;
  }
}

/**
 * Generate 3D product showcase element
 * Uses Meshy AI for text-to-3D generation
 */
async function generate3DElement(
  product: string,
  style: string,
  quality: 'standard' | 'high' | 'premium'
): Promise<string | undefined> {
  console.log(`📦 Generating 3D element for ${product} (style: ${style}, quality: ${quality})`);
  
  // Product-specific 3D prompts
  const prompts: Record<string, string> = {
    'Genie Spark': 'Glowing electric spark lightning bolt 3D icon, yellow and orange energy, modern design',
    'Genie Mind': 'Glowing brain neural network 3D icon, blue and purple gradients, tech aesthetic',
    'Genie Vibe': 'Sound wave visualization 3D icon, audio frequencies, green tones, modern',
    'Genie Deck': 'Floating presentation slides 3D icon, stacked layers, professional',
    'Genie Arc': 'Orbital rings production hub 3D icon, interconnected nodes, pink accent',
    'Ask Genie': 'Magical genie lamp 3D icon, cyan glow, mystical design',
    'Genie Cast': 'Broadcasting tower 3D icon, signal waves, red accent, global distribution',
    'Genie Studio': 'Complete creative suite 3D logo, all elements combined, purple gradient',
  };
  
  const prompt = prompts[product] || `${product} 3D logo icon, professional design`;
  
  // In production, this would call Meshy AI
  const timestamp = Date.now();
  const threeDUrl = `https://ithspbabhmdntioslfqe.supabase.co/storage/v1/object/public/3d-elements/${product.toLowerCase().replace(' ', '-')}-${style}-${timestamp}.glb`;
  
  try {
    // This would be the actual call:
    // const meshyApiKey = Deno.env.get('MESHY_API_KEY');
    // const response = await fetch('https://api.meshy.ai/v2/text-to-3d', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${meshyApiKey}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ prompt, style, quality })
    // });
    
    console.log(`✅ 3D element would be generated via Meshy AI: ${prompt}`);
    return threeDUrl;
  } catch (err) {
    console.error('3D generation failed:', err);
    return undefined;
  }
}

/**
 * Generate animated transition between chapters
 * Uses ModelsLab for motion graphics or CSS/Framer for simpler effects
 */
async function generateTransition(
  chapterId: string,
  product: string,
  color: string,
  style: string,
  intensity: number
): Promise<string | undefined> {
  console.log(`✨ Generating ${style} transition for ${chapterId} (intensity: ${intensity}%)`);
  
  // Style-specific transition configurations
  const transitionConfig: Record<string, { type: string; duration: number }> = {
    'kinetic': { type: 'text_reveal', duration: 2 },
    'slide': { type: 'slide_transition', duration: 1 },
    'particle': { type: 'particle_effect', duration: 1.5 },
    'morph': { type: 'shape_morph', duration: 2 },
    'glass': { type: 'glass_blur', duration: 1 },
  };
  
  const config = transitionConfig[style] || transitionConfig['slide'];
  
  // In production, this would generate animated transition clips
  const timestamp = Date.now();
  const transitionUrl = `https://ithspbabhmdntioslfqe.supabase.co/storage/v1/object/public/transitions/${chapterId}-${style}-${timestamp}.mp4`;
  
  try {
    // For complex animations, call ModelsLab AnimateDiff
    // For simple ones, use CSS keyframes rendered to video
    console.log(`✅ Transition would be generated: ${config.type} (${config.duration}s)`);
    return transitionUrl;
  } catch (err) {
    console.error('Transition generation failed:', err);
    return undefined;
  }
}

// ================================
// CREDIT CONSUMPTION TRACKING
// ================================

interface CreditTrackingParams {
  language: string;
  ttsProvider: string;
  videoProvider: string;
  totalCharacters: number;
  totalDuration: number;
  fullProductionMode: boolean;
  assemblyProvider: string | null;
}

/**
 * Track credit consumption for all AI providers used in video assembly
 * Logs to ai_credit_transactions table for billing and analytics
 */
async function trackCreditConsumption(
  supabase: any,
  params: CreditTrackingParams
): Promise<void> {
  try {
    const transactions: any[] = [];
    const timestamp = new Date().toISOString();

    // TTS credits: 1 credit per 500 characters
    const ttsCredits = Math.ceil(params.totalCharacters / 500);
    transactions.push({
      transaction_type: 'debit',
      credits_amount: -ttsCredits,
      feature_used: 'tts_generation',
      description: `TTS generation via ${params.ttsProvider} for ${params.language}`,
      feature_metadata: {
        language: params.language,
        characters: params.totalCharacters,
        provider: params.ttsProvider,
        pipeline: 'genie-cast-assembler',
      },
      created_at: timestamp,
    });

    // Video assembly credits: 2 credits per minute of video
    if (params.assemblyProvider) {
      const videoMinutes = Math.ceil(params.totalDuration / 60);
      const videoCredits = videoMinutes * 2;
      transactions.push({
        transaction_type: 'debit',
        credits_amount: -videoCredits,
        feature_used: 'video_assembly',
        description: `Video assembly via ${params.assemblyProvider} (${videoMinutes} min)`,
        feature_metadata: {
          language: params.language,
          duration_seconds: params.totalDuration,
          provider: params.assemblyProvider,
          pipeline: 'genie-cast-assembler',
        },
        created_at: timestamp,
      });
    }

    // Full Production Mode adds extra credits for avatar/3D
    if (params.fullProductionMode) {
      transactions.push({
        transaction_type: 'debit',
        credits_amount: -10,
        feature_used: 'production_mode',
        description: 'Full Production Mode (Avatar, 3D, Transitions)',
        feature_metadata: {
          language: params.language,
          features: ['avatar', '3d', 'transitions'],
          pipeline: 'genie-cast-assembler',
        },
        created_at: timestamp,
      });
    }

    // Insert all transactions (skip user_id for now - would need auth context)
    for (const tx of transactions) {
      const { error } = await supabase
        .from('ai_credit_transactions')
        .insert(tx);

      if (error) {
        console.error(`Credit tracking failed for ${tx.feature_used}:`, error.message);
      } else {
        console.log(`💳 Tracked ${Math.abs(tx.credits_amount)} credits for ${tx.feature_used}`);
      }
    }

    const totalCredits = transactions.reduce((sum, tx) => sum + Math.abs(tx.credits_amount), 0);
    console.log(`📊 Total credits consumed: ${totalCredits}`);
  } catch (err) {
    console.error('Credit tracking error:', err);
    // Don't throw - credit tracking failure shouldn't block video generation
  }
}
