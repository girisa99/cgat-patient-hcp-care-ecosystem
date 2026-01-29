/**
 * useStudioEcosystem Hook
 * 
 * Connects Composition Studio to ALL existing ecosystem services:
 * - multiLanguageAudioOrchestrator (Voice, Music, SFX with 6-zone routing)
 * - translationService (Transcreation for additional languages)
 * - unifiedVideoService (Video generation with provider fallback)
 * - audioGenerationConfigService (Regional TTS provider selection)
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
    script?: string;
    transcreatedScripts?: Record<string, string>;
    transcreatedAudio?: Record<string, string>;
  };
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
  step: 'script' | 'transcreation' | 'voice' | 'music' | 'video' | 'complete';
  progress: number;
  message: string;
}

export function useStudioEcosystem() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);

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
  // 5. EDITOR HANDOFF
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
   */
  const sendToProductionHub = useCallback((project: StudioProject) => {
    console.log('[StudioEcosystem] Sending to Production Hub');
    
    sessionStorage.setItem('studio_handoff', JSON.stringify({
      type: 'production_hub',
      project,
      timestamp: Date.now(),
    }));
    
    navigate('/genie-admin?tab=review-queue&from=studio');
    toast.success('Sent to Review Queue');
  }, [navigate]);

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

  return {
    // Status
    isProcessing,
    progress,
    
    // Audio
    generateVoiceover,
    generateMusic,
    
    // Multi-language
    transcreateContent,
    generateMultiLanguageAudio,
    
    // Video
    generateVideo,
    combineChapterVideos,
    
    // Editor handoff
    sendToScriptEditor,
    sendToVideoEditor,
    sendToProductionHub,
    
    // Full pipeline
    generateChapterFull,
    generateProject,
  };
}

export default useStudioEcosystem;
