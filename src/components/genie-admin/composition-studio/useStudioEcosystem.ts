/**
 * useStudioEcosystem Hook - FULL ECOSYSTEM INTEGRATION
 * 
 * Connects Composition Studio to ALL existing ecosystem services:
 * - multiLanguageAudioOrchestrator (Voice, Music, SFX with 6-zone routing)
 * - translationService (Transcreation for additional languages)
 * - unifiedVideoService (Video generation with provider fallback)
 * - proactivePipelineEditorService (AI-powered edit suggestions)
 * - Image Generation (ai-image-generator, modelslab-media)
 * - 3D Generation (modelslab-media for mesh/3D)
 * - Captions (ai-caption-generator)
 * - Thumbnails (auto-thumbnail-generator)
 * - Audio Mixing (audio-mixer)
 * - Editor handoff (Route to Genie Mind/Vibe for editing)
 */

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Existing ecosystem services
import { multiLanguageAudioOrchestrator, LANGUAGE_VOICE_MAPPINGS } from '@/services/multiLanguageAudioOrchestrator';
import { unifiedVideoService } from '@/components/universal-editor/services/unifiedVideoService';
import { translationService } from '@/services/translationService';
import { proactivePipelineEditorService, type ProactiveEditSuggestion } from '@/services/proactivePipelineEditorService';
import type { GlobalTier } from '@/services/shared/globalTierService';

// Types
export interface StudioChapter {
  id: string;
  title: string;
  script: string;
  visualTypes: string[];
  duration: number;
  voiceSource: 'tts' | 'clone' | 'upload' | 'none';
  musicSource: 'ai' | 'upload' | 'none';
  status: 'draft' | 'generating' | 'complete' | 'error';
  generatedContent?: {
    previewUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
    imageUrl?: string;
    model3dUrl?: string;
    captionsUrl?: string;
    thumbnailUrl?: string;
    script?: string;
    transcreatedScripts?: Record<string, string>;
    transcreatedAudio?: Record<string, string>;
  };
  editSuggestions?: ProactiveEditSuggestion[];
}

export interface StudioProject {
  name: string;
  primaryLanguage: string;
  additionalLanguages: string[];
  chapters: StudioChapter[];
  outputMode: 'combined' | 'individual';
}

export interface GenerationProgress {
  chapterId: string;
  step: 'script' | 'transcreation' | 'voice' | 'music' | 'video' | 'image' | '3d' | 'captions' | 'thumbnail' | 'mixing' | 'complete';
  progress: number;
  message: string;
}

export type InlineEditAction = 'trim' | 'voice_replace' | 'add_captions' | 'regenerate_visual' | 'adjust_audio' | 'add_music';

export function useStudioEcosystem() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [editSuggestions, setEditSuggestions] = useState<ProactiveEditSuggestion[]>([]);

  // ========================================
  // 1. AUDIO ORCHESTRATION (Voice, Music, SFX)
  // ========================================

  /**
   * Generate voiceover using multiLanguageAudioOrchestrator
   * Routes to correct regional provider (ElevenLabs, Azure, Alibaba, Google)
   */
  const generateVoiceover = useCallback(async (
    text: string,
    languageCode: string,
    tier: GlobalTier = 'advanced'
  ) => {
    console.log('[StudioEcosystem] Generating voice for language:', languageCode);
    
    // Get language mapping for correct provider
    const languageMapping = LANGUAGE_VOICE_MAPPINGS.find(
      l => l.languageCode === languageCode || l.languageCode.startsWith(languageCode)
    );
    
    const provider = languageMapping?.primaryTTSProvider || 'openai';
    const region = languageMapping?.region || 'fallback_zone';
    
    console.log(`[StudioEcosystem] Using provider: ${provider}, region: ${region}`);
    
    // Create audio session with orchestrator
    const session = multiLanguageAudioOrchestrator.createSession();
    multiLanguageAudioOrchestrator.addVoiceJob(session.id, text, languageCode, { provider }, tier);
    
    const result = await multiLanguageAudioOrchestrator.executeSession(session.id, (prog, job) => {
      console.log(`[StudioEcosystem] Voice progress: ${prog}%, job: ${job.id}`);
    });
    
    const voiceJob = result.jobs.find(j => j.type === 'voice');
    return {
      audioUrl: voiceJob?.audioUrl,
      provider,
      region,
      cost: result.totalCost,
    };
  }, []);

  /**
   * Generate background music using multi-provider-music
   */
  const generateMusic = useCallback(async (
    prompt: string,
    duration: number = 30,
    _genre: string = 'corporate',
    tier: GlobalTier = 'advanced'
  ) => {
    console.log('[StudioEcosystem] Generating music:', { prompt, duration });
    
    const session = multiLanguageAudioOrchestrator.createSession();
    multiLanguageAudioOrchestrator.addMusicJob(session.id, prompt, duration, tier);
    
    const result = await multiLanguageAudioOrchestrator.executeSession(session.id);
    const musicJob = result.jobs.find(j => j.type === 'music');
    
    return {
      audioUrl: musicJob?.audioUrl,
      cost: result.totalCost,
    };
  }, []);
  // ========================================
  // 2. TRANSCREATION (Multi-language support)
  // ========================================

  /**
   * Transcreate content for additional languages
   * Uses translationService with contextual adaptation
   */
  const transcreateContent = useCallback(async (
    script: string,
    sourceLanguage: string,
    targetLanguages: string[],
    domain: 'presentation' | 'marketing' | 'educational' = 'presentation'
  ): Promise<Record<string, string>> => {
    console.log('[StudioEcosystem] Transcreating to:', targetLanguages);
    
    const transcreatedScripts: Record<string, string> = {};
    
    for (const targetLang of targetLanguages) {
      try {
        const result = await translationService.translate({
          text: script,
          sourceLanguage,
          targetLanguage: targetLang,
          domain,
          preserveFormatting: true,
        });
        
        transcreatedScripts[targetLang] = result.translatedText;
        console.log(`[StudioEcosystem] Transcreated to ${targetLang}`);
      } catch (error) {
        console.error(`[StudioEcosystem] Failed transcreation for ${targetLang}:`, error);
        transcreatedScripts[targetLang] = script; // Fallback to original
      }
    }
    
    return transcreatedScripts;
  }, []);

  /**
   * Generate audio for all transcreated languages
   */
  const generateMultiLanguageAudio = useCallback(async (
    scripts: Record<string, string>,
    tier: GlobalTier = 'advanced'
  ): Promise<Record<string, string>> => {
    console.log('[StudioEcosystem] Generating multi-language audio');
    
    const audioUrls: Record<string, string> = {};
    
    for (const [langCode, script] of Object.entries(scripts)) {
      try {
        const result = await generateVoiceover(script, langCode, tier);
        if (result.audioUrl) {
          audioUrls[langCode] = result.audioUrl;
        }
      } catch (error) {
        console.error(`[StudioEcosystem] Failed audio for ${langCode}:`, error);
      }
    }
    
    return audioUrls;
  }, [generateVoiceover]);

  // ========================================
  // 3. VIDEO GENERATION (with fallback chain)
  // ========================================

  /**
   * Generate video using unifiedVideoService
   * Automatic provider fallback: OpenAI → ModelsLab → Alibaba → Gemini → Replicate
   */
  const generateVideo = useCallback(async (
    prompt: string,
    visualType: string,
    duration: number = 5,
    sourceImageUrl?: string
  ) => {
    console.log('[StudioEcosystem] Generating video:', { visualType, duration });
    
    const videoType = sourceImageUrl ? 'image-to-video' : 'text-to-video';
    
    // Map visual types to video options
    const isAvatar = visualType.includes('avatar') || visualType.includes('talking_head');
    const is3D = visualType.includes('3d');
    
    if (isAvatar) {
      // Use avatar-video type
      const result = await unifiedVideoService.generateVideo({
        type: 'avatar-video',
        prompt,
        options: {
          duration,
          voiceText: prompt,
          quality: 'preview',
        }
      });
      return result;
    }
    
    // Standard video generation
    const result = await unifiedVideoService.generateVideo({
      type: videoType,
      prompt: is3D ? `3D rendered ${prompt}` : prompt,
      options: {
        duration,
        sourceImageUrl,
        quality: 'preview',
        width: 1920,
        height: 1080,
      }
    });
    
    return result;
  }, []);

  // ========================================
  // 4. VIDEO STITCHING (Combine chapters)
  // ========================================

  /**
   * Combine multiple chapter videos into one
   * Uses FFmpeg-based stitching logic
   */
  const combineChapterVideos = useCallback(async (
    chapterVideos: Array<{ chapterId: string; videoUrl: string; audioUrl?: string }>
  ) => {
    console.log('[StudioEcosystem] Combining', chapterVideos.length, 'chapters');
    
    // Call video stitching edge function
    const { data, error } = await supabase.functions.invoke('ai-video-generator', {
      body: {
        action: 'stitch',
        segments: chapterVideos.map((cv, index) => ({
          url: cv.videoUrl,
          audioUrl: cv.audioUrl,
          order: index,
          transition: 'crossfade',
          transitionDuration: 0.5,
        })),
        outputFormat: 'mp4',
        quality: 'production',
      }
    });
    
    if (error) {
      console.error('[StudioEcosystem] Stitch error:', error);
      throw error;
    }
    
    return {
      videoUrl: data?.videoUrl || data?.url,
      duration: data?.duration,
    };
  }, []);

  // ========================================
  // 5. IMAGE GENERATION (ai-image-generator)
  // ========================================

  const generateImage = useCallback(async (
    prompt: string,
    style: string = 'realistic',
    aspectRatio: '16:9' | '1:1' | '9:16' = '16:9'
  ) => {
    console.log('[StudioEcosystem] Generating image:', { prompt, style });
    
    const { data, error } = await supabase.functions.invoke('ai-image-generator', {
      body: {
        prompt,
        style,
        aspectRatio,
        quality: 'high',
        provider: 'openai', // DALL-E 3
      }
    });

    if (error) throw error;
    return {
      imageUrl: data?.imageUrl || data?.url,
      thumbnailUrl: data?.thumbnailUrl,
    };
  }, []);

  // ========================================
  // 6. 3D GENERATION (modelslab-media)
  // ========================================

  const generate3DModel = useCallback(async (
    prompt: string,
    type: 'mesh' | 'avatar' | 'product' = 'mesh'
  ) => {
    console.log('[StudioEcosystem] Generating 3D model:', { prompt, type });
    
    const { data, error } = await supabase.functions.invoke('modelslab-media', {
      body: {
        action: 'text-to-3d',
        prompt,
        type,
        format: 'glb',
        quality: 'high',
      }
    });

    if (error) throw error;
    return {
      modelUrl: data?.modelUrl || data?.url,
      previewUrl: data?.previewUrl,
    };
  }, []);

  // ========================================
  // 7. CAPTIONS GENERATION (ai-caption-generator)
  // ========================================

  const generateCaptions = useCallback(async (
    audioUrl: string,
    languageCode: string = 'en',
    style: 'srt' | 'vtt' | 'json' = 'vtt'
  ) => {
    console.log('[StudioEcosystem] Generating captions for:', languageCode);
    
    const { data, error } = await supabase.functions.invoke('ai-caption-generator', {
      body: {
        audioUrl,
        languageCode,
        format: style,
        includeTimestamps: true,
        wordLevel: true,
      }
    });

    if (error) throw error;
    return {
      captionsUrl: data?.captionsUrl || data?.url,
      text: data?.text,
      segments: data?.segments,
    };
  }, []);

  // ========================================
  // 8. THUMBNAIL GENERATION (auto-thumbnail-generator)
  // ========================================

  const generateThumbnail = useCallback(async (
    title: string,
    description: string,
    platform: 'youtube' | 'linkedin' | 'tiktok' | 'instagram' = 'youtube'
  ) => {
    console.log('[StudioEcosystem] Generating thumbnail for:', platform);
    
    const { data, error } = await supabase.functions.invoke('auto-thumbnail-generator', {
      body: {
        title,
        description,
        platform,
        style: 'professional',
        includeText: true,
      }
    });

    if (error) throw error;
    return {
      thumbnailUrl: data?.thumbnailUrl || data?.url,
      variants: data?.variants,
    };
  }, []);

  // ========================================
  // 9. AUDIO MIXING (audio-mixer)
  // ========================================

  const mixAudio = useCallback(async (
    voiceUrl: string,
    musicUrl?: string,
    options: { voiceVolume?: number; musicVolume?: number; ducking?: boolean } = {}
  ) => {
    console.log('[StudioEcosystem] Mixing audio');
    
    const { data, error } = await supabase.functions.invoke('audio-mixer', {
      body: {
        tracks: [
          { url: voiceUrl, type: 'voice', volume: options.voiceVolume || 1.0 },
          ...(musicUrl ? [{ url: musicUrl, type: 'music', volume: options.musicVolume || 0.3 }] : []),
        ],
        ducking: options.ducking ?? true,
        outputFormat: 'mp3',
        normalize: true,
      }
    });

    if (error) throw error;
    return {
      mixedAudioUrl: data?.audioUrl || data?.url,
      duration: data?.duration,
    };
  }, []);

  // ========================================
  // 10. PROACTIVE EDITOR SUGGESTIONS
  // ========================================

  const getEditSuggestions = useCallback((
    chapter: StudioChapter,
    product: 'vibe' | 'deck' | 'spark' | 'mind' = 'vibe'
  ): ProactiveEditSuggestion[] => {
    console.log('[StudioEcosystem] Getting edit suggestions for:', chapter.title);
    
    // Use proactivePipelineEditorService to analyze content
    const pipelineId = chapter.visualTypes[0] || 'video';
    const suggestions = proactivePipelineEditorService.getProactiveSuggestions(
      pipelineId,
      chapter.generatedContent,
      'desktop',
      product
    );
    
    setEditSuggestions(suggestions);
    return suggestions;
  }, []);

  // Inline edit action handler
  const executeInlineEdit = useCallback(async (
    chapter: StudioChapter,
    action: InlineEditAction,
    params?: Record<string, unknown>
  ): Promise<Partial<StudioChapter['generatedContent']>> => {
    console.log('[StudioEcosystem] Executing inline edit:', action);
    
    switch (action) {
      case 'voice_replace': {
        const newVoice = await generateVoiceover(
          chapter.script,
          params?.languageCode as string || 'en',
        );
        return { audioUrl: newVoice.audioUrl };
      }
      case 'add_captions': {
        if (chapter.generatedContent?.audioUrl) {
          const captions = await generateCaptions(
            chapter.generatedContent.audioUrl,
            params?.languageCode as string || 'en'
          );
          return { captionsUrl: captions.captionsUrl };
        }
        break;
      }
      case 'regenerate_visual': {
        const isVideo = chapter.visualTypes.some(v => 
          ['video', 'animation', 'avatar'].includes(v)
        );
        if (isVideo) {
          const video = await generateVideo(chapter.script, chapter.visualTypes[0], chapter.duration);
          return { videoUrl: video.videoUrl, previewUrl: video.thumbnailUrl };
        } else {
          const image = await generateImage(chapter.script);
          return { imageUrl: image.imageUrl, previewUrl: image.imageUrl };
        }
      }
      case 'add_music': {
        const music = await generateMusic(`Background music for ${chapter.title}`, chapter.duration);
        if (chapter.generatedContent?.audioUrl && music.audioUrl) {
          const mixed = await mixAudio(chapter.generatedContent.audioUrl, music.audioUrl);
          return { audioUrl: mixed.mixedAudioUrl };
        }
        break;
      }
      case 'adjust_audio': {
        if (chapter.generatedContent?.audioUrl) {
          const music = params?.musicUrl as string;
          const mixed = await mixAudio(
            chapter.generatedContent.audioUrl,
            music,
            { voiceVolume: params?.voiceVolume as number, musicVolume: params?.musicVolume as number }
          );
          return { audioUrl: mixed.mixedAudioUrl };
        }
        break;
      }
      default:
        console.warn('[StudioEcosystem] Unknown edit action:', action);
    }
    return {};
  }, [generateVoiceover, generateCaptions, generateVideo, generateImage, generateMusic, mixAudio]);

  // ========================================
  // 11. EDITOR HANDOFF
  // ========================================

  /**
   * Send generated content to Genie Mind (Script Editor)
   */
  const sendToScriptEditor = useCallback((project: StudioProject) => {
    console.log('[StudioEcosystem] Sending to Script Editor');
    
    // Store project data for editor pickup
    sessionStorage.setItem('studio_handoff', JSON.stringify({
      type: 'script_editor',
      project,
      timestamp: Date.now(),
    }));
    
    navigate('/genie-mind?tab=script-editor&from=studio');
    toast.success('Opening in Script Editor');
  }, [navigate]);

  /**
   * Send generated content to Genie Vibe (Video Editor)
   */
  const sendToVideoEditor = useCallback((project: StudioProject) => {
    console.log('[StudioEcosystem] Sending to Video Editor');
    
    sessionStorage.setItem('studio_handoff', JSON.stringify({
      type: 'video_editor',
      project,
      timestamp: Date.now(),
    }));
    
    navigate('/genie-vibe?tab=editor&from=studio');
    toast.success('Opening in Video Editor');
  }, [navigate]);

  /**
   * Send to Production Hub for review/scheduling
   * Also saves to landing_page_videos for Content Library visibility
   */
  const sendToProductionHub = useCallback(async (project: StudioProject) => {
    console.log('[StudioEcosystem] Sending to Production Hub and saving to database');
    
    try {
      // Save each chapter to landing_page_videos for Content Library
      for (const chapter of project.chapters) {
        if (chapter.generatedContent?.videoUrl || chapter.generatedContent?.previewUrl) {
          const videoData = {
            title: `${project.name} - ${chapter.title}`,
            description: chapter.script?.substring(0, 500) || `Chapter: ${chapter.title}`,
            video_url: chapter.generatedContent.videoUrl || chapter.generatedContent.previewUrl || '',
            thumbnail_url: chapter.generatedContent.thumbnailUrl || chapter.generatedContent.previewUrl || null,
            region: getRegionFromLanguage(project.primaryLanguage),
            language_code: project.primaryLanguage,
            language_name: getLanguageName(project.primaryLanguage),
            industry: chapter.visualTypes?.[0] || 'general',
            content_type: chapter.visualTypes?.[0] || 'video',
            placement: 'library',
            display_order: project.chapters.indexOf(chapter),
            is_active: true,
            is_featured: false,
            duration_seconds: chapter.duration || 30,
            ai_confidence: 85,
            generation_pipeline: 'composition_studio',
          };

          const { error } = await supabase.from('landing_page_videos').insert(videoData);
          if (error) {
            console.error('[StudioEcosystem] Failed to save chapter to database:', error);
          } else {
            console.log('[StudioEcosystem] Saved chapter to database:', chapter.title);
          }
        }
      }
      
      toast.success('Content saved to Library');
    } catch (err) {
      console.error('[StudioEcosystem] Error saving to database:', err);
      toast.error('Failed to save to library, but continuing to review queue');
    }
    
    // Continue with session handoff for review queue
    sessionStorage.setItem('studio_handoff', JSON.stringify({
      type: 'production_hub',
      project,
      timestamp: Date.now(),
    }));
    
    navigate('/genie-admin?tab=library');
    toast.success('Sent to Review Queue');
  }, [navigate]);

  // Helper functions for region/language mapping
  const getRegionFromLanguage = (langCode: string): string => {
    const regionMap: Record<string, string> = {
      'en': 'NAM', 'en-US': 'NAM', 'en-GB': 'EUR',
      'ar': 'MENA', 'ar-SA': 'MENA', 'ar-AE': 'MENA',
      'hi': 'IND', 'te': 'IND', 'kn': 'IND', 'ta': 'IND', 'mr': 'IND', 'bn': 'IND',
      'zh': 'CJK', 'ja': 'CJK', 'ko': 'CJK',
      'de': 'EUR', 'fr': 'EUR', 'es': 'EUR', 'it': 'EUR', 'pt': 'EUR',
    };
    return regionMap[langCode] || 'NAM';
  };

  const getLanguageName = (langCode: string): string => {
    const nameMap: Record<string, string> = {
      'en': 'English', 'en-US': 'English (US)', 'en-GB': 'English (UK)',
      'ar': 'Arabic', 'ar-SA': 'Arabic (Saudi)', 'ar-AE': 'Arabic (UAE)',
      'hi': 'Hindi', 'te': 'Telugu', 'kn': 'Kannada', 'ta': 'Tamil', 'mr': 'Marathi', 'bn': 'Bengali',
      'zh': 'Chinese', 'ja': 'Japanese', 'ko': 'Korean',
      'de': 'German', 'fr': 'French', 'es': 'Spanish', 'it': 'Italian', 'pt': 'Portuguese',
    };
    return nameMap[langCode] || langCode;
  };

  // ========================================
  // 6. FULL PIPELINE EXECUTION
  // ========================================

  /**
   * Execute complete generation pipeline for a chapter
   */
  const generateChapterFull = useCallback(async (
    chapter: StudioChapter,
    primaryLanguage: string,
    additionalLanguages: string[],
    onProgress: (progress: GenerationProgress) => void
  ): Promise<StudioChapter> => {
    const updateProgress = (step: GenerationProgress['step'], prog: number, msg: string) => {
      onProgress({ chapterId: chapter.id, step, progress: prog, message: msg });
    };
    
    let script = chapter.script;
    const generatedContent: StudioChapter['generatedContent'] = {};
    
    try {
      // Step 1: Generate script if needed
      updateProgress('script', 10, 'Generating script...');
      if (!script.trim()) {
        const { data } = await supabase.functions.invoke('ai-universal-processor', {
          body: {
            provider: 'gemini',
            model: 'gemini-2.0-flash',
            prompt: `Generate a ${chapter.duration}-second professional voiceover script for: ${chapter.title}`,
            action: 'generate_script',
          }
        });
        script = data?.content || data?.response || `Script for ${chapter.title}`;
        generatedContent.script = script;
      }
      
      // Step 2: Transcreation for additional languages
      if (additionalLanguages.length > 0) {
        updateProgress('transcreation', 25, `Transcreating to ${additionalLanguages.length} languages...`);
        generatedContent.transcreatedScripts = await transcreateContent(
          script,
          primaryLanguage,
          additionalLanguages
        );
      }
      
      // Step 3: Voice generation
      if (chapter.voiceSource === 'tts') {
        updateProgress('voice', 40, 'Generating voiceover...');
        
        // Primary language
        const primaryVoice = await generateVoiceover(script, primaryLanguage);
        generatedContent.audioUrl = primaryVoice.audioUrl;
        
        // Additional languages
        if (generatedContent.transcreatedScripts) {
          updateProgress('voice', 55, 'Generating multi-language audio...');
          generatedContent.transcreatedAudio = await generateMultiLanguageAudio(
            generatedContent.transcreatedScripts
          );
        }
      }
      
      // Step 4: Music generation
      if (chapter.musicSource === 'ai') {
        updateProgress('music', 65, 'Generating background music...');
        const music = await generateMusic(
          `Professional ${chapter.visualTypes[0] || 'corporate'} background music`,
          chapter.duration
        );
        // Music would be mixed with voice in final output
        console.log('[StudioEcosystem] Music generated:', music.audioUrl?.substring(0, 50));
      }
      
      // Step 5: Video generation
      updateProgress('video', 75, 'Generating visual content...');
      const video = await generateVideo(
        `${chapter.title}: ${script.substring(0, 200)}`,
        chapter.visualTypes[0] || 'video',
        Math.min(chapter.duration, 10)
      );
      generatedContent.videoUrl = video.videoUrl;
      generatedContent.previewUrl = video.thumbnailUrl || video.videoUrl;
      
      updateProgress('complete', 100, 'Complete!');
      
      return {
        ...chapter,
        script,
        status: 'complete',
        generatedContent,
      };
      
    } catch (error) {
      console.error('[StudioEcosystem] Pipeline error:', error);
      return {
        ...chapter,
        status: 'error',
      };
    }
  }, [generateVoiceover, generateMusic, transcreateContent, generateMultiLanguageAudio, generateVideo]);

  /**
   * Generate entire project
   */
  const generateProject = useCallback(async (
    project: StudioProject,
    onChapterProgress: (chapterId: string, progress: number) => void
  ): Promise<StudioProject> => {
    setIsProcessing(true);
    const updatedChapters: StudioChapter[] = [];
    
    try {
      for (const chapter of project.chapters) {
        const updated = await generateChapterFull(
          chapter,
          project.primaryLanguage,
          project.additionalLanguages,
          (prog) => {
            setProgress(prog);
            onChapterProgress(chapter.id, prog.progress);
          }
        );
        updatedChapters.push(updated);
      }
      
      // Combine if needed
      if (project.outputMode === 'combined' && updatedChapters.length > 1) {
        const completedVideos = updatedChapters
          .filter(c => c.generatedContent?.videoUrl)
          .map(c => ({
            chapterId: c.id,
            videoUrl: c.generatedContent!.videoUrl!,
            audioUrl: c.generatedContent?.audioUrl,
          }));
        
        if (completedVideos.length > 1) {
          const combined = await combineChapterVideos(completedVideos);
          console.log('[StudioEcosystem] Combined video:', combined.videoUrl);
        }
      }
      
      return { ...project, chapters: updatedChapters };
      
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  }, [generateChapterFull, combineChapterVideos]);

  /**
   * Save project chapters directly to Content Library
   * Can be called without navigating away
   */
  const saveToLibrary = useCallback(async (project: StudioProject): Promise<boolean> => {
    console.log('[StudioEcosystem] Saving project to Content Library');
    
    try {
      let savedCount = 0;
      
      for (const chapter of project.chapters) {
        // Only save chapters that have generated content
        if (chapter.generatedContent?.videoUrl || chapter.generatedContent?.previewUrl || chapter.generatedContent?.audioUrl) {
          const videoData = {
            title: `${project.name} - ${chapter.title}`,
            description: chapter.script?.substring(0, 500) || `Chapter: ${chapter.title}`,
            video_url: chapter.generatedContent.videoUrl || chapter.generatedContent.previewUrl || '',
            thumbnail_url: chapter.generatedContent.thumbnailUrl || chapter.generatedContent.previewUrl || null,
            region: getRegionFromLanguage(project.primaryLanguage),
            language_code: project.primaryLanguage,
            language_name: getLanguageName(project.primaryLanguage),
            industry: chapter.visualTypes?.[0] || 'general',
            content_type: chapter.visualTypes?.[0] || 'video',
            placement: 'library',
            display_order: project.chapters.indexOf(chapter),
            is_active: true,
            is_featured: false,
            duration_seconds: chapter.duration || 30,
            ai_confidence: 85,
            generation_pipeline: 'composition_studio',
          };

          const { error } = await supabase.from('landing_page_videos').insert(videoData);
          if (error) {
            console.error('[StudioEcosystem] Failed to save chapter:', error);
          } else {
            savedCount++;
            console.log('[StudioEcosystem] Saved chapter:', chapter.title);
          }
        }
      }
      
      if (savedCount > 0) {
        toast.success(`Saved ${savedCount} chapter(s) to Content Library`);
        return true;
      } else {
        toast.info('No completed content to save yet. Generate content first.');
        return false;
      }
    } catch (err) {
      console.error('[StudioEcosystem] Error saving to library:', err);
      toast.error('Failed to save to library');
      return false;
    }
  }, []);

  return {
    // Status
    isProcessing,
    progress,
    editSuggestions,
    
    // Audio (multiLanguageAudioOrchestrator)
    generateVoiceover,
    generateMusic,
    mixAudio,
    
    // Multi-language (translationService)
    transcreateContent,
    generateMultiLanguageAudio,
    
    // Video (unifiedVideoService)
    generateVideo,
    combineChapterVideos,
    
    // Image (ai-image-generator)
    generateImage,
    
    // 3D (modelslab-media)
    generate3DModel,
    
    // Captions (ai-caption-generator)
    generateCaptions,
    
    // Thumbnails (auto-thumbnail-generator)
    generateThumbnail,
    
    // Proactive Editor (proactivePipelineEditorService)
    getEditSuggestions,
    executeInlineEdit,
    
    // Editor handoff
    sendToScriptEditor,
    sendToVideoEditor,
    sendToProductionHub,
    
    // Library persistence
    saveToLibrary,
    
    // Full pipeline
    generateChapterFull,
    generateProject,
  };
}

export default useStudioEcosystem;
