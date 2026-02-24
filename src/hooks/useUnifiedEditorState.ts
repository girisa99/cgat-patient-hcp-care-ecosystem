/**
 * useUnifiedEditorState — Shared Editor State for Mind ↔ Cast
 *
 * Both Mind and Cast support the SAME editing capabilities:
 *   - Single-document mode: one script/chapter (quick-take, single narration)
 *   - Multi-scene mode: scene-by-scene or chapter-based editing
 *   - TTS generation with multi-provider routing
 *   - Audio and video production
 *   - AI analysis, enhancement, and transcreation
 *
 * Mode is DATA-DRIVEN, not product-locked:
 *   - If a templateMapping with scenes is provided → multi-scene
 *   - Otherwise → single-document
 *   - Can be overridden via the `mode` option
 *
 * Examples:
 *   - Mind single: quick video script or audio voiceover
 *   - Mind multi-scene: podcast with segments, webcast chapters
 *   - Cast single: quick single-take video (no template)
 *   - Cast multi-scene: template-based production with multiple scenes
 *
 * In single-document mode, the content lives in one SceneDocument
 * with id '__mind_root__'. In multi-scene mode, each template scene
 * maps to a SceneDocument entry.
 *
 * This hook provides a unified layer that both products use for their
 * script editing panels, enabling shared UI (UnifiedScriptPanel, etc.).
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import type { SceneScript, TemplateMapping, AuthoringStage } from '@/hooks/useUnifiedAuthoring';
import type { ScriptStats, EnhancementChange, AnalysisResult, AIProvider, EnhancementFocus } from '@/components/genie-studio/script-editor/types';

// ─── Types ──────────────────────────────────────────────────────────────────

export type EditorMode = 'single' | 'multi-scene';

export type DocumentStatus = 'draft' | 'enhanced' | 'approved' | 'locked';

export interface SceneDocument {
  /** Unique identifier. Mind uses '__mind_root__'; Cast uses scene IDs */
  id: string;
  /** Display title for the scene */
  title: string;
  /** Order within the document (0 for Mind) */
  orderIndex: number;
  /** Current script text */
  content: string;
  /** Original text before any enhancement */
  originalContent: string | null;
  /** AI-enhanced version */
  enhancedContent: string | null;
  /** TTS-ready clean version (no pauses/markers) */
  cleanContent: string | null;
  /** Which version is currently displayed */
  activeVersion: 'original' | 'enhanced' | 'custom';
  /** Edit version counter — incremented on every change */
  version: number;
  /** Enhancement changes for review */
  enhancementChanges: EnhancementChange[];
  /** AI analysis results */
  analysisResult: AnalysisResult | null;
  /** Current document status */
  status: DocumentStatus;
  /** Duration in seconds (estimated from word count or set by template) */
  durationSeconds: number;
  /** Min/max duration constraints (from template) */
  minDuration: number;
  maxDuration: number;
  /** Speaker label for multi-speaker content */
  speakerLabel: string | null;
  /** Character voice ID for Cast multi-voice */
  characterVoice: string | null;
  /** Visual prompt (Cast only — what the viewer sees) */
  visualPrompt: string | null;
  /** Visual prompt version (Cast only — separate from script version) */
  visualPromptVersion: number;
  /** TTS state */
  ttsGenerated: boolean;
  ttsStale: boolean;
  /** Video state (Cast only) */
  videoGenerated: boolean;
  videoStale: boolean;
}

export interface TTSConfig {
  provider: string;
  voiceId: string;
  speed: number;
  pitch: number;
  stability?: number;
  similarityBoost?: number;
  style?: string;
}

export interface VersionHistoryEntry {
  id: string;
  sceneId: string;
  content: string;
  version: number;
  source: 'manual' | 'ai_enhance' | 'ai_analysis' | 'transcreation' | 'import';
  timestamp: Date;
  label?: string;
}

export interface UnifiedEditorState {
  /** Editor mode: 'single' for Mind, 'multi-scene' for Cast */
  mode: EditorMode;
  /** Product context */
  productContext: 'mind' | 'cast' | 'spark' | 'deck';
  /** All scene documents */
  scenes: SceneDocument[];
  /** Currently active/focused scene ID */
  activeSceneId: string;
  /** TTS configuration */
  ttsConfig: TTSConfig;
  /** AI provider for enhancement/analysis */
  aiProvider: AIProvider;
  /** Enhancement focus */
  enhancementFocus: EnhancementFocus;
  /** Version history across all scenes */
  versionHistory: VersionHistoryEntry[];
  /** Whether any scene is currently being enhanced */
  isEnhancing: boolean;
  /** Whether any scene is currently being analyzed */
  isAnalyzing: boolean;
  /** Whether TTS is generating */
  isTTSGenerating: boolean;
  /** Global transcreation state */
  transcreationLanguages: string[];
  /** Whether the document has unsaved changes */
  isDirty: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const MIND_ROOT_ID = '__mind_root__';
const WORDS_PER_MINUTE_SPEAKING = 150;
const CHARS_PER_SECOND = 14;

function estimateDuration(content: string): number {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round((wordCount / WORDS_PER_MINUTE_SPEAKING) * 60));
}

function calculateBasicStats(content: string): ScriptStats {
  const words = content.trim().split(/\s+/).filter(Boolean);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const wordCount = words.length;
  const avgWordLen = wordCount > 0 ? words.reduce((sum, w) => sum + w.length, 0) / wordCount : 0;

  return {
    wordCount,
    sentenceCount: sentences.length,
    characterCount: content.length,
    estimatedReadingMinutes: Math.max(0.1, wordCount / 200),
    estimatedSpeakingMinutes: Math.max(0.1, wordCount / WORDS_PER_MINUTE_SPEAKING),
    readabilityScore: avgWordLen < 5 ? 'easy' : avgWordLen < 7 ? 'moderate' : 'difficult',
  };
}

// ─── Options ────────────────────────────────────────────────────────────────

export interface UseUnifiedEditorOptions {
  /** 'mind' | 'cast' | 'spark' | 'deck' */
  productContext: 'mind' | 'cast' | 'spark' | 'deck';
  /**
   * Editor mode override. If not provided, the hook infers:
   *   - 'multi-scene' when templateMapping has scenes
   *   - 'single' otherwise
   * Both Cast and Mind can operate in either mode:
   *   - Cast single: quick single-take video (no template)
   *   - Mind multi-scene: podcast with multiple segments, webcast chapters
   */
  mode?: EditorMode;
  /** Initial content for single-document mode */
  initialContent?: string;
  /** Initial title for single-document mode */
  initialTitle?: string;
  /** Template mapping for multi-scene mode */
  templateMapping?: TemplateMapping | null;
  /** Default TTS config */
  defaultTTSConfig?: Partial<TTSConfig>;
  /** Default AI provider */
  defaultAIProvider?: AIProvider;
  /** Callback when content changes */
  onContentChange?: (sceneId: string, content: string) => void;
  /** Callback when visual prompt changes */
  onVisualPromptChange?: (sceneId: string, prompt: string) => void;
  /** Callback when a scene's TTS becomes stale */
  onTTSStale?: (sceneId: string) => void;
  /** Callback when a scene's video becomes stale */
  onVideoStale?: (sceneId: string) => void;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useUnifiedEditorState(options: UseUnifiedEditorOptions) {
  const {
    productContext,
    mode: modeOverride,
    initialContent = '',
    initialTitle = 'Untitled Script',
    templateMapping,
    defaultTTSConfig,
    defaultAIProvider = 'gemini',
    onContentChange,
    onVisualPromptChange,
    onTTSStale,
    onVideoStale,
  } = options;

  // Determine mode: explicit override → data-driven → single fallback
  // Both Mind and Cast support single-scene AND multi-scene:
  //   - Mind multi-scene: podcast segments, webcast chapters, multi-chapter scripts
  //   - Cast single: quick single-take video (no template)
  //   - Cast multi-scene: template-based production with multiple scenes
  const mode: EditorMode = modeOverride
    ?? (templateMapping?.scenes?.length ? 'multi-scene' : 'single');

  // ── Initialize scenes ──────────────────────────────────────────────────

  const buildInitialScenes = useCallback((): SceneDocument[] => {
    if (mode === 'multi-scene' && templateMapping?.scenes?.length) {
      return templateMapping.scenes.map((scene, i) => ({
        id: scene.sceneId,
        title: scene.title,
        orderIndex: scene.orderIndex,
        content: scene.editedText || scene.scriptText,
        originalContent: scene.scriptText,
        enhancedContent: scene.editedText && scene.editedText !== scene.scriptText ? scene.editedText : null,
        cleanContent: null,
        activeVersion: scene.editedText ? 'enhanced' : 'original',
        version: 1,
        enhancementChanges: [],
        analysisResult: null,
        status: scene.approvalStatus === 'approved' ? 'approved' : 'draft',
        durationSeconds: scene.durationSeconds,
        minDuration: scene.minDuration,
        maxDuration: scene.maxDuration,
        speakerLabel: scene.characterVoice || null,
        characterVoice: scene.characterVoice || null,
        visualPrompt: scene.visualPipeline
          ? ((scene.visualPipeline[0] as any)?.prompt || (scene.visualPipeline[0] as any)?.description || null)
          : null,
        visualPromptVersion: 1,
        ttsGenerated: false,
        ttsStale: false,
        videoGenerated: false,
        videoStale: false,
      }));
    }

    // Single-document mode (Mind/Spark)
    return [{
      id: MIND_ROOT_ID,
      title: initialTitle,
      orderIndex: 0,
      content: initialContent,
      originalContent: initialContent || null,
      enhancedContent: null,
      cleanContent: null,
      activeVersion: 'original',
      version: 1,
      enhancementChanges: [],
      analysisResult: null,
      status: 'draft',
      durationSeconds: estimateDuration(initialContent),
      minDuration: 0,
      maxDuration: 0,
      speakerLabel: null,
      characterVoice: null,
      visualPrompt: null,
      visualPromptVersion: 0,
      ttsGenerated: false,
      ttsStale: false,
      videoGenerated: false,
      videoStale: false,
    }];
  }, [mode, templateMapping, initialContent, initialTitle]);

  // ── State ──────────────────────────────────────────────────────────────

  const [scenes, setScenes] = useState<SceneDocument[]>(buildInitialScenes);
  const [activeSceneId, setActiveSceneId] = useState<string>(
    mode === 'multi-scene' && templateMapping?.scenes?.[0]
      ? templateMapping.scenes[0].sceneId
      : MIND_ROOT_ID
  );
  const [ttsConfig, setTTSConfig] = useState<TTSConfig>({
    provider: defaultTTSConfig?.provider || 'elevenlabs',
    voiceId: defaultTTSConfig?.voiceId || '',
    speed: defaultTTSConfig?.speed || 1.0,
    pitch: defaultTTSConfig?.pitch || 1.0,
    stability: defaultTTSConfig?.stability,
    similarityBoost: defaultTTSConfig?.similarityBoost,
    style: defaultTTSConfig?.style,
  });
  const [aiProvider, setAIProvider] = useState<AIProvider>(defaultAIProvider);
  const [enhancementFocus, setEnhancementFocus] = useState<EnhancementFocus>('balanced');
  const [versionHistory, setVersionHistory] = useState<VersionHistoryEntry[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTTSGenerating, setIsTTSGenerating] = useState(false);
  const [transcreationLanguages, setTranscreationLanguages] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const versionCounter = useRef(1);

  // ── Derived values ─────────────────────────────────────────────────────

  const activeScene = useMemo(
    () => scenes.find(s => s.id === activeSceneId) || scenes[0],
    [scenes, activeSceneId]
  );

  const activeContent = useMemo(() => {
    if (!activeScene) return '';
    if (activeScene.activeVersion === 'enhanced' && activeScene.enhancedContent) {
      return activeScene.enhancedContent;
    }
    return activeScene.content;
  }, [activeScene]);

  const activeStats = useMemo(
    () => calculateBasicStats(activeContent),
    [activeContent]
  );

  const totalDurationSeconds = useMemo(
    () => scenes.reduce((sum, s) => sum + s.durationSeconds, 0),
    [scenes]
  );

  const totalWordCount = useMemo(
    () => scenes.reduce((sum, s) => {
      const text = s.activeVersion === 'enhanced' && s.enhancedContent ? s.enhancedContent : s.content;
      return sum + text.trim().split(/\s+/).filter(Boolean).length;
    }, 0),
    [scenes]
  );

  const fullScript = useMemo(
    () => scenes.map(s => {
      const text = s.activeVersion === 'enhanced' && s.enhancedContent ? s.enhancedContent : s.content;
      return text;
    }).join('\n\n'),
    [scenes]
  );

  const fullScriptWithMarkers = useMemo(
    () => scenes.map((s, i) => {
      const text = s.activeVersion === 'enhanced' && s.enhancedContent ? s.enhancedContent : s.content;
      return mode === 'multi-scene'
        ? `[SCENE ${i + 1}: ${s.title}]\n${text}`
        : text;
    }).join('\n\n'),
    [scenes, mode]
  );

  const scenesReadyForTTS = useMemo(
    () => scenes.filter(s => s.content.trim().length > 0 && !s.ttsGenerated).length,
    [scenes]
  );

  const scenesStale = useMemo(
    () => scenes.filter(s => s.ttsStale).length,
    [scenes]
  );

  const allApproved = useMemo(
    () => scenes.every(s => s.status === 'approved' || s.status === 'locked'),
    [scenes]
  );

  // ── Scene operations ───────────────────────────────────────────────────

  const updateScene = useCallback((sceneId: string, updates: Partial<SceneDocument>) => {
    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, ...updates } : s));
    setIsDirty(true);
  }, []);

  const updateSceneContent = useCallback((sceneId: string, newContent: string) => {
    setScenes(prev => prev.map(s => {
      if (s.id !== sceneId) return s;

      const newVersion = s.version + 1;
      const newDuration = estimateDuration(newContent);

      return {
        ...s,
        content: newContent,
        version: newVersion,
        durationSeconds: s.minDuration > 0
          ? Math.max(s.minDuration, Math.min(s.maxDuration, newDuration))
          : newDuration,
        ttsStale: s.ttsGenerated,
        videoStale: s.videoGenerated,
        status: s.status === 'approved' ? 'draft' : s.status,
      };
    }));

    setIsDirty(true);
    onContentChange?.(sceneId, newContent);

    // Notify staleness
    const scene = scenes.find(s => s.id === sceneId);
    if (scene?.ttsGenerated) onTTSStale?.(sceneId);
    if (scene?.videoGenerated) onVideoStale?.(sceneId);
  }, [scenes, onContentChange, onTTSStale, onVideoStale]);

  const updateVisualPrompt = useCallback((sceneId: string, newPrompt: string) => {
    setScenes(prev => prev.map(s => {
      if (s.id !== sceneId) return s;
      return {
        ...s,
        visualPrompt: newPrompt,
        visualPromptVersion: s.visualPromptVersion + 1,
        videoStale: s.videoGenerated,
      };
    }));

    setIsDirty(true);
    onVisualPromptChange?.(sceneId, newPrompt);

    const scene = scenes.find(s => s.id === sceneId);
    if (scene?.videoGenerated) onVideoStale?.(sceneId);
  }, [scenes, onVisualPromptChange, onVideoStale]);

  // ── Enhancement operations ─────────────────────────────────────────────

  const applyEnhancement = useCallback((
    sceneId: string,
    enhancedText: string,
    changes: EnhancementChange[],
    cleanText?: string
  ) => {
    // Save current content to version history
    const scene = scenes.find(s => s.id === sceneId);
    if (scene) {
      const historyEntry: VersionHistoryEntry = {
        id: `v-${Date.now()}`,
        sceneId,
        content: scene.content,
        version: scene.version,
        source: 'ai_enhance',
        timestamp: new Date(),
        label: `Before enhancement (v${scene.version})`,
      };
      setVersionHistory(prev => [...prev, historyEntry]);
    }

    setScenes(prev => prev.map(s => {
      if (s.id !== sceneId) return s;
      return {
        ...s,
        enhancedContent: enhancedText,
        cleanContent: cleanText || null,
        enhancementChanges: changes,
        activeVersion: 'enhanced',
        status: 'enhanced',
        ttsStale: s.ttsGenerated,
        videoStale: s.videoGenerated,
        durationSeconds: estimateDuration(enhancedText),
      };
    }));

    setIsDirty(true);
  }, [scenes]);

  const revertToOriginal = useCallback((sceneId: string) => {
    setScenes(prev => prev.map(s => {
      if (s.id !== sceneId) return s;
      return {
        ...s,
        activeVersion: 'original',
        enhancedContent: null,
        cleanContent: null,
        enhancementChanges: [],
        status: 'draft',
        durationSeconds: estimateDuration(s.content),
        ttsStale: s.ttsGenerated,
      };
    }));
    setIsDirty(true);
  }, []);

  const acceptEnhancementChange = useCallback((sceneId: string, changeId: string, accepted: boolean) => {
    setScenes(prev => prev.map(s => {
      if (s.id !== sceneId) return s;
      return {
        ...s,
        enhancementChanges: s.enhancementChanges.map(c =>
          c.id === changeId ? { ...c, accepted } : c
        ),
      };
    }));
    setIsDirty(true);
  }, []);

  // ── Analysis operations ────────────────────────────────────────────────

  const setAnalysisResult = useCallback((sceneId: string, result: AnalysisResult | null) => {
    updateScene(sceneId, { analysisResult: result });
  }, [updateScene]);

  // ── TTS operations ─────────────────────────────────────────────────────

  const markTTSGenerated = useCallback((sceneId: string) => {
    updateScene(sceneId, { ttsGenerated: true, ttsStale: false });
  }, [updateScene]);

  const markVideoGenerated = useCallback((sceneId: string) => {
    updateScene(sceneId, { videoGenerated: true, videoStale: false });
  }, [updateScene]);

  const invalidateTTS = useCallback((sceneId: string) => {
    updateScene(sceneId, { ttsStale: true });
  }, [updateScene]);

  const invalidateVideo = useCallback((sceneId: string) => {
    updateScene(sceneId, { videoStale: true });
  }, [updateScene]);

  // ── Approval operations ────────────────────────────────────────────────

  const approveScene = useCallback((sceneId: string) => {
    updateScene(sceneId, { status: 'approved' });
  }, [updateScene]);

  const approveAllScenes = useCallback(() => {
    setScenes(prev => prev.map(s => ({ ...s, status: 'approved' })));
    setIsDirty(true);
  }, []);

  const lockScene = useCallback((sceneId: string) => {
    updateScene(sceneId, { status: 'locked' });
  }, [updateScene]);

  // ── Scene navigation ───────────────────────────────────────────────────

  const goToNextScene = useCallback(() => {
    const currentIdx = scenes.findIndex(s => s.id === activeSceneId);
    if (currentIdx < scenes.length - 1) {
      setActiveSceneId(scenes[currentIdx + 1].id);
    }
  }, [scenes, activeSceneId]);

  const goToPreviousScene = useCallback(() => {
    const currentIdx = scenes.findIndex(s => s.id === activeSceneId);
    if (currentIdx > 0) {
      setActiveSceneId(scenes[currentIdx - 1].id);
    }
  }, [scenes, activeSceneId]);

  // ── Scene reordering (Cast multi-scene only) ──────────────────────────

  const reorderScenes = useCallback((fromIndex: number, toIndex: number) => {
    if (mode !== 'multi-scene') return;

    setScenes(prev => {
      const newScenes = [...prev];
      const [moved] = newScenes.splice(fromIndex, 1);
      newScenes.splice(toIndex, 0, moved);
      return newScenes.map((s, i) => ({ ...s, orderIndex: i }));
    });
    setIsDirty(true);
  }, [mode]);

  // ── Add/remove scenes (Cast multi-scene only) ─────────────────────────

  const addScene = useCallback((title: string, afterSceneId?: string) => {
    if (mode !== 'multi-scene') return null;

    const newId = `scene-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const insertIndex = afterSceneId
      ? scenes.findIndex(s => s.id === afterSceneId) + 1
      : scenes.length;

    const newScene: SceneDocument = {
      id: newId,
      title,
      orderIndex: insertIndex,
      content: '',
      originalContent: null,
      enhancedContent: null,
      cleanContent: null,
      activeVersion: 'original',
      version: 1,
      enhancementChanges: [],
      analysisResult: null,
      status: 'draft',
      durationSeconds: 5,
      minDuration: 0,
      maxDuration: 0,
      speakerLabel: null,
      characterVoice: null,
      visualPrompt: null,
      visualPromptVersion: 0,
      ttsGenerated: false,
      ttsStale: false,
      videoGenerated: false,
      videoStale: false,
    };

    setScenes(prev => {
      const newScenes = [...prev];
      newScenes.splice(insertIndex, 0, newScene);
      return newScenes.map((s, i) => ({ ...s, orderIndex: i }));
    });

    setActiveSceneId(newId);
    setIsDirty(true);
    return newId;
  }, [mode, scenes]);

  const removeScene = useCallback((sceneId: string) => {
    if (mode !== 'multi-scene') return;
    if (scenes.length <= 1) return; // Must have at least one scene

    setScenes(prev => {
      const filtered = prev.filter(s => s.id !== sceneId);
      return filtered.map((s, i) => ({ ...s, orderIndex: i }));
    });

    // If removing active scene, switch to first remaining
    if (activeSceneId === sceneId) {
      const remaining = scenes.filter(s => s.id !== sceneId);
      if (remaining.length > 0) {
        setActiveSceneId(remaining[0].id);
      }
    }

    setIsDirty(true);
  }, [mode, scenes, activeSceneId]);

  // ── Reinitialize from new template mapping ─────────────────────────────

  const reinitializeFromMapping = useCallback((newMapping: TemplateMapping) => {
    const newScenes = newMapping.scenes.map((scene, i): SceneDocument => ({
      id: scene.sceneId,
      title: scene.title,
      orderIndex: scene.orderIndex,
      content: scene.editedText || scene.scriptText,
      originalContent: scene.scriptText,
      enhancedContent: scene.editedText && scene.editedText !== scene.scriptText ? scene.editedText : null,
      cleanContent: null,
      activeVersion: scene.editedText ? 'enhanced' : 'original',
      version: 1,
      enhancementChanges: [],
      analysisResult: null,
      status: scene.approvalStatus === 'approved' ? 'approved' : 'draft',
      durationSeconds: scene.durationSeconds,
      minDuration: scene.minDuration,
      maxDuration: scene.maxDuration,
      speakerLabel: scene.characterVoice || null,
      characterVoice: scene.characterVoice || null,
      visualPrompt: scene.visualPipeline
        ? ((scene.visualPipeline[0] as any)?.prompt || (scene.visualPipeline[0] as any)?.description || null)
        : null,
      visualPromptVersion: 1,
      ttsGenerated: false,
      ttsStale: false,
      videoGenerated: false,
      videoStale: false,
    }));

    setScenes(newScenes);
    if (newScenes.length > 0) {
      setActiveSceneId(newScenes[0].id);
    }
    setIsDirty(false);
  }, []);

  // ── Export to TemplateMapping format (for Cast → production session) ────

  const exportAsTemplateMapping = useCallback((): SceneScript[] => {
    return scenes.map(s => ({
      sceneId: s.id,
      sceneKey: s.id,
      title: s.title,
      orderIndex: s.orderIndex,
      scriptText: s.content,
      editedText: s.enhancedContent || (s.content !== s.originalContent ? s.content : undefined),
      sourceType: 'custom' as const,
      durationSeconds: s.durationSeconds,
      minDuration: s.minDuration,
      maxDuration: s.maxDuration,
      ttsConfig: {
        provider: ttsConfig.provider,
        voiceId: ttsConfig.voiceId,
        speed: ttsConfig.speed,
        pitch: ttsConfig.pitch,
      },
      visualPipeline: s.visualPrompt ? [{ prompt: s.visualPrompt }] : undefined,
      characterVoice: s.characterVoice || undefined,
      approvalStatus: s.status === 'approved' ? 'approved' as const : 'draft' as const,
    }));
  }, [scenes, ttsConfig]);

  // ── Version history ────────────────────────────────────────────────────

  const addVersionHistoryEntry = useCallback((
    sceneId: string,
    source: VersionHistoryEntry['source'],
    label?: string
  ) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    versionCounter.current += 1;
    const entry: VersionHistoryEntry = {
      id: `v-${versionCounter.current}`,
      sceneId,
      content: scene.activeVersion === 'enhanced' && scene.enhancedContent
        ? scene.enhancedContent
        : scene.content,
      version: scene.version,
      source,
      timestamp: new Date(),
      label,
    };

    setVersionHistory(prev => [...prev, entry]);
  }, [scenes]);

  const restoreFromHistory = useCallback((entry: VersionHistoryEntry) => {
    updateSceneContent(entry.sceneId, entry.content);
  }, [updateSceneContent]);

  const getSceneVersionHistory = useCallback((sceneId: string) => {
    return versionHistory.filter(v => v.sceneId === sceneId);
  }, [versionHistory]);

  // ── Return ─────────────────────────────────────────────────────────────

  return {
    // State
    mode,
    productContext,
    scenes,
    activeSceneId,
    activeScene,
    activeContent,
    activeStats,
    ttsConfig,
    aiProvider,
    enhancementFocus,
    versionHistory,
    isEnhancing,
    isAnalyzing,
    isTTSGenerating,
    transcreationLanguages,
    isDirty,

    // Computed
    totalDurationSeconds,
    totalWordCount,
    fullScript,
    fullScriptWithMarkers,
    scenesReadyForTTS,
    scenesStale,
    allApproved,

    // Scene operations
    setActiveSceneId,
    updateScene,
    updateSceneContent,
    updateVisualPrompt,
    goToNextScene,
    goToPreviousScene,
    reorderScenes,
    addScene,
    removeScene,

    // Enhancement
    applyEnhancement,
    revertToOriginal,
    acceptEnhancementChange,
    setIsEnhancing,

    // Analysis
    setAnalysisResult,
    setIsAnalyzing,

    // TTS
    setTTSConfig,
    markTTSGenerated,
    markVideoGenerated,
    invalidateTTS,
    invalidateVideo,
    setIsTTSGenerating,

    // Approval
    approveScene,
    approveAllScenes,
    lockScene,

    // AI config
    setAIProvider,
    setEnhancementFocus,

    // Transcreation
    setTranscreationLanguages,

    // Version history
    addVersionHistoryEntry,
    restoreFromHistory,
    getSceneVersionHistory,

    // Reinitialize
    reinitializeFromMapping,
    exportAsTemplateMapping,

    // Dirty flag
    setIsDirty,
  };
}

export type UnifiedEditorHook = ReturnType<typeof useUnifiedEditorState>;
