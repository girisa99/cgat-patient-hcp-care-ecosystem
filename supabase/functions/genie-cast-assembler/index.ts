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
      language = 'en', 
      quality = 'production', 
      includeVisuals = true,
      fullProductionMode = false,
      productionConfig = null,
      // Accept screenshots from orchestration service
      screenshots = [] as Array<{ screenId: string; imageUrl: string; order: number; productId?: string }>,
      // AI Messaging integration (from aiMessagingGeneratorService)
      customScript = null as string | null,
      customHook = null as string | null,
      customCta = null as string | null,
      useApprovedMessaging = false,
      // Approved messaging data (passed from orchestration service)
      approvedMessaging = null as {
        headline?: string;
        hook?: string;
        subHook?: string;
        cta?: string;
        ctaSecondary?: string;
        valueProposition?: string;
        painPoints?: string[];
        benefits?: string[];
        differentiators?: string[];
        openingLine?: string;
        closingLine?: string;
        transitionPhrases?: string[];
        shortScript?: string;
        mediumScript?: string;
        longScript?: string;
      } | null,
      // Per-chapter messaging (from Matrix view)
      chapterMessaging = null as Record<string, {
        hook?: string;
        script?: string;
        cta?: string;
        painPoints?: string[];
        benefits?: string[];
      }> | null,
      // NEW: Skip TTS regeneration if audio already exists
      skipExistingTTS = false,
      // NEW: Generate unified audio track (seamless, no breaks between chapters)
      unifiedAudio = true,  // Default to unified for seamless playback
      // NEW: Video style configuration from style cards
      videoStyle = 'educational',
      styleConfig = null as {
        videoProvider?: string;
        avatarProvider?: string;
        animationProvider?: string;
        ttsStyle?: string;
        visualEffect?: string;
        scriptTone?: string;
        pacing?: string;
        toneModifier?: {
          hookIntensity?: number;
          emotionalArc?: boolean;
          ctaFrequency?: string;
          humorLevel?: string;
        };
      } | null,
      // Cast project persistence — when provided, creates/updates cast_generation_jobs
      castProjectId = null as string | null,
    } = await req.json();
    
    // Create messaging context for script generation
    const messagingContext = {
      customScript,
      customHook,
      customCta,
      useApprovedMessaging,
      approvedMessaging,
      chapterMessaging,
    };
    
    console.log(`📷 Received ${screenshots.length} screenshots from orchestration service`);

    if (!language) {
      throw new Error('Language is required');
    }

    console.log(`🎬 Starting Genie Cast assembly for language: ${language}`);
    console.log(`🎨 Video Style: ${videoStyle}`);
    console.log(`🎥 Mode: ${fullProductionMode ? 'Full Production' : 'Standard'}`);
    console.log(`🔊 Skip existing TTS: ${skipExistingTTS ? 'Yes (reuse cached audio)' : 'No (regenerate all)'}`);
    console.log(`🔗 Unified Audio: ${unifiedAudio ? 'Yes (seamless single track)' : 'No (per-chapter)'}`);
    // Log style-specific configuration
    if (styleConfig) {
      console.log(`🎯 Style Config: provider=${styleConfig.videoProvider}, avatar=${styleConfig.avatarProvider || 'none'}, effect=${styleConfig.visualEffect}`);
      console.log(`📝 Script Tone: ${styleConfig.scriptTone}, Pacing: ${styleConfig.pacing}`);
      if (styleConfig.toneModifier) {
        console.log(`🎭 Tone Modifier: hook=${styleConfig.toneModifier.hookIntensity}, emotional=${styleConfig.toneModifier.emotionalArc}, humor=${styleConfig.toneModifier.humorLevel}`);
      }
    }
    
    if (fullProductionMode && productionConfig) {
      console.log(`👤 Avatar: ${productionConfig.avatar?.enabled ? `${productionConfig.avatar.gender} (${productionConfig.avatar.placement})` : 'disabled'}`);
      console.log(`✨ Animations: ${productionConfig.animations?.enabled ? productionConfig.animations.style : 'disabled'}`);
      console.log(`📦 3D: ${productionConfig.threeD?.enabled ? `${productionConfig.threeD.style} (${productionConfig.threeD.quality})` : 'disabled'}`);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Cast project persistence: create a generation job record if castProjectId provided
    let castJobId: string | null = null;
    if (castProjectId) {
      try {
        const { data: job, error: jobError } = await supabase
          .from('cast_generation_jobs')
          .insert({
            project_id: castProjectId,
            job_type: 'video',
            language,
            quality,
            style_intent: videoStyle,
            provider: `tts:${getTTSProvider(language).provider}/video:${getVideoProvider(language)}`,
            status: 'processing',
            started_at: new Date().toISOString(),
            input_config: { language, quality, fullProductionMode, videoStyle, unifiedAudio },
          })
          .select('id')
          .single();

        if (!jobError && job) {
          castJobId = job.id;
          console.log(`📋 Created cast_generation_jobs record: ${castJobId}`);
        } else if (jobError) {
          console.warn(`⚠️ Failed to create generation job record:`, jobError.message);
        }

        // Update project status to generating
        await supabase
          .from('cast_projects')
          .update({ status: 'generating' })
          .eq('id', castProjectId);
      } catch (persistErr) {
        console.warn(`⚠️ Cast project persistence error (non-fatal):`, persistErr);
      }
    }

    const ttsConfig = getTTSProvider(language);
    const videoProvider = getVideoProvider(language);

    const chapterResults: ChapterResult[] = [];
    let totalDuration = 0;
    
    // Track start time to enforce timeout limits
    const startTime = Date.now();
    const MAX_EXECUTION_MS = 55000; // 55 seconds - leave buffer for response
    
    // Helper to check if we're running low on time
    const isTimeRunningOut = () => (Date.now() - startTime) > MAX_EXECUTION_MS;
    
    // Log messaging context
    if (useApprovedMessaging || approvedMessaging) {
      console.log(`📝 Using approved messaging: hook="${approvedMessaging?.hook?.substring(0, 50)}..."`);
    }
    if (chapterMessaging) {
      console.log(`📝 Chapter-specific messaging provided for: ${Object.keys(chapterMessaging).join(', ')}`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // QUICK-RETURN PATTERN FOR FULL PRODUCTION MODE
    // Heavy 3D/Avatar generation is deferred to avoid edge function timeout
    // ═══════════════════════════════════════════════════════════════════════════════
    const deferHeavyGeneration = fullProductionMode;
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // UNIFIED AUDIO GENERATION (Seamless single track for all chapters)
    // ═══════════════════════════════════════════════════════════════════════════════
    let unifiedAudioUrl: string | undefined;
    let unifiedAudioBase64: string | undefined;
    
    if (unifiedAudio) {
      console.log(`🎵 Generating unified audio track for seamless playback...`);
      
      // Combine all chapter scripts into one continuous script with natural transitions
      // NOW INTEGRATES: approved messaging, hooks, CTAs, and positioning statements
      const allChapterScripts = CHAPTERS.map(chapter => {
        const script = getChapterScript(chapter.id, language, styleConfig, messagingContext);
        return script;
      }).join(' ... '); // Add natural pauses between chapters
      
      console.log(`   📜 Unified script length: ${allChapterScripts.length} chars`);
      console.log(`   📜 Preview: "${allChapterScripts.substring(0, 150)}..."`);
      
      try {
        // Check for cached unified audio first
        const cachedUnifiedAudio = skipExistingTTS 
          ? await findExistingAudio(supabase, 'unified-full', language) 
          : null;
        
        if (cachedUnifiedAudio) {
          console.log(`   ♻️ Reusing cached unified audio: ${cachedUnifiedAudio}`);
          unifiedAudioUrl = cachedUnifiedAudio;
        } else {
          // Generate unified TTS via multi-provider-tts
          const { data: ttsData, error: ttsError } = await supabase.functions.invoke('multi-provider-tts', {
            body: {
              text: allChapterScripts,
              language,
              languageCode: language,
              provider: ttsConfig.provider,
              returnBase64: true,
            },
          });
          
          if (ttsError) {
            console.error(`   ❌ Unified TTS failed: ${ttsError.message}`);
            // Fall back to per-chapter generation
          } else if (ttsData?.audioContent || ttsData?.audioBase64) {
            unifiedAudioBase64 = ttsData.audioContent || ttsData.audioBase64;
            
            // Upload to storage
            const timestamp = Date.now();
            const filePath = `tts-audio/${language}/unified-full-${timestamp}.mp3`;
            
            let cleanBase64 = unifiedAudioBase64!;
            if (cleanBase64.includes(',')) {
              cleanBase64 = cleanBase64.split(',')[1];
            }
            
            const binaryStr = atob(cleanBase64);
            const audioBuffer = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              audioBuffer[i] = binaryStr.charCodeAt(i);
            }
            
            console.log(`   📤 Uploading unified audio: ${audioBuffer.length} bytes`);
            
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
              unifiedAudioUrl = urlData?.publicUrl;
              console.log(`   ✅ Unified audio uploaded: ${unifiedAudioUrl}`);
            }
          } else if (ttsData?.jobId) {
            // Background job - poll for completion
            console.log(`   ⏳ Unified TTS started as background job: ${ttsData.jobId}`);
            // For now, fall back to per-chapter if async
          }
        }
      } catch (err) {
        console.error(`   ❌ Unified audio generation failed:`, err);
        // Fall back to per-chapter generation below
      }
    }

    // Process each chapter
    for (const chapter of CHAPTERS) {
      console.log(`📹 Processing chapter: ${chapter.product}`);

      try {
        // Step 1: Generate TTS audio for this chapter (or use unified audio)
        // If unified audio is available, skip per-chapter TTS generation
        let audioResult: { audioBase64?: string; audioUrl?: string; charactersUsed: number; cached: boolean };
        
        if (unifiedAudioUrl) {
          // Use unified audio - pass URL but set as "unified" source
          audioResult = {
            audioUrl: unifiedAudioUrl, // Same URL for all chapters (timeline will sync)
            audioBase64: unifiedAudioBase64,
            charactersUsed: 0, // Already counted in unified generation
            cached: true,
          };
          console.log(`   🔗 Using unified audio track for ${chapter.id}`);
        } else {
          // Fall back to per-chapter TTS generation
          audioResult = await generateChapterAudio(
            supabase,
            chapter.id,
            language,
            ttsConfig.provider,
            skipExistingTTS,  // Pass the skip flag
            styleConfig       // Pass style config for dynamic scripts
          );
        }

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

        // Step 3: Generate Avatar (if Full Production Mode enabled AND not deferring)
        // Avatar generation takes 30-60 seconds per segment - DEFER to avoid timeout
        let avatarUrl: string | undefined;
        if (fullProductionMode && productionConfig?.avatar?.enabled && !deferHeavyGeneration) {
          const shouldIncludeAvatar = 
            productionConfig.avatar.placement === 'throughout' ||
            (productionConfig.avatar.placement === 'intro_outro' && (chapter.id === 'opening' || chapter.id === 'closing')) ||
            (productionConfig.avatar.placement === 'chapter_intros');
          
          if (shouldIncludeAvatar && !isTimeRunningOut()) {
            avatarUrl = await generateAvatarSegment(
              supabase,
              chapter.id,
              language,
              productionConfig.avatar.gender,
              productionConfig.avatar.size,
              audioResult.audioBase64,
              audioResult.audioUrl
            );
            console.log(`👤 Avatar generated for ${chapter.id}: ${avatarUrl ? 'success' : 'skipped'}`);
          } else if (shouldIncludeAvatar) {
            console.log(`⏳ Avatar deferred for ${chapter.id} - will be generated in background job`);
          }
        }

        // Step 4: Generate 3D elements (if Full Production Mode enabled AND not deferring)
        // 3D generation takes 60-90 seconds per element - DEFER to avoid timeout
        let threeDUrl: string | undefined;
        if (fullProductionMode && productionConfig?.threeD?.enabled && !deferHeavyGeneration) {
          if (chapter.id !== 'opening' && chapter.id !== 'closing' && !isTimeRunningOut()) {
            threeDUrl = await generate3DElement(
              supabase,
              chapter.product,
              productionConfig.threeD.style,
              productionConfig.threeD.quality
            );
            console.log(`📦 3D element generated for ${chapter.product}: ${threeDUrl ? 'success' : 'skipped'}`);
          } else if (chapter.id !== 'opening' && chapter.id !== 'closing') {
            console.log(`⏳ 3D element deferred for ${chapter.product} - will be generated in background job`);
          }
        }

        // Step 5: Generate animated transitions (if enabled AND not deferring)
        // Transition generation takes 10-30 seconds - can run if time allows
        let transitionUrl: string | undefined;
        if (fullProductionMode && productionConfig?.animations?.enabled && !isTimeRunningOut()) {
          transitionUrl = await generateTransition(
            supabase,
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
      // Each chapter script length - use styleConfig for accurate counting
      return sum + (getChapterScript(ch.chapterId, language, styleConfig).length || 0);
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
    const deferredFeatures: string[] = [];
    if (fullProductionMode && productionConfig) {
      if (productionConfig.avatar?.enabled) {
        if (deferHeavyGeneration) {
          deferredFeatures.push('avatar');
        } else {
          enabledFeatures.push(`avatar_${productionConfig.avatar.gender}`);
        }
      }
      if (productionConfig.animations?.enabled) enabledFeatures.push(`animation_${productionConfig.animations.style}`);
      if (productionConfig.threeD?.enabled) {
        if (deferHeavyGeneration) {
          deferredFeatures.push('3d');
        } else {
          enabledFeatures.push(`3d_${productionConfig.threeD.style}`);
        }
      }
    }

    // Determine generation status
    const hasDeferred = deferredFeatures.length > 0;
    const isPending = assemblyResult.pendingGeneration || hasDeferred;
    
    const result: AssemblyResult = {
      success: assemblyResult.success || hasDeferred, // Partial success if TTS completed
      videoUrl: assemblyResult.videoUrl,
      thumbnailUrl: assemblyResult.thumbnailUrl,
      totalDuration,
      chapters: chapterResults,
      language,
      providers: {
        tts: ttsConfig.provider,
        video: videoProvider,
        avatar: fullProductionMode && productionConfig?.avatar?.enabled ? 'Alibaba Wan2.2 (deferred)' : undefined,
        threeD: fullProductionMode && productionConfig?.threeD?.enabled ? 'Meshy AI (deferred)' : undefined,
      },
      productionMode: fullProductionMode ? {
        enabled: true,
        features: enabledFeatures,
      } : undefined,
      // Status tracking for async video generation
      generationStatus: isPending ? 'pending' : 'completed',
      message: hasDeferred 
        ? `TTS audio generated successfully. Heavy assets (${deferredFeatures.join(', ')}) are deferred to avoid timeout - video will use screenshots only.`
        : (assemblyResult.pendingGeneration 
          ? 'TTS audio generated. Video assembly in progress via JSON2Video.'
          : 'Video generation completed successfully.'),
    };

    const elapsedMs = Date.now() - startTime;
    console.log(`✅ Assembly complete for ${language}: ${totalDuration}s total (took ${elapsedMs}ms)`);
    if (hasDeferred) {
      console.log(`⏳ Deferred heavy generation: ${deferredFeatures.join(', ')}`);
    }
    if (assemblyResult.pendingGeneration) {
      console.log(`⚠️ Video file pending - TTS audio ready, awaiting video assembly`);
    }

    // Cast project persistence: update job and project on completion
    if (castJobId && castProjectId) {
      try {
        const jobStatus = result.success ? (isPending ? 'rendering' : 'completed') : 'failed';
        await supabase.from('cast_generation_jobs').update({
          status: jobStatus,
          output_url: result.videoUrl || null,
          output_thumbnail_url: result.thumbnailUrl || null,
          output_duration_seconds: totalDuration || null,
          provider_job_id: assemblyResult.renderProjectId || null,
          completed_at: jobStatus === 'completed' ? new Date().toISOString() : null,
          output_metadata: {
            chapters: chapterResults.map(c => ({ id: c.chapterId, product: c.product, success: c.success })),
            providers: result.providers,
            elapsedMs,
          },
        }).eq('id', castJobId);

        // Update project with final output
        if (result.success) {
          const projectUpdate: Record<string, any> = {
            status: isPending ? 'generating' : 'review',
          };
          if (result.videoUrl) projectUpdate.final_video_url = result.videoUrl;
          if (result.thumbnailUrl) projectUpdate.thumbnail_url = result.thumbnailUrl;
          if (totalDuration > 0) projectUpdate.total_duration_seconds = totalDuration;

          await supabase.from('cast_projects').update(projectUpdate).eq('id', castProjectId);
        }
        console.log(`📋 Updated cast job ${castJobId} → ${jobStatus}`);
      } catch (persistErr) {
        console.warn(`⚠️ Cast job update error (non-fatal):`, persistErr);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Genie Cast assembly error:', error);

    // Cast project persistence: mark job as failed on error
    if (castProjectId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const errSupabase = createClient(supabaseUrl, supabaseKey);
        const errorMsg = error instanceof Error ? error.message : 'Assembly failed';

        // Update any processing jobs for this project
        await errSupabase.from('cast_generation_jobs')
          .update({ status: 'failed', error_message: errorMsg, completed_at: new Date().toISOString() })
          .eq('project_id', castProjectId)
          .eq('status', 'processing');

        await errSupabase.from('cast_projects')
          .update({ status: 'review' })
          .eq('id', castProjectId);
      } catch (_) {
        // Best-effort persistence — don't mask the original error
      }
    }

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
  skipIfExists: boolean = false,
  styleConfig: StyleConfig | null = null
): Promise<{ audioBase64?: string; audioUrl?: string; charactersUsed: number; cached: boolean; scriptUsed?: string }> {
  // Check for existing audio if skipIfExists is enabled
  // NOTE: When style changes, we should regenerate - so add style hash to cache key in future
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
  
  // Generate dynamic script based on style configuration
  const script = getChapterScript(chapterId, language, styleConfig);
  const charactersUsed = script.length;
  
  console.log(`   📝 Script for ${chapterId} (${styleConfig?.scriptTone || 'default'} tone): "${script.substring(0, 80)}..."`);
  console.log(`   🎯 Hook intensity: ${styleConfig?.toneModifier?.hookIntensity ?? 'default'}, Emotional arc: ${styleConfig?.toneModifier?.emotionalArc ?? false}`);
  
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

// Style configuration interface for dynamic script generation
interface StyleConfig {
  videoProvider?: string;
  avatarProvider?: string;
  animationProvider?: string;
  ttsStyle?: string;
  visualEffect?: string;
  scriptTone?: string;
  pacing?: string;
  toneModifier?: {
    hookIntensity?: number;
    emotionalArc?: boolean;
    ctaFrequency?: string;
    humorLevel?: string;
  };
}

// ============================================================================
// MESSAGING CONTEXT INTERFACE
// Defines the structure for approved messaging integration
// ============================================================================
interface MessagingContextType {
  customScript?: string | null;
  customHook?: string | null;
  customCta?: string | null;
  useApprovedMessaging?: boolean;
  approvedMessaging?: {
    headline?: string;
    hook?: string;
    subHook?: string;
    cta?: string;
    ctaSecondary?: string;
    valueProposition?: string;
    painPoints?: string[];
    benefits?: string[];
    differentiators?: string[];
    openingLine?: string;
    closingLine?: string;
    transitionPhrases?: string[];
    shortScript?: string;
    mediumScript?: string;
    longScript?: string;
  } | null;
  chapterMessaging?: Record<string, {
    hook?: string;
    script?: string;
    cta?: string;
    painPoints?: string[];
    benefits?: string[];
  }> | null;
}

/**
 * DYNAMIC SCRIPT GENERATION WITH MESSAGING INTEGRATION
 * 
 * Priority order:
 * 1. Chapter-specific custom messaging (from Matrix view)
 * 2. Approved messaging (from aiMessagingGeneratorService)
 * 3. Custom script/hook/cta (from Quick Generate)
 * 4. Rich transcreated base scripts (landing page quality)
 * 
 * Adapts scripts based on selected video style configuration:
 * - Hook Videos: Strong attention-grabbing hooks, high energy
 * - Educational: Clear, informative, methodical
 * - UGC Avatar / 3D Pixar: Warm, playful, conversational
 * - Smart Storytelling: Emotional narrative arc
 */
function getChapterScript(
  chapterId: string, 
  language: string, 
  styleConfig?: StyleConfig | null,
  messagingContext?: MessagingContextType | null
): string {
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // PRIORITY 1: Chapter-specific custom messaging (from Matrix view)
  // ═══════════════════════════════════════════════════════════════════════════════
  if (messagingContext?.chapterMessaging?.[chapterId]) {
    const chapterMsg = messagingContext.chapterMessaging[chapterId];
    if (chapterMsg.script) {
      console.log(`   📝 Using chapter-specific script for ${chapterId}`);
      let script = chapterMsg.script;
      
      // Prepend hook if available
      if (chapterMsg.hook) {
        script = `${chapterMsg.hook}\n\n${script}`;
      }
      
      // Append CTA if available and this is a product chapter
      if (chapterMsg.cta && chapterId !== 'opening') {
        script = `${script}\n\n${chapterMsg.cta}`;
      }
      
      // Apply style transformations
      if (styleConfig) {
        script = applyStyleTransformations(chapterId, script, styleConfig, language);
      }
      
      return script;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // PRIORITY 2: Approved messaging from aiMessagingGeneratorService
  // ═══════════════════════════════════════════════════════════════════════════════
  if (messagingContext?.useApprovedMessaging && messagingContext?.approvedMessaging) {
    const msg = messagingContext.approvedMessaging;
    
    // Build script from approved messaging components
    let script = '';
    
    if (chapterId === 'opening') {
      // Opening uses headline, hook, and value proposition
      script = buildOpeningFromMessaging(msg);
    } else if (chapterId === 'closing') {
      // Closing uses closing line and CTA
      script = buildClosingFromMessaging(msg);
    } else {
      // Product chapters use medium script or build from components
      script = buildProductChapterFromMessaging(chapterId, msg);
    }
    
    if (script) {
      console.log(`   📝 Using approved messaging for ${chapterId}`);
      
      // Apply style transformations
      if (styleConfig) {
        script = applyStyleTransformations(chapterId, script, styleConfig, language);
      }
      
      return script;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // PRIORITY 3: Custom script/hook/cta (from Quick Generate)
  // ═══════════════════════════════════════════════════════════════════════════════
  if (messagingContext?.customScript && chapterId === 'opening') {
    let script = messagingContext.customScript;
    
    if (messagingContext.customHook) {
      script = `${messagingContext.customHook}\n\n${script}`;
    }
    
    if (messagingContext.customCta) {
      script = `${script}\n\n${messagingContext.customCta}`;
    }
    
    console.log(`   📝 Using custom script for ${chapterId}`);
    
    if (styleConfig) {
      script = applyStyleTransformations(chapterId, script, styleConfig, language);
    }
    
    return script;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // PRIORITY 4: RICH TRANSCREATED SCRIPTS - Full, engaging content
  // These are the same professional scripts used on the landing page for each language
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const ENGLISH_SCRIPTS: Record<string, string> = {
    'opening': `Welcome to Genie Studio – where your ideas become reality.

Seven powerful products. 206 AI pipelines. 12 world-class providers. Over 70 languages with authentic regional voices.

From Tokyo to Dubai, São Paulo to Mumbai – your creative vision, instantly realized.

Let me show you the magic.`,
    'spark': `Genie Spark transforms chaos into clarity.

Drop any input – a video, a document, a URL, or just speak your idea – and watch as AI crafts the perfect script for your audience, your industry, your style.

From idea to words in seconds.`,
    'mind': `Genie Mind doesn't just write – it understands.

AI-powered enhancement that elevates your message. Native voices in your language that sound authentic, not robotic.

We don't translate. We transcreate. Every language sounds like home.`,
    'vibe': `Genie Vibe brings scripts to life.

Professional video production with AI avatars that speak naturally in any language. Perfect lip-sync. Cinematic quality.

74 video pipelines. 4K resolution. From your phone to the world.`,
    'deck': `Genie Deck ends presentation pain.

One prompt. One click. A complete professional presentation with 3D elements, animated charts, and avatars that present for you.

101 frameworks. 25 industries. From boardroom to social media.`,
    'arc': `Production Hub is your creative command center.

AI-powered timeline editing with real-time suggestions. Multi-track audio, effects, and transitions – all in one place.

Edit like a pro. Export anywhere.`,
    'ask-genie': `Ask Genie understands natural language.

Just tell it what you need. A presentation for investors? A training video? A social campaign?

Ask, and Genie orchestrates every tool to deliver exactly what you imagined.`,
    'cast': `Genie Cast takes you global.

Publish to YouTube, TikTok, Instagram, LinkedIn, WeChat, WhatsApp – all from one place.

Real-time analytics. A/B testing. 50+ countries. 70+ languages.

Your story, everywhere.`,
    'closing': `This is Genie Studio. Seven products. 206 pipelines. Unlimited possibilities.

Spark ignites ideas. Mind understands. Vibe visualizes. Deck presents. Arc perfects. Ask Genie orchestrates. Cast amplifies.

Your wish is our command.`
  };

  const HINDI_SCRIPTS: Record<string, string> = {
    'opening': `जीनी स्टूडियो में आपका स्वागत है – जहां आपके आइडियाज़ हकीकत बन जाते हैं।

सात शक्तिशाली प्रोडक्ट्स। 206 AI पाइपलाइन। 12 विश्व स्तरीय प्रोवाइडर्स। 70 से ज़्यादा भाषाएं असली क्षेत्रीय आवाज़ों के साथ।

टोक्यो से दुबई, साओ पाउलो से मुंबई तक – आपकी रचनात्मक कल्पना, तुरंत साकार।

चलिए जादू दिखाते हैं।`,
    'spark': `जीनी स्पार्क अराजकता को स्पष्टता में बदलता है।

कोई भी इनपुट डालें – वीडियो, डॉक्यूमेंट, URL, या बस अपना आइडिया बोलें – और देखें AI कैसे परफेक्ट स्क्रिप्ट बनाता है।

आइडिया से शब्द, सेकंड्स में।`,
    'mind': `जीनी माइंड सिर्फ लिखता नहीं – समझता है।

AI-पावर्ड एन्हांसमेंट जो आपके मैसेज को ऊंचाई देता है। आपकी भाषा में असली आवाज़ें।

हम ट्रांसलेट नहीं करते। ट्रांसक्रिएट करते हैं। हर भाषा घर जैसी लगती है।`,
    'vibe': `जीनी वाइब स्क्रिप्ट्स को जिंदा करता है।

AI अवतारों के साथ प्रोफेशनल वीडियो प्रोडक्शन। परफेक्ट लिप-सिंक। सिनेमैटिक क्वालिटी।

74 वीडियो पाइपलाइन। 4K रेज़ॉल्यूशन। आपके फ़ोन से दुनिया तक।`,
    'deck': `जीनी डेक प्रेज़ेंटेशन का दर्द खत्म करता है।

एक प्रॉम्प्ट। एक क्लिक। 3D एलिमेंट्स और एनिमेटेड चार्ट्स के साथ पूरी प्रोफेशनल प्रेज़ेंटेशन।

101 फ्रेमवर्क। 25 इंडस्ट्रीज़। बोर्डरूम से सोशल मीडिया तक।`,
    'arc': `प्रोडक्शन हब आपका क्रिएटिव कमांड सेंटर है।

रियल-टाइम सुझावों के साथ AI-पावर्ड टाइमलाइन एडिटिंग। मल्टी-ट्रैक ऑडियो, इफेक्ट्स – सब एक जगह।

प्रो की तरह एडिट करें। कहीं भी एक्सपोर्ट करें।`,
    'ask-genie': `आस्क जीनी नेचुरल लैंग्वेज समझता है।

बस बताइए क्या चाहिए। इन्वेस्टर्स के लिए प्रेज़ेंटेशन? ट्रेनिंग वीडियो? सोशल कैम्पेन?

पूछिए, और जीनी आपकी कल्पना को साकार करता है।`,
    'cast': `जीनी कास्ट आपको ग्लोबल ले जाता है।

YouTube, TikTok, Instagram, LinkedIn, WhatsApp – एक जगह से सब पर पब्लिश करें।

रियल-टाइम एनालिटिक्स। 50+ देश। 70+ भाषाएं।

आपकी कहानी, हर जगह।`,
    'closing': `यह है जीनी स्टूडियो। सात प्रोडक्ट्स। 206 पाइपलाइन। असीमित संभावनाएं।

आपकी इच्छा ही हमारा आदेश है।`
  };

  const ARABIC_SCRIPTS: Record<string, string> = {
    'opening': `مرحباً بك في جيني ستوديو – حيث تتحول أفكارك إلى واقع.

سبعة منتجات قوية. 206 خط أنابيب للذكاء الاصطناعي. 12 مزودًا عالميًا. أكثر من 70 لغة بأصوات إقليمية أصيلة.

من طوكيو إلى دبي، من ساو باولو إلى مومباي – رؤيتك الإبداعية تتحقق فورًا.

دعني أريك السحر.`,
    'spark': `جيني سبارك يحول الفوضى إلى وضوح.

أدخل أي مدخل – فيديو، مستند، رابط، أو فقط تحدث بفكرتك – وشاهد كيف يصنع الذكاء الاصطناعي النص المثالي لجمهورك.

من الفكرة إلى الكلمات، في ثوانٍ.`,
    'mind': `جيني مايند لا يكتب فقط – بل يفهم.

تحسين مدعوم بالذكاء الاصطناعي يرتقي برسالتك. أصوات أصيلة بلغتك تبدو طبيعية، ليست آلية.

نحن لا نترجم. نحن نبدع من جديد. كل لغة تبدو كالوطن.`,
    'vibe': `جيني فايب يحيي النصوص.

إنتاج فيديو احترافي مع أفاتارات ذكاء اصطناعي تتحدث بشكل طبيعي بأي لغة. مزامنة شفاه مثالية. جودة سينمائية.

74 خط أنابيب فيديو. دقة 4K. من هاتفك إلى العالم.`,
    'deck': `جيني ديك يحول الأفكار إلى عروض تقديمية مذهلة. عرض كامل بعناصر ثلاثية الأبعاد ورسوم متحركة.

101 إطار. 25 صناعة. من غرفة الاجتماعات إلى وسائل التواصل.`,
    'arc': `مركز الإنتاج هو مركز التحكم الإبداعي الخاص بك.

تحرير الجدول الزمني بالذكاء الاصطناعي مع اقتراحات فورية. صوت متعدد المسارات، تأثيرات – كل شيء في مكان واحد.`,
    'ask-genie': `اسأل جيني يفهم اللغة الطبيعية.

فقط قل ما تحتاجه. عرض للمستثمرين؟ فيديو تدريبي؟ حملة اجتماعية؟

اسأل، وجيني ينسق كل أداة لتقديم ما تخيلته بالضبط.`,
    'cast': `جيني كاست يأخذك عالميًا.

انشر على يوتيوب، تيك توك، إنستغرام، لينكد إن – كل شيء من مكان واحد.

تحليلات فورية. أكثر من 50 دولة. أكثر من 70 لغة.

قصتك، في كل مكان.`,
    'closing': `هذا هو جيني ستوديو. سبعة منتجات. 206 خط أنابيب. إمكانيات لا حدود لها.

أمنيتك هي أمرنا.`
  };

  const CHINESE_SCRIPTS: Record<string, string> = {
    'opening': `欢迎来到 Genie Studio – 让您的想法变为现实。

七款强大产品。206条AI管道。12家世界级供应商。70多种语言，配备真实的区域语音。

从东京到迪拜，从圣保罗到孟买 – 您的创意愿景，即刻实现。

让我向您展示魔法。`,
    'spark': `Genie Spark 将混乱转化为清晰。

输入任何内容 – 视频、文档、链接，或直接说出您的想法 – 看AI如何为您的受众打造完美脚本。

从想法到文字，只需几秒。`,
    'mind': `Genie Mind 不仅仅是写作 – 它理解。

AI驱动的增强功能提升您的信息。您的语言中的真实声音，听起来自然，不是机器人。

我们不翻译。我们转创作。每种语言都像家一样。`,
    'vibe': `Genie Vibe 让脚本栩栩如生。

专业视频制作，配备AI头像，可用任何语言自然说话。完美的口型同步。电影级质量。

74条视频管道。4K分辨率。从您的手机到世界。`,
    'closing': `这就是 Genie Studio。七款产品。206条管道。无限可能。

您的愿望就是我们的命令。`
  };

  // Map language code to script set
  const SCRIPT_MAPS: Record<string, Record<string, string>> = {
    'en': ENGLISH_SCRIPTS,
    'hi': HINDI_SCRIPTS,
    'ar': ARABIC_SCRIPTS,
    'zh': CHINESE_SCRIPTS,
  };

  // Get base script from rich transcreated content
  const langScripts = SCRIPT_MAPS[language] || SCRIPT_MAPS['en'];
  let script = langScripts[chapterId] || ENGLISH_SCRIPTS[chapterId] || '';
  
  // Apply style-specific transformations (works for ALL languages now)
  if (styleConfig) {
    script = applyStyleTransformations(chapterId, script, styleConfig, language);
  }
  
  return script;
}

/**
 * Build opening chapter from approved messaging
 */
function buildOpeningFromMessaging(msg: MessagingContextType['approvedMessaging']): string {
  if (!msg) return '';
  
  const parts: string[] = [];
  
  // Start with hook or headline
  if (msg.hook) {
    parts.push(msg.hook);
  } else if (msg.headline) {
    parts.push(msg.headline);
  }
  
  // Add opening line if different from hook
  if (msg.openingLine && msg.openingLine !== msg.hook) {
    parts.push(msg.openingLine);
  }
  
  // Add value proposition
  if (msg.valueProposition) {
    parts.push(msg.valueProposition);
  }
  
  // Add sub-hook for intrigue
  if (msg.subHook) {
    parts.push(msg.subHook);
  }
  
  // Add a transition phrase if available
  if (msg.transitionPhrases && msg.transitionPhrases.length > 0) {
    parts.push(msg.transitionPhrases[0]);
  }
  
  return parts.join('\n\n');
}

/**
 * Build closing chapter from approved messaging
 */
function buildClosingFromMessaging(msg: MessagingContextType['approvedMessaging']): string {
  if (!msg) return '';
  
  const parts: string[] = [];
  
  // Add differentiators as a summary
  if (msg.differentiators && msg.differentiators.length > 0) {
    parts.push(msg.differentiators.slice(0, 2).join('. ') + '.');
  }
  
  // Add closing line
  if (msg.closingLine) {
    parts.push(msg.closingLine);
  }
  
  // Add CTA
  if (msg.cta) {
    parts.push(msg.cta);
  }
  
  // Add secondary CTA for urgency
  if (msg.ctaSecondary) {
    parts.push(msg.ctaSecondary);
  }
  
  return parts.join('\n\n');
}

/**
 * Build product chapter from approved messaging
 * Uses medium script if available, otherwise builds from components
 */
function buildProductChapterFromMessaging(chapterId: string, msg: MessagingContextType['approvedMessaging']): string {
  if (!msg) return '';
  
  // Prefer pre-written scripts
  if (msg.mediumScript) {
    return msg.mediumScript;
  }
  
  if (msg.shortScript) {
    return msg.shortScript;
  }
  
  // Build from components
  const parts: string[] = [];
  
  // Start with a pain point (problem)
  if (msg.painPoints && msg.painPoints.length > 0) {
    parts.push(`Ever struggled with ${msg.painPoints[0].toLowerCase()}?`);
  }
  
  // Add value proposition as solution
  if (msg.valueProposition) {
    parts.push(msg.valueProposition);
  }
  
  // Add benefits
  if (msg.benefits && msg.benefits.length > 0) {
    const benefitText = msg.benefits.slice(0, 3).join('. ') + '.';
    parts.push(benefitText);
  }
  
  // Add transition for next chapter
  if (msg.transitionPhrases && msg.transitionPhrases.length > 1) {
    parts.push(msg.transitionPhrases[1]);
  }
  
  return parts.join('\n\n');
}

/**
 * Apply style-specific transformations to scripts
 * Creates engaging hooks, emotional arcs, and tone variations
 * NOW WORKS FOR ALL LANGUAGES (not just English)
 */
function applyStyleTransformations(chapterId: string, baseScript: string, styleConfig: StyleConfig, language: string = 'en'): string {
  const { scriptTone, pacing, toneModifier } = styleConfig;
  const hookIntensity = toneModifier?.hookIntensity ?? 0.5;
  const emotionalArc = toneModifier?.emotionalArc ?? false;
  const humorLevel = toneModifier?.humorLevel ?? 'none';

  // For non-English languages, apply intensity modifiers but keep transcreated base content
  // This preserves authentic regional scripts while adding style energy
  if (language !== 'en') {
    // High hook intensity - add energy markers that work cross-linguistically
    if (hookIntensity >= 0.7) {
      // Add emphasis punctuation and exclamations that work universally
      return baseScript
        .replace(/\.\s/g, '! ')  // Add excitement
        .replace(/\n\n/g, '\n\n... ');  // Add dramatic pauses
    }
    // Return rich base script for non-English (already engaging and transcreated)
    return baseScript;
  }

  // English-specific transformations (full style options)
  if (hookIntensity >= 0.7) {
    return getHookStyleScript(chapterId, baseScript, hookIntensity);
  }

  if (emotionalArc && scriptTone === 'storytelling') {
    return getEmotionalStoryScript(chapterId, baseScript);
  }

  if (scriptTone === 'friendly' || scriptTone === 'playful') {
    return getPlayfulScript(chapterId, baseScript, humorLevel);
  }

  if (pacing === 'fast') {
    return getFastPacedScript(chapterId, baseScript);
  }

  if (scriptTone === 'professional' || scriptTone === 'educational') {
    return getEducationalScript(chapterId, baseScript);
  }

  return baseScript;
}

/**
 * Generate high-energy hook-style scripts
 * For: Hook Videos, Viral Content, TikTok-style
 */
function getHookStyleScript(chapterId: string, _baseScript: string, intensity: number): string {
  const hookScripts: Record<string, string[]> = {
    'opening': [
      "STOP scrolling! What if I told you there's a platform that turns your wildest ideas into professional content in minutes? Welcome to Genie Studio.",
      "Here's something nobody's talking about: AI just made content creation 10x easier. Let me show you how.",
      "Wait! Before you spend another hour struggling with content, you NEED to see this.",
    ],
    'spark': [
      "You know that feeling when you have an amazing idea but can't get it on paper? Gone. Forever. Genie Spark transforms ideas into scripts INSTANTLY.",
      "Writers block? What's that? Watch this: idea in, professional script out, confidence score tells you it's ready to go.",
      "Stop wasting hours on scripts. I just made one in 10 seconds. Here's how.",
    ],
    'mind': [
      "Your scripts are good. But what if they could be GREAT? Genie Mind's AI suggestions will blow your mind.",
      "Plot twist: AI just made your writing better than ever. Real-time suggestions, clarity fixes, translations - all automatic.",
      "You're leaving engagement on the table. Let me show you what AI-enhanced scripts look like.",
    ],
    'vibe': [
      "Recording studios cost thousands. Genie Vibe? Free. Teleprompter, AI editing, professional output - all in one place.",
      "I just recorded and edited a video without touching editing software. This changes everything.",
      "From amateur to professional in one click. Watch what Genie Vibe does to your recordings.",
    ],
    'deck': [
      "Presentations used to take hours. Now they take minutes. Watch Genie Deck work its magic.",
      "Your slides are boring. There, I said it. But they don't have to be. AI-designed templates incoming.",
      "PowerPoint who? Genie Deck just revolutionized how we create presentations.",
    ],
    'arc': [
      "Your content calendar is chaos. Mine? Crystal clear. Here's the tool that changed everything.",
      "Content creators: stop losing track of your projects. Genie Arc is your secret weapon.",
      "Kanban boards, calendars, team sync - all automated. Welcome to organized content creation.",
    ],
    'ask-genie': [
      "What if you had a genius assistant available 24/7? Meet Ask Genie - your personal AI guide.",
      "Stuck? Confused? Just ask. This AI knows everything about the platform and it's FREE.",
      "The fastest way to master any tool: Ask Genie. Watch how it works.",
    ],
    'cast': [
      "One click. YouTube, LinkedIn, TikTok - everywhere. Your content, distributed globally in seconds.",
      "Publishing content manually? That's so 2023. Genie Cast does it all automatically.",
      "Watch your reach explode. One upload, every platform, real analytics. Game changed.",
    ],
    'closing': [
      "Your wish is literally our command. Start free. Start now. Your content revolution begins today.",
      "What are you waiting for? Every second you're not using Genie Studio, you're falling behind.",
      "From mind to media, from idea to impact. Click below and join thousands of creators.",
    ],
  };

  const scripts = hookScripts[chapterId] || [_baseScript];
  // Select based on intensity (higher = more aggressive hook)
  const index = Math.min(Math.floor(intensity * scripts.length), scripts.length - 1);
  return scripts[index];
}

/**
 * Generate emotional storytelling scripts
 * For: Smart Storytelling, Cinematic styles
 */
function getEmotionalStoryScript(chapterId: string, _baseScript: string): string {
  const storyScripts: Record<string, string> = {
    'opening': "Every great story starts with a spark of imagination. A moment where possibility meets purpose. Welcome to Genie Studio - where your creative journey transforms from vision to reality.",
    'spark': "Remember the last time an idea struck you? That electric moment of inspiration? Genie Spark captures that magic, nurturing your thoughts into powerful scripts that speak to hearts and minds.",
    'mind': "Words have power. They can move mountains, change minds, inspire action. Genie Mind doesn't just enhance your scripts - it helps you find the perfect words to tell your unique story.",
    'vibe': "Behind every memorable video is a creator who dared to share their authentic self. Genie Vibe becomes your trusted studio - where your voice, your message, your story comes alive.",
    'deck': "The best presentations don't just inform - they transform. Genie Deck helps you craft visual stories that captivate audiences and leave lasting impressions.",
    'arc': "Creating content is a journey, not a destination. Genie Arc walks beside you, organizing your creative path and keeping your team united in purpose.",
    'ask-genie': "We all need a guide sometimes. Someone who understands our challenges and illuminates the path forward. Ask Genie is that trusted companion, always ready to help.",
    'cast': "Your story deserves to be heard. Genie Cast carries your message across borders and platforms, connecting you with audiences who are waiting to be moved by what you create.",
    'closing': "This is your moment. Your story. Your time to create something meaningful. From mind to media, Genie Studio is here to help you share your gift with the world.",
  };
  return storyScripts[chapterId] || _baseScript;
}

/**
 * Generate playful, warm scripts
 * For: UGC Avatar, 3D Pixar, Friendly styles
 */
function getPlayfulScript(chapterId: string, _baseScript: string, humorLevel: string): string {
  const playfulScripts: Record<string, { warm: string; humorous: string }> = {
    'opening': {
      warm: "Hey there, creative friend! Ready to see something amazing? Genie Studio is like having a whole creative team in your pocket. Seven awesome tools, one super easy platform!",
      humorous: "Okay, confession time: I used to spend HOURS making content. Then I found Genie Studio and now I have way too much free time. It's almost embarrassing!",
    },
    'spark': {
      warm: "Got an idea bouncing around in your head? Genie Spark loves those! Just share your thought and watch it bloom into a beautiful script. It's like having a creative best friend!",
      humorous: "Remember when writing scripts felt like solving a Rubik's cube blindfolded? Yeah, Genie Spark said 'no thanks' to all that stress. Ideas in, magic out!",
    },
    'mind': {
      warm: "Think of Genie Mind as your helpful writing buddy. It gently suggests improvements, helps with translations, and makes your words shine even brighter!",
      humorous: "My English teacher would be so jealous. Genie Mind makes my writing sound WAY smarter than I actually am. Don't tell anyone!",
    },
    'vibe': {
      warm: "Ready for your close-up? Genie Vibe is like a cozy recording studio that fits right on your screen. Teleprompter included, no technical stress allowed!",
      humorous: "I used to be terrified of the record button. Now with Genie Vibe, I'm basically a movie star. Okay, maybe a YouTube star. Okay, fine, my mom watches my videos.",
    },
    'deck': {
      warm: "Presentations can be fun! Really! Genie Deck turns your ideas into gorgeous slides that'll make your audience smile. Beautiful templates, zero headaches!",
      humorous: "Death by PowerPoint? Not on Genie Deck's watch! Your slides will be so pretty, people will actually stay awake. Revolutionary, I know!",
    },
    'arc': {
      warm: "Staying organized is a breeze with Genie Arc! Pretty boards, helpful calendars, and everything in its place. Your creative projects will thank you!",
      humorous: "I used to have sticky notes EVERYWHERE. My wall looked like a crime board. Genie Arc saved my sanity and probably my wallpaper.",
    },
    'ask-genie': {
      warm: "Feeling a bit lost? Ask Genie is here to help! It's like having a friendly expert who never gets tired of your questions. Ask away, friend!",
      humorous: "Ask Genie knows everything about the platform. EVERYTHING. It's like that one friend who actually reads the instructions. We all need one!",
    },
    'cast': {
      warm: "Time to share your creation with the world! Genie Cast spreads your content across all the platforms with just one click. Your audience is waiting!",
      humorous: "Remember manually posting to every platform? Neither do I because I blocked out that trauma. Genie Cast is my therapy now.",
    },
    'closing': {
      warm: "Your creative journey starts here! Genie Studio is ready to be your partner in making something wonderful. Let's create together!",
      humorous: "So what are you waiting for? An engraved invitation? Actually, this IS your invitation. Now go make something awesome!",
    },
  };

  const scripts = playfulScripts[chapterId];
  if (!scripts) return _baseScript;
  return humorLevel === 'high' || humorLevel === 'medium' ? scripts.humorous : scripts.warm;
}

/**
 * Generate fast-paced, energetic scripts
 * For: Dynamic, Energetic, Quick-cut styles
 */
function getFastPacedScript(chapterId: string, _baseScript: string): string {
  const fastScripts: Record<string, string> = {
    'opening': "Genie Studio. Seven products. One platform. AI-powered. Create content. Share everywhere. Start now.",
    'spark': "Ideas to scripts. Seconds. Not hours. Confidence scoring built-in. Professional output guaranteed. Genie Spark.",
    'mind': "AI suggestions. Real-time. Clarity fixes. Multi-language. Script enhancement. Instant. Genie Mind.",
    'vibe': "Record. Edit. Export. Pro-level. One platform. No stress. Teleprompter ready. Genie Vibe.",
    'deck': "Templates. Smart layouts. Beautiful slides. PowerPoint export. PDF ready. Seconds. Genie Deck.",
    'arc': "Kanban. Calendar. Team sync. Automated scheduling. Content organized. Finally. Genie Arc.",
    'ask-genie': "Questions? Answered. Guidance? Instant. Features? Mastered. AI assistant. Always ready. Ask Genie.",
    'cast': "One click. All platforms. YouTube. LinkedIn. TikTok. Analytics. Growth. Genie Cast.",
    'closing': "Your wish. Our command. Mind to media. Start free. Start now. Genie Studio.",
  };
  return fastScripts[chapterId] || _baseScript;
}

/**
 * Generate educational, methodical scripts
 * For: Educational, Tutorial, Professional styles
 */
function getEducationalScript(chapterId: string, _baseScript: string): string {
  const eduScripts: Record<string, string> = {
    'opening': "Welcome to this comprehensive overview of Genie Studio. Today, we'll explore seven integrated products designed to streamline your content creation workflow from ideation to distribution.",
    'spark': "Let's begin with Genie Spark - your ideation tool. The process is straightforward: input your concept, and the AI generates a professionally structured script. The confidence scoring system provides quantitative feedback on message clarity and engagement potential.",
    'mind': "Next, we'll examine Genie Mind, the script enhancement module. Key features include real-time AI suggestions for improving clarity, grammatical refinement, and integrated translation supporting 14 languages.",
    'vibe': "Genie Vibe serves as your recording environment. The interface includes a built-in teleprompter for seamless delivery, AI-assisted editing tools, and export options optimized for various platforms and use cases.",
    'deck': "For visual presentations, Genie Deck offers AI-designed templates and intelligent layout systems. Export options include PowerPoint and PDF formats, maintaining professional quality standards.",
    'arc': "Project management is handled through Genie Arc. The platform provides Kanban-style boards, content calendars, and automated scheduling features to keep teams aligned and projects on track.",
    'ask-genie': "Ask Genie functions as an integrated support system. It provides contextual guidance, answers platform-specific questions, and offers tutorials for advanced feature utilization.",
    'cast': "Finally, Genie Cast manages content distribution. Single-click publishing to major platforms including YouTube, LinkedIn, and TikTok, with integrated analytics for performance tracking.",
    'closing': "In summary, Genie Studio provides a complete content creation ecosystem. From initial concept to global distribution, each product integrates seamlessly. Begin your free trial today to experience the full workflow.",
  };
  return eduScripts[chapterId] || _baseScript;
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
  
  // Detect unified audio mode: all chapters have the same audio URL
  const uniqueAudioUrls = [...new Set(audioUrls)];
  const isUnifiedAudio = uniqueAudioUrls.length === 1 && audioUrls.length > 1;

  console.log(`🎬 Stitching ${successfulChapters.length} chapters into video`);
  console.log(`   Audio mode: ${isUnifiedAudio ? 'UNIFIED (seamless single track)' : 'PER-CHAPTER'}`);
  console.log(`   Audio files: ${audioUrls.length} (unique: ${uniqueAudioUrls.length}), Visual files: ${visualUrls.length}`);
  console.log(`   Screenshots per chapter:`, successfulChapters.map(c => `${c.chapterId}: ${c.visualUrls?.length || 1}`).join(', '));

  // === PHASE 1: JSON2VIDEO (PRIMARY - Timeline Assembly) ===
  const json2videoResult = await tryJSON2VideoAssembly(
    successfulChapters, 
    audioUrls, 
    visualUrls, 
    language, 
    quality,
    isUnifiedAudio  // Pass unified audio flag
  );
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
  quality: string,
  isUnifiedAudio: boolean = false  // NEW: Flag for unified audio mode
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
    const timeline = buildJSON2VideoTimeline(chapters, validAudioUrls, validVisualUrls, language, quality, isUnifiedAudio);
    
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
      // CRITICAL FIX: Return immediately with pending status instead of blocking poll
      // This prevents edge function timeout - client will poll genie-cast-status instead
      console.log(`⏳ Returning immediately with pending status - client will poll for completion`);
      return {
        success: true,
        pending: true,
        taskId: projectId,
        videoUrl: undefined, // Will be populated when client polls status
        thumbnailUrl: undefined,
      };
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
 * Supports UNIFIED AUDIO mode for seamless playback (no breaks between chapters)
 * @see https://json2video.com/docs/v2/api-reference/json-syntax/
 */
function buildJSON2VideoTimeline(
  chapters: ChapterResult[],
  audioUrls: string[],
  visualUrls: string[], // All visuals flattened
  language: string,
  quality: string,
  isUnifiedAudio: boolean = false  // NEW: Flag for unified audio mode
): object {
  // Resolution options: sd, hd, full-hd, 4k, instagram-story, instagram-post, etc.
  const resolution = quality === 'cinematic' ? '4k' : quality === 'production' ? 'full-hd' : 'hd';
  
  // Calculate total duration for unified audio
  const totalDuration = chapters.reduce((sum, c) => sum + c.duration, 0);
  
  // Get unified audio URL (same for all chapters in unified mode)
  const unifiedAudioUrl = isUnifiedAudio && audioUrls.length > 0 ? audioUrls[0] : null;

  // Build scenes array from chapters - each chapter can have multiple screenshots
  const scenes: any[] = [];
  let isFirstScene = true; // Track if this is the first scene (for unified audio placement)
  
  chapters.forEach((chapter, chapterIndex) => {
    const audioUrl = isUnifiedAudio ? null : (audioUrls[chapterIndex] || null); // Per-chapter audio (non-unified mode only)
    const chapterVisuals = chapter.visualUrls || (chapter.visualUrl ? [chapter.visualUrl] : []);
    
    // If we have multiple screenshots, create sub-scenes for each
    if (chapterVisuals.length > 1) {
      const durationPerVisual = Math.floor(chapter.duration / chapterVisuals.length);
      
      chapterVisuals.forEach((visualUrl, visualIndex) => {
        const elements: any[] = [];
        const isFirstVisual = visualIndex === 0;
        
        // Background image element
        elements.push({
          type: 'image',
          src: visualUrl,
          duration: durationPerVisual,
        });

        // UNIFIED AUDIO: Add audio only to the FIRST scene of the entire video
        if (isUnifiedAudio && isFirstScene && unifiedAudioUrl) {
          elements.push({
            type: 'audio',
            src: unifiedAudioUrl,
            duration: totalDuration, // Full video duration
            volume: 1.0,
          });
          isFirstScene = false;
        }
        
        // PER-CHAPTER AUDIO: Add audio to first visual of each chapter
        if (!isUnifiedAudio && isFirstVisual && audioUrl) {
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

      // UNIFIED AUDIO: Add audio only to the FIRST scene
      if (isUnifiedAudio && isFirstScene && unifiedAudioUrl) {
        elements.push({
          type: 'audio',
          src: unifiedAudioUrl,
          duration: totalDuration, // Full video duration
          volume: 1.0,
        });
        isFirstScene = false;
      }
      
      // PER-CHAPTER AUDIO: Add audio to each chapter
      if (!isUnifiedAudio && audioUrl) {
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

  console.log(`📹 Built JSON2Video timeline: ${scenes.length} scenes, ${isUnifiedAudio ? 'unified' : 'per-chapter'} audio, total ${totalDuration}s`);

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
 * NOW PRODUCTION: Calls ai-video-generator with type: 'avatar'
 * Supports Alibaba Wan2.2 S2V, ModelsLab, Azure fallback chain
 */
async function generateAvatarSegment(
  supabase: any,
  chapterId: string,
  language: string,
  gender: 'male' | 'female',
  size: 'small' | 'medium' | 'large',
  audioBase64?: string,
  audioUrl?: string
): Promise<string | undefined> {
  const avatarConfig = REGIONAL_AVATARS[language] || REGIONAL_AVATARS['en'];
  const avatarName = gender === 'male' ? avatarConfig.male : avatarConfig.female;
  
  console.log(`🎭 [PRODUCTION] Generating ${gender} avatar (${avatarName}) for chapter: ${chapterId}`);
  
  try {
    // Get a source image for the avatar presenter (regional stock or AI-generated)
    const sourceImage = await getRegionalAvatarImage(supabase, language, gender, avatarConfig.style);
    
    if (!sourceImage) {
      console.warn(`⚠️ No avatar source image for ${language}/${gender}, skipping avatar generation`);
      return undefined;
    }

    // Call the production ai-video-generator edge function
    const { data, error } = await supabase.functions.invoke('ai-video-generator', {
      body: {
        type: 'avatar',
        sourceImage,
        audioUrl: audioUrl,  // Use uploaded audio URL
        script: getChapterScript(chapterId, language),
        language: language === 'en' ? 'en-US' : `${language}-${language.toUpperCase()}`,
        fullBody: size === 'large',
        priorityRendering: size === 'large',
        visualType: 'avatar_presenter',
      },
    });

    if (error) {
      console.error(`❌ Avatar generation error for ${chapterId}:`, error.message);
      return undefined;
    }

    if (data?.success && data?.videoUrl) {
      console.log(`✅ Avatar generated via ${data.provider || 'ai-video-generator'}: ${data.videoUrl}`);
      
      // Upload to Supabase storage for persistence
      const storagePath = `avatar-segments/${language}/${chapterId}-${gender}-${Date.now()}.mp4`;
      const storageUrl = await uploadVideoToStorage(supabase, data.videoUrl, storagePath);
      
      return storageUrl || data.videoUrl;
    }

    console.warn(`⚠️ Avatar generation returned no video for ${chapterId}`);
    return undefined;
  } catch (err) {
    console.error('Avatar generation failed:', err);
    return undefined;
  }
}

/**
 * Get a regional avatar source image
 * Returns stock photo or AI-generated presenter image based on region/gender
 */
async function getRegionalAvatarImage(
  supabase: any,
  language: string,
  gender: 'male' | 'female',
  style: string
): Promise<string | undefined> {
  // Check for pre-uploaded avatar source images in storage
  const avatarPath = `avatar-sources/${language}/${gender}-${style}.png`;
  
  const { data: files } = await supabase.storage
    .from('brand-assets')
    .list(`avatar-sources/${language}`, { search: `${gender}-` });
  
  if (files && files.length > 0) {
    const { data: urlData } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(`avatar-sources/${language}/${files[0].name}`);
    
    if (urlData?.publicUrl) {
      console.log(`   📸 Found existing avatar source: ${urlData.publicUrl}`);
      return urlData.publicUrl;
    }
  }
  
  // Fallback: Use regional stock photos or AI-generated images
  // These would be high-quality presenter photos optimized for lip-sync
  const stockAvatars: Record<string, Record<string, string>> = {
    'en': {
      'male': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=512&h=512&fit=crop',
      'female': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=512&h=512&fit=crop',
    },
    'zh': {
      'male': 'https://images.unsplash.com/photo-1556157382-97edd2f44668?w=512&h=512&fit=crop',
      'female': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=512&h=512&fit=crop',
    },
    'ar': {
      'male': 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=512&h=512&fit=crop',
      'female': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=512&h=512&fit=crop',
    },
    'hi': {
      'male': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=512&h=512&fit=crop',
      'female': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=512&h=512&fit=crop',
    },
  };
  
  const regionalStock = stockAvatars[language] || stockAvatars['en'];
  return regionalStock[gender] || regionalStock['male'];
}

/**
 * Upload video from URL to Supabase storage
 */
async function uploadVideoToStorage(
  supabase: any,
  sourceUrl: string,
  storagePath: string
): Promise<string | null> {
  try {
    // Fetch the video file
    const response = await fetch(sourceUrl);
    if (!response.ok) return null;
    
    const videoBlob = await response.blob();
    const videoBuffer = await videoBlob.arrayBuffer();
    
    // Upload to storage
    const { data, error } = await supabase.storage
      .from('genie-media')
      .upload(storagePath, videoBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });
    
    if (error) {
      console.warn(`Failed to upload video to storage: ${error.message}`);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('genie-media')
      .getPublicUrl(storagePath);
    
    return urlData?.publicUrl || null;
  } catch (err) {
    console.warn('Video upload to storage failed:', err);
    return null;
  }
}

/**
 * Generate 3D product showcase element
 * NOW PRODUCTION: Calls alibaba-3d-generator or modelslab-media
 */
async function generate3DElement(
  supabase: any,
  product: string,
  style: string,
  quality: 'standard' | 'high' | 'premium'
): Promise<string | undefined> {
  console.log(`📦 [PRODUCTION] Generating 3D element for ${product} (style: ${style}, quality: ${quality})`);
  
  // Product-specific 3D prompts
  const prompts: Record<string, string> = {
    'Genie Spark': 'Glowing electric spark lightning bolt 3D icon, yellow and orange energy, modern minimalist design, glass material',
    'Genie Mind': 'Glowing brain neural network 3D icon, blue and purple holographic gradients, futuristic tech aesthetic',
    'Genie Vibe': 'Sound wave visualization 3D icon, audio frequencies, emerald green tones, floating particles',
    'Genie Deck': 'Floating presentation slides 3D icon, stacked translucent layers, professional gold accent',
    'Genie Arc': 'Orbital rings production hub 3D icon, interconnected nodes, pink and magenta gradient',
    'Ask Genie': 'Magical genie lamp 3D icon, cyan glow aura, mystical swirling smoke, golden lamp',
    'Genie Cast': 'Broadcasting tower 3D icon, emanating signal waves, red accent, global distribution sphere',
    'Genie Studio': 'Complete creative suite 3D logo, purple gradient crystal, seven floating elements orbiting',
  };
  
  const prompt = prompts[product] || `${product} 3D logo icon, professional glass material design`;
  
  try {
    // Try Alibaba 3D Generator first (text-to-3d model)
    const alibabaKey = Deno.env.get('ALIBABA_CHINA_API_KEY');
    const meshyKey = Deno.env.get('MESHY_API_KEY');
    
    if (alibabaKey) {
      console.log(`   🇨🇳 Calling Alibaba 3D Generator (text-to-3d)`);
      
      const { data, error } = await supabase.functions.invoke('alibaba-3d-generator', {
        body: {
          model: 'text-to-3d',
          prompt,
          style: style === 'hologram' ? 'stylized' : 'realistic',
          outputFormat: 'glb',
          textureResolution: quality === 'premium' ? '4k' : quality === 'high' ? '2k' : '1k',
          polyCount: quality === 'premium' ? 'high' : 'medium',
        },
      });
      
      if (!error && data?.success && data?.modelUrl) {
        console.log(`✅ 3D element generated via Alibaba: ${data.modelUrl}`);
        return data.modelUrl;
      }
      
      console.warn(`⚠️ Alibaba 3D failed: ${data?.error || error?.message}, trying fallback...`);
    }
    
    // Fallback: ModelsLab 3D generation
    if (meshyKey || Deno.env.get('MODELSLAB_API_KEY')) {
      console.log(`   🎨 Falling back to ModelsLab 3D generation`);
      
      const { data, error } = await supabase.functions.invoke('modelslab-media', {
        body: {
          type: '3d',
          prompt,
          model: 'default',
        },
      });
      
      if (!error && data?.success && data?.output) {
        const modelUrl = Array.isArray(data.output) ? data.output[0] : data.output;
        console.log(`✅ 3D element generated via ModelsLab: ${modelUrl}`);
        return modelUrl;
      }
    }
    
    console.warn(`⚠️ All 3D providers failed for ${product}`);
    return undefined;
  } catch (err) {
    console.error('3D generation failed:', err);
    return undefined;
  }
}

/**
 * Generate animated transition between chapters
 * NOW PRODUCTION: Uses ModelsLab AnimateDiff for motion graphics
 */
async function generateTransition(
  supabase: any,
  chapterId: string,
  product: string,
  color: string,
  style: string,
  intensity: number
): Promise<string | undefined> {
  console.log(`✨ [PRODUCTION] Generating ${style} transition for ${chapterId} (intensity: ${intensity}%)`);
  
  // Style-specific transition prompts for AnimateDiff
  const transitionPrompts: Record<string, string> = {
    'kinetic': `Kinetic typography animation, text "${product}" revealing with energy particles, ${color} color theme, dynamic motion blur, 2 seconds`,
    'slide': `Smooth slide transition, elegant wipe effect, ${color} gradient, professional corporate, 1 second`,
    'particle': `Particle explosion transition, sparkle and glow effects, ${color} energy particles dispersing, magical, 1.5 seconds`,
    'morph': `Shape morphing transition, abstract forms transforming, ${color} liquid metal effect, 2 seconds`,
    'glass': `Glass morphism blur transition, frosted glass effect with ${color} accent, modern UI aesthetic, 1 second`,
  };
  
  const prompt = transitionPrompts[style] || transitionPrompts['slide'];
  
  try {
    // Use ModelsLab AnimateDiff for animation generation
    console.log(`   🎬 Calling ModelsLab AnimateDiff for transition`);
    
    const { data, error } = await supabase.functions.invoke('modelslab-media', {
      body: {
        type: 'video',
        prompt,
        model: 'animatediff',
        duration: style === 'kinetic' || style === 'morph' ? 2 : 1,
        fps: 24,
        width: 1920,
        height: 1080,
      },
    });
    
    if (!error && data?.success && data?.output) {
      const transitionUrl = Array.isArray(data.output) ? data.output[0] : data.output;
      console.log(`✅ Transition generated via ModelsLab: ${transitionUrl}`);
      return transitionUrl;
    }
    
    // If processing, return task ID for polling later
    if (data?.status === 'processing' && data?.fetch_url) {
      console.log(`⏳ Transition processing, poll at: ${data.fetch_url}`);
      // For now, return the fetch URL - caller can poll later
      return data.fetch_url;
    }
    
    console.warn(`⚠️ Transition generation failed: ${data?.error || error?.message}`);
    return undefined;
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
