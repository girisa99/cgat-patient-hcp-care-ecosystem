/**
 * Script Editor Tab for GenieStudio
 * Refactored from 2749-line monolith into modular architecture.
 *
 * State management and handlers remain here.
 * Rendering delegated to sub-components in ./script-editor/
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUniversalEnrichment } from '@/services/enrichment';
import { EnrichmentStatusBadge } from '@/components/genie-studio/EnrichmentStatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Video,
  Mic,
  Search,
  Sparkles,
  Volume2,
  Save,
  X,
  RotateCcw,
  Loader2,
  Copy,
  BookOpen,
  Trash2,
  Plus,
  Edit3,
  Upload,
  Globe,
  Shield,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTTSGeneration, OPENAI_VOICES, ELEVENLABS_VOICES, GOOGLE_VOICES } from '@/components/document-processing/RecordingStudio/hooks/useTTSGeneration';
import { ScriptModeToolbar } from './ScriptModeToolbar';
import { SavedScriptCard } from './SavedScriptCard';
import { SCRIPT_MODES, type ScriptMode } from '@/types/projects';
import { SCRIPT_MODE_CONFIGS, type VoicePreset } from '@/config/scriptModePresets';

// Module imports from refactored script-editor/
import { calculateStats, ANALYSIS_STEPS } from './script-editor/utils';
import { ScriptStatsBar } from './script-editor/ScriptStatsBar';
import { ProgressiveAnalysisOverlay } from './script-editor/ProgressiveAnalysisOverlay';
import { AnalysisResultsPanel } from './script-editor/AnalysisResultsPanel';
import { EnhancementReviewPanel } from './script-editor/EnhancementReviewPanel';
import { EnhancementDialog } from './script-editor/EnhancementDialog';
import { TTSOptionsPanel } from './script-editor/TTSOptionsPanel';
import { TranscreationPreview } from './script-editor/TranscreationPreview';
import { BrandVoiceChecker } from './script-editor/BrandVoiceChecker';
import { VersionHistoryPanel, type ScriptVersionEntry } from './script-editor/VersionHistoryPanel';

// Unified editor — shared with Cast (Mind ↔ Cast parity)
import { UnifiedScriptPanel } from '@/components/shared/UnifiedScriptPanel';
import { useUnifiedEditorState } from '@/hooks/useUnifiedEditorState';
import type {
  SavedScript,
  ScriptPurpose,
  AnalysisRecommendation,
  EnhancementMarkers,
  EngagementScore,
  ShowInfo,
  AIProvider,
  EnhancementFocus,
} from './script-editor/types';

// Re-export types for backward compatibility
export type { SavedScript, ShowInfo, ScriptPurpose };

interface ScriptEditorTabProps {
  savedScripts: SavedScript[];
  initialScriptId?: string | null;
  onSaveScript: (script: SavedScript) => void;
  onDeleteScript: (id: string) => void;
  onUpdateScript: (id: string, updates: Partial<SavedScript>) => void;
  onSaveVoiceover: (url: string, name: string, scriptId?: string, audioBlob?: Blob, scriptMeta?: { originalScript?: string; scriptText?: string; scriptType?: string }) => void;
  savedVoiceovers: Array<{ id: string; name: string; url?: string; scriptId?: string }>;
  availableShows?: ShowInfo[];
  selectedShowId?: string;
  onShowSelect?: (showId: string | null) => void;
}

export function ScriptEditorTab({
  savedScripts,
  initialScriptId,
  onSaveScript,
  onDeleteScript,
  onUpdateScript,
  onSaveVoiceover,
  savedVoiceovers,
  availableShows = [],
  selectedShowId,
  onShowSelect
}: ScriptEditorTabProps) {
  // Universal enrichment
  const { additionalContext: enrichmentContext, status: enrichmentStatus, isLoading: enrichmentLoading, isAvailable: enrichmentAvailable, productName: enrichmentProductName } = useUniversalEnrichment({ productName: 'Genie Mind' });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ──── Show Selection State ────
  const [linkedShowId, setLinkedShowId] = useState<string | null>(selectedShowId || null);
  const selectedShow = availableShows.find(s => s.id === linkedShowId);
  const showType = selectedShow?.show_type;
  const isTTSEnabled = !showType || showType === 'webcast' || showType === 'tutorial' || showType === 'other';
  const isPodcastMode = showType === 'podcast' || showType === 'interview' || showType === 'panel';

  // ──── Script Selection & Content State ────
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [scriptName, setScriptName] = useState('');
  const [scriptContent, setScriptContent] = useState('');
  const [scriptType, setScriptType] = useState<'video' | 'audio'>('video');
  const [scriptMode, setScriptMode] = useState<ScriptMode>('video');
  const [, /* scriptPurpose */ ] = useState<ScriptPurpose>('video');
  const [isNewScript, setIsNewScript] = useState(true);
  const [isUploadingScript, setIsUploadingScript] = useState(false);

  // ──── UI-Only State (not duplicated in unified editor) ────
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<Array<{ step: string; status: 'pending' | 'running' | 'complete'; detail?: string }>>([]);
  const [showProgressiveAnalysis, setShowProgressiveAnalysis] = useState(false);
  const [showEnhancementReview, setShowEnhancementReview] = useState(false);
  const [reviewProgress, setReviewProgress] = useState(0);
  const [enhancementMarkers, setEnhancementMarkers] = useState<EnhancementMarkers | null>(null);
  const [engagementScore, setEngagementScore] = useState<EngagementScore | null>(null);
  const [showEnhancementDialog, setShowEnhancementDialog] = useState(false);
  const [customEnhancementInstructions, setCustomEnhancementInstructions] = useState('');
  const [editingChangeId, setEditingChangeId] = useState<string | null>(null);
  const [editedEnhancedText, setEditedEnhancedText] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [, setLastDraftSave] = useState<Date | null>(null);
  const [showTTSOptions, setShowTTSOptions] = useState(false);
  const [selectedTTSScriptId, setSelectedTTSScriptId] = useState<string | null>(null);
  const [selectedVoicePreset, setSelectedVoicePreset] = useState<VoicePreset | null>(null);
  const [customVoiceSettings, setCustomVoiceSettings] = useState<{ stability: number; similarityBoost: number; style: number; speed: number } | undefined>(undefined);
  const [showTranscreation, setShowTranscreation] = useState(false);
  const [showBrandVoice, setShowBrandVoice] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // ──── Chapter/Multi-Scene Mode ────
  const [chapterModeEnabled, setChapterModeEnabled] = useState(false);

  // ══════════════════════════════════════════
  // UNIFIED EDITOR — Single source of truth for content, enhancement, analysis, TTS, AI config
  // Replaces ~15 individual useState calls with shared Mind ↔ Cast hook
  // ══════════════════════════════════════════
  const unifiedEditor = useUnifiedEditorState({
    productContext: 'mind',
    mode: chapterModeEnabled ? 'multi-scene' : 'single',
    initialContent: scriptContent,
    initialTitle: scriptName || 'Untitled Script',
    onContentChange: (_sceneId, content) => {
      if (!chapterModeEnabled) {
        setScriptContent(content);
      }
    },
  });

  // ── Derived aliases from unified editor (backward-compatible with existing handlers) ──
  const sceneId = unifiedEditor.activeSceneId;
  const originalContent = unifiedEditor.activeScene?.originalContent ?? null;
  const enhancedContent = unifiedEditor.activeScene?.enhancedContent ?? null;
  const cleanTTSContent = unifiedEditor.activeScene?.cleanContent ?? null;
  const activeVersion: 'original' | 'enhanced' = unifiedEditor.activeScene?.activeVersion === 'enhanced' ? 'enhanced' : 'original';
  const isEnhancing = unifiedEditor.isEnhancing;
  const isAnalyzing = unifiedEditor.isAnalyzing;
  const analysisResult = unifiedEditor.activeScene?.analysisResult ?? null;
  const enhancementChanges = unifiedEditor.activeScene?.enhancementChanges ?? [];
  const enhancementFocus = unifiedEditor.enhancementFocus;
  const aiProvider = unifiedEditor.aiProvider;
  const ttsProvider = (unifiedEditor.ttsConfig.provider || 'elevenlabs') as 'openai' | 'elevenlabs' | 'google';
  const ttsVoice = unifiedEditor.ttsConfig.voiceId || '';

  // Map unified editor version history to ScriptVersionEntry format
  const scriptVersions: ScriptVersionEntry[] = (unifiedEditor.versionHistory ?? []).map(
    (entry, i): ScriptVersionEntry => {
      const versionType: ScriptVersionEntry['versionType'] =
        entry.source === 'ai_enhance' ? 'enhanced'
        : entry.source === 'transcreation' ? 'transcreation'
        : 'manual_edit';
      return {
        id: entry.id,
        versionNumber: i + 1,
        content: entry.content,
        versionType,
        changeSummary: entry.label || '',
        createdAt: entry.timestamp.getTime(),
        wordCount: entry.content.trim().split(/\s+/).length,
      };
    }
  );

  // ── Direct unified-editor helpers (no wrapper indirection) ──
  // All handlers below call unifiedEditor methods directly.
  // These thin aliases exist ONLY for JSX callback props that need a stable reference shape.
  const onAiProviderChange = useCallback((p: string) => unifiedEditor.setAIProvider(p as AIProvider), [unifiedEditor]);
  const onEnhancementFocusChange = useCallback((f: EnhancementFocus) => unifiedEditor.setEnhancementFocus(f), [unifiedEditor]);
  const onTtsProviderChange = useCallback((p: 'openai' | 'elevenlabs' | 'google') => {
    unifiedEditor.setTTSConfig({ ...unifiedEditor.ttsConfig, provider: p });
  }, [unifiedEditor]);
  const onTtsVoiceChange = useCallback((v: string) => {
    unifiedEditor.setTTSConfig({ ...unifiedEditor.ttsConfig, voiceId: v });
  }, [unifiedEditor]);

  // ──── TTS Hook ────
  const { isGenerating: isTTSGenerating, lastResult: ttsResult, generate: generateTTS, play: playTTS, download: downloadTTS } = useTTSGeneration();

  // ──── Computed Values ────
  const currentContent = activeVersion === 'enhanced' && enhancedContent ? enhancedContent : scriptContent;
  const stats = calculateStats(currentContent);
  const originalStats = originalContent ? calculateStats(originalContent) : null;
  const enhancedStats = enhancedContent ? calculateStats(enhancedContent) : null;
  const videoScripts = savedScripts.filter(s => s.type === 'video');
  const audioScripts = savedScripts.filter(s => s.type === 'audio');

  // ════════════════════════════════════════
  // HANDLERS
  // ════════════════════════════════════════

  const handleSelectScript = useCallback((scriptId: string) => {
    const script = savedScripts.find(s => s.id === scriptId);
    if (script) {
      setSelectedScriptId(scriptId);
      setScriptName(script.name);
      setScriptContent(script.content);
      setScriptType(script.type);
      setIsNewScript(false);
      unifiedEditor.updateScene(sceneId, {
        originalContent: script.content,
        enhancedContent: script.enhancedContent || null,
        cleanContent: script.cleanContent || null,
        activeVersion: script.enhancedContent ? 'enhanced' : 'original',
      });
      if (script.draftStatus === 'in_progress' && script.draftContent) {
        setHasDraft(true);
        toast.info('Draft found! You can continue reviewing from where you left off.');
      } else {
        setHasDraft(false);
      }
      setShowAnalysis(false);
      setShowEnhancementReview(false);
      toast.success(`Loaded "${script.name}"`);
    }
  }, [savedScripts, sceneId, unifiedEditor]);

  // Auto-select script when initialScriptId changes
  useEffect(() => {
    if (initialScriptId && savedScripts.length > 0 && initialScriptId !== selectedScriptId) {
      handleSelectScript(initialScriptId);
    }
  }, [initialScriptId, savedScripts.length]);

  const handleNewScript = () => {
    setSelectedScriptId(null);
    setScriptName('');
    setScriptContent('');
    setIsNewScript(true);
    unifiedEditor.updateScene(sceneId, {
      originalContent: null,
      enhancedContent: null,
      cleanContent: null,
      activeVersion: 'original',
      analysisResult: undefined,
      enhancementChanges: [],
    });
    setShowAnalysis(false);
    setShowEnhancementReview(false);
    setHasDraft(false);
  };

  const handleScriptFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validExtensions = ['.txt', '.md'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExtension && file.type !== 'text/plain') {
      toast.error('Please upload a .txt or .md file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be less than 5MB');
      return;
    }
    setIsUploadingScript(true);
    try {
      const content = await file.text();
      const fileName = file.name.replace(/\.(txt|md)$/i, '');
      setScriptName(fileName);
      setScriptContent(content);
      setIsNewScript(true);
      setSelectedScriptId(null);
      unifiedEditor.updateScene(sceneId, {
        originalContent: content,
        enhancedContent: null,
        cleanContent: null,
      });
      toast.success(`Loaded "${fileName}" - ${content.split(/\s+/).filter(w => w).length} words`);
    } catch (error) {
      console.error('Error reading script file:', error);
      toast.error('Failed to read file');
    } finally {
      setIsUploadingScript(false);
      if (event.target) event.target.value = '';
    }
  }, []);

  // Set default TTS voice based on provider
  useEffect(() => {
    const voiceId = ttsProvider === 'openai' ? (OPENAI_VOICES[0]?.value || 'alloy')
      : ttsProvider === 'google' ? (GOOGLE_VOICES[0]?.value || 'en-US-Neural2-D')
      : (ELEVENLABS_VOICES[0]?.value || 'aria');
    unifiedEditor.setTTSConfig({ ...unifiedEditor.ttsConfig, voiceId });
  }, [ttsProvider]);

  // Update voice preset when script mode changes
  useEffect(() => {
    const modeConfig = SCRIPT_MODE_CONFIGS[scriptMode];
    if (modeConfig) {
      const defaultVoice = modeConfig.tts.defaultVoice;
      setSelectedVoicePreset(defaultVoice);
      unifiedEditor.setTTSConfig({
        ...unifiedEditor.ttsConfig,
        voiceId: defaultVoice.voiceName.toLowerCase(),
        provider: defaultVoice.provider,
      });
      setCustomVoiceSettings({
        stability: defaultVoice.stability,
        similarityBoost: defaultVoice.similarityBoost,
        style: defaultVoice.style,
        speed: defaultVoice.speed,
      });
    }
  }, [scriptMode]);

  // Progressive step update helper
  const updateStep = (stepId: string, status: 'pending' | 'running' | 'complete', detail?: string) => {
    setAnalysisSteps(prev => prev.map(s => s.step === stepId ? { ...s, status, detail } : s));
  };

  // Analyze Script
  const handleAnalyze = async () => {
    if (!scriptContent.trim()) { toast.error('Please enter script content first'); return; }
    unifiedEditor.setIsAnalyzing(true);
    setShowProgressiveAnalysis(true);
    setAnalysisSteps(ANALYSIS_STEPS.map(s => ({ step: s.id, status: 'pending' as const })));
    const localRecommendations: AnalysisRecommendation[] = [];
    try {
      updateStep('stats', 'running');
      await new Promise(r => setTimeout(r, 400));
      const currentStats = calculateStats(scriptContent);
      updateStep('stats', 'complete', `${currentStats.wordCount} words, ${currentStats.estimatedSpeakingMinutes}min speaking time`);

      updateStep('readability', 'running');
      await new Promise(r => setTimeout(r, 500));
      if (currentStats.readabilityScore === 'difficult') {
        localRecommendations.push({ id: 'rec-readability', type: 'readability', severity: 'warning', title: 'Complex sentences detected', description: 'Consider breaking long sentences into shorter ones for easier voiceover delivery.', accepted: null });
        updateStep('readability', 'complete', '⚠️ Complex sentences found');
      } else {
        updateStep('readability', 'complete', `✓ ${currentStats.readabilityScore} readability`);
      }

      updateStep('pacing', 'running');
      await new Promise(r => setTimeout(r, 400));
      const hasPauses = scriptContent.includes('...') || scriptContent.includes('—') || scriptContent.includes('–');
      if (!hasPauses) {
        localRecommendations.push({ id: 'rec-pacing', type: 'pacing', severity: 'suggestion', title: 'Consider adding natural pauses', description: 'Use "..." for pauses to give viewers time to absorb information.', accepted: null });
        updateStep('pacing', 'complete', '💡 No pause markers found');
      } else {
        updateStep('pacing', 'complete', '✓ Pause markers present');
      }

      updateStep('engagement', 'running');
      await new Promise(r => setTimeout(r, 450));
      const hasQuestions = scriptContent.includes('?');
      const hasCallToAction = /\b(click|subscribe|sign up|get started|learn more|try|join)\b/i.test(scriptContent);
      if (!hasQuestions && !hasCallToAction) {
        localRecommendations.push({ id: 'rec-engagement', type: 'engagement', severity: 'suggestion', title: 'Consider adding engagement hooks', description: 'Questions or calls-to-action can increase viewer engagement.', accepted: null });
        updateStep('engagement', 'complete', '💡 Could improve engagement');
      } else {
        updateStep('engagement', 'complete', '✓ Good engagement elements');
      }

      updateStep('clarity', 'running');
      await new Promise(r => setTimeout(r, 400));
      if (currentStats.wordCount > 500) {
        localRecommendations.push({ id: 'rec-length', type: 'length', severity: 'info', title: 'Script is quite long', description: `At ${currentStats.estimatedSpeakingMinutes} minutes, consider if this needs to be split into sections.`, accepted: null });
        updateStep('clarity', 'complete', `ℹ️ ${currentStats.estimatedSpeakingMinutes}min - consider sections`);
      } else {
        updateStep('clarity', 'complete', '✓ Good length for single segment');
      }

      updateStep('ai', 'running');
      const providerNames = { gemini: 'Gemini', openai: 'OpenAI', claude: 'Claude' };
      const aiTimeoutId = setTimeout(() => { console.log('AI analysis timeout'); }, 30000);
      try {
        const { data, error } = await supabase.functions.invoke('enhance-script', { body: { scriptContent, mode: 'analyze', provider: aiProvider } });
        clearTimeout(aiTimeoutId);
        if (!error && data?.success && data.data) {
          const aiData = data.data;
          if (aiData.recommendations) {
            const aiRecs = (aiData.recommendations || []).map((rec: any, i: number) => ({ ...rec, id: `ai-rec-${i}`, accepted: null }));
            localRecommendations.push(...aiRecs);
          }
          const engagementInfo = aiData.overallAssessment?.engagementScore ? `, engagement: ${aiData.overallAssessment.engagementScore}/10` : '';
          updateStep('ai', 'complete', `Found ${localRecommendations.length} suggestions${engagementInfo}`);
          unifiedEditor.setAnalysisResult(sceneId, { stats: currentStats, recommendations: localRecommendations, pauseOpportunities: aiData.pauseOpportunities || [], sectionBreaks: aiData.sectionBreaks || [], overallAssessment: aiData.overallAssessment || null, engagementAnalysis: aiData.engagementAnalysis || null });
        } else {
          updateStep('ai', 'complete', `✓ ${providerNames[aiProvider]} analysis complete`);
          unifiedEditor.setAnalysisResult(sceneId, { stats: currentStats, recommendations: localRecommendations });
        }
      } catch (err) {
        clearTimeout(aiTimeoutId);
        updateStep('ai', 'complete', '✓ Using local analysis');
        unifiedEditor.setAnalysisResult(sceneId, { stats: currentStats, recommendations: localRecommendations });
      }
      setShowAnalysis(true);
      toast.success(`Analysis complete! Found ${localRecommendations.length} recommendations.`);
    } catch (err) {
      console.error('Analysis error:', err);
      toast.error('Analysis failed. Please try again.');
    } finally {
      unifiedEditor.setIsAnalyzing(false);
      setTimeout(() => setShowProgressiveAnalysis(false), 1500);
    }
  };

  const openEnhancementDialog = () => {
    if (!scriptContent.trim()) { toast.error('Please enter script content first'); return; }
    setShowEnhancementDialog(true);
  };

  const handleEnhance = async (useCustomInstructions = false) => {
    if (!scriptContent.trim()) { toast.error('Please enter script content first'); return; }
    setShowEnhancementDialog(false);
    unifiedEditor.setIsEnhancing(true);
    const providerNames = { gemini: 'Gemini', openai: 'OpenAI', claude: 'Claude' };
    try {
      const enhancementBody: any = { scriptContent, mode: 'enhance', provider: aiProvider, ...(enrichmentContext ? { enrichmentContext } : {}) };
      if (useCustomInstructions) {
        enhancementBody.focus = enhancementFocus;
        if (customEnhancementInstructions.trim()) enhancementBody.customInstructions = customEnhancementInstructions.trim();
      }
      const enhanceTimeoutId = setTimeout(() => { unifiedEditor.setIsEnhancing(false); toast.error('Enhancement took too long.'); }, 45000);
      const { data, error } = await supabase.functions.invoke('enhance-script', { body: enhancementBody });
      clearTimeout(enhanceTimeoutId);
      if (error) throw error;
      if (data?.success && data.data) {
        const enhanced = data.data.enhancedScript || '';
        const clean = data.data.cleanScript || enhanced.replace(/\.\.\./g, '. ').replace(/—/g, ', ').replace(/---/g, '');
        const changes = (data.data.changes || []).map((change: any, i: number) => ({ ...change, id: `change-${i}`, accepted: null }));
        const markers = data.data.markers || { pausesAdded: 0, sectionBreaksAdded: 0, sentencesRewritten: 0, engagementHooksAdded: 0, conversationalChanges: 0 };
        const engScore = data.data.engagementScore || null;
        unifiedEditor.updateScene(sceneId, {
          originalContent: scriptContent,
          enhancedContent: enhanced,
          cleanContent: clean,
          enhancementChanges: changes,
        });
        setEnhancementMarkers(markers);
        setEngagementScore(engScore);
        setShowEnhancementReview(true);
        setReviewProgress(0);
        const engagementInfo = engScore ? ` Engagement: ${engScore.before}→${engScore.after}/10` : '';
        toast.success(`${providerNames[aiProvider]} enhancement complete! ${changes.length} changes.${engagementInfo}`);
      }
    } catch (err) {
      console.error('Enhancement error:', err);
      toast.error(`${providerNames[aiProvider]} enhancement failed.`);
    } finally {
      unifiedEditor.setIsEnhancing(false);
    }
  };

  // Enhancement review handlers
  const handleAcceptChange = (changeId: string) => {
    unifiedEditor.updateScene(sceneId, {
      enhancementChanges: enhancementChanges.map(c => c.id === changeId ? { ...c, accepted: true } : c),
    });
  };

  const handleSkipChange = (changeId: string) => {
    unifiedEditor.updateScene(sceneId, {
      enhancementChanges: enhancementChanges.map(c => c.id === changeId ? { ...c, accepted: false } : c),
    });
  };

  const handleAcceptAll = () => {
    unifiedEditor.updateScene(sceneId, {
      enhancementChanges: enhancementChanges.map(c => ({ ...c, accepted: true })),
    });
    setReviewProgress(100);
    toast.success('All changes accepted!');
  };

  const handleSkipAll = () => {
    unifiedEditor.updateScene(sceneId, {
      enhancementChanges: enhancementChanges.map(c => c.accepted === null ? { ...c, accepted: false } : c),
    });
    setReviewProgress(100);
    toast.info('Remaining changes skipped');
  };

  // Track review progress
  useEffect(() => {
    if (enhancementChanges.length > 0) {
      const reviewed = enhancementChanges.filter(c => c.accepted !== null).length;
      setReviewProgress(Math.round((reviewed / enhancementChanges.length) * 100));
    }
  }, [enhancementChanges]);

  const handleCompleteEnhancement = () => {
    const acceptedChanges = enhancementChanges.filter(c => c.accepted === true);
    if (acceptedChanges.length > 0 && enhancedContent) {
      setScriptContent(enhancedContent);
      unifiedEditor.updateScene(sceneId, { activeVersion: 'enhanced' });
      toast.success(`Applied ${acceptedChanges.length} enhancements!`);
    } else {
      toast.info('No changes applied. Using original script.');
    }
    setShowEnhancementReview(false);
  };

  // Draft handlers
  const handleSaveDraft = async () => {
    if (!scriptContent.trim() || !scriptName.trim()) { toast.error('Please add a name and content'); return; }
    setIsSavingDraft(true);
    try {
      const script: SavedScript = {
        id: selectedScriptId || crypto.randomUUID(),
        name: scriptName, content: originalContent || scriptContent, type: scriptType,
        createdAt: selectedScriptId ? savedScripts.find(s => s.id === selectedScriptId)?.createdAt || Date.now() : Date.now(),
        updatedAt: Date.now(),
        draftContent: enhancedContent || undefined, draftStatus: 'in_progress',
        draftChanges: enhancementChanges.length > 0 ? enhancementChanges : undefined
      };
      onSaveScript(script);
      setHasDraft(true);
      setLastDraftSave(new Date());
      toast.success('Draft saved!');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleResumeDraft = () => {
    const script = savedScripts.find(s => s.id === selectedScriptId);
    if (script?.draftContent && script.draftChanges) {
      unifiedEditor.updateScene(sceneId, {
        enhancedContent: script.draftContent,
        enhancementChanges: script.draftChanges,
      });
      setShowEnhancementReview(true);
      toast.success('Resumed from draft!');
    }
  };

  const handleSaveScript = () => {
    if (!scriptContent.trim() || !scriptName.trim()) { toast.error('Please add a name and content'); return; }
    const script: SavedScript = {
      id: selectedScriptId || crypto.randomUUID(),
      name: scriptName,
      content: activeVersion === 'enhanced' && enhancedContent ? enhancedContent : scriptContent,
      type: scriptType,
      createdAt: selectedScriptId ? savedScripts.find(s => s.id === selectedScriptId)?.createdAt || Date.now() : Date.now(),
      updatedAt: Date.now(),
      enhancedContent: enhancedContent || undefined,
      cleanContent: cleanTTSContent || undefined,
      draftStatus: 'completed',
      stats
    };
    onSaveScript(script);
    setIsNewScript(false);
    setSelectedScriptId(script.id);
    setHasDraft(false);
    toast.success('Script saved!');
  };

  const handleRevertToOriginal = () => {
    if (originalContent) {
      setScriptContent(originalContent);
      unifiedEditor.revertToOriginal(sceneId);
      toast.info('Reverted to original script');
    }
  };

  // TTS handlers
  const handleGenerateTTS = async () => {
    const textForTTS = cleanTTSContent || (activeVersion === 'enhanced' && enhancedContent ? enhancedContent : scriptContent);
    if (!textForTTS.trim()) { toast.error('No content to generate TTS'); return; }
    const voiceSettings = customVoiceSettings || (selectedVoicePreset ? { stability: selectedVoicePreset.stability, similarityBoost: selectedVoicePreset.similarityBoost, style: selectedVoicePreset.style, speed: selectedVoicePreset.speed } : undefined);
    const result = await generateTTS({ provider: ttsProvider, voice: ttsVoice, text: textForTTS, scriptMode, voiceSettings });
    if (result) { playTTS(); toast.success('TTS generated!'); }
  };

  const handleSaveTTSAsVoiceover = () => {
    const originalScript = scriptContent;
    const enhancedScript = cleanTTSContent || enhancedContent;
    const scriptMeta = { originalScript, scriptText: enhancedScript || originalScript, scriptType: scriptType as string };
    if (ttsResult?.audioUrl) {
      const voiceoverName = `${scriptName || 'Script'} - ${activeVersion === 'enhanced' ? 'Enhanced' : 'Original'} TTS`;
      onSaveVoiceover(ttsResult.audioUrl, voiceoverName, selectedScriptId || undefined, ttsResult.audioBlob || undefined, scriptMeta);
      if (selectedScriptId) onUpdateScript(selectedScriptId, { hasVoiceover: true });
    }
  };

  const handleTTSScriptSelect = (scriptId: string) => {
    setSelectedTTSScriptId(scriptId);
    const script = savedScripts.find(s => s.id === scriptId);
    if (script) {
      setScriptContent(script.content);
      setScriptName(script.name);
      unifiedEditor.updateScene(sceneId, {
        originalContent: script.content,
        enhancedContent: script.enhancedContent || null,
        cleanContent: script.enhancedContent ? (script.cleanContent || null) : null,
        activeVersion: script.enhancedContent ? 'enhanced' : 'original',
      });
    }
  };

  // Analysis panel handlers
  const handleApplyAnalysisFix = (originalText: string, suggestedText: string) => {
    const newContent = scriptContent.replace(originalText, suggestedText);
    setScriptContent(newContent);
    toast.success('Applied fix to script');
  };

  const handleUpdateRecommendation = (recId: string, accepted: boolean) => {
    if (analysisResult) {
      unifiedEditor.setAnalysisResult(sceneId, {
        ...analysisResult,
        recommendations: analysisResult.recommendations.map(r => r.id === recId ? { ...r, accepted } : r),
      });
    }
    if (accepted) toast.info('Edit mode: Make changes in the script editor');
  };

  const handleNoteAll = () => {
    if (analysisResult) {
      unifiedEditor.setAnalysisResult(sceneId, {
        ...analysisResult,
        recommendations: analysisResult.recommendations.map(r => ({ ...r, accepted: true })),
      });
    }
  };

  // Enhancement inline edit handlers
  const handleStartEdit = (changeId: string, enhancedText: string) => {
    setEditingChangeId(changeId);
    setEditedEnhancedText(enhancedText);
  };

  const handleCancelEdit = () => { setEditingChangeId(null); setEditedEnhancedText(''); };

  const handleSaveEdit = (changeId: string, original: string, editedText: string) => {
    if (original && editedText) {
      const newContent = scriptContent.replace(original, editedText);
      if (newContent !== scriptContent) { setScriptContent(newContent); toast.success('Applied edited change'); }
    }
    setEditingChangeId(null);
    setEditedEnhancedText('');
    handleAcceptChange(changeId);
  };

  const handleApplyEnhancementChange = (original: string, enhanced: string) => {
    const newContent = scriptContent.replace(original, enhanced);
    if (newContent !== scriptContent) { setScriptContent(newContent); toast.success('Applied fix to script'); }
  };

  // Version history handlers — routes through unified editor
  const addVersionEntry = useCallback((_content: string, type: ScriptVersionEntry['versionType'], summary: string) => {
    // Map ScriptVersionEntry versionType → VersionHistoryEntry source
    const sourceMap: Record<ScriptVersionEntry['versionType'], 'manual' | 'ai_enhance' | 'ai_analysis' | 'transcreation' | 'import'> = {
      original: 'manual',
      manual_edit: 'manual',
      enhanced: 'ai_enhance',
      transcreation: 'transcreation',
    };
    unifiedEditor.addVersionHistoryEntry(sceneId, sourceMap[type] || 'manual', summary);
  }, [sceneId, unifiedEditor]);

  const handleRestoreVersion = useCallback((version: ScriptVersionEntry) => {
    setScriptContent(version.content);
    unifiedEditor.updateScene(sceneId, {
      activeVersion: 'original',
      ...(version.enhancedContent ? { enhancedContent: version.enhancedContent } : {}),
    });
    addVersionEntry(version.content, 'manual_edit', `Restored from v${version.versionNumber}`);
    toast.success(`Restored to version ${version.versionNumber}`);
  }, [addVersionEntry, sceneId, unifiedEditor]);

  // Track version on save
  const handleSaveScriptWithVersion = () => {
    handleSaveScript();
    addVersionEntry(scriptContent, enhancedContent ? 'enhanced' : 'original', `Saved: ${scriptName}`);
  };

  // Transcreation handler
  const handleApplyTranscreation = (transcreatedText: string, languageCode: string) => {
    addVersionEntry(transcreatedText, 'transcreation', `Transcreated to ${languageCode}`);
    toast.success(`Saved ${languageCode} transcreation as version`);
  };

  // ════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* Enrichment status */}
      <div className="flex items-center justify-end">
        <EnrichmentStatusBadge status={enrichmentStatus} isLoading={enrichmentLoading} isAvailable={enrichmentAvailable} productName={enrichmentProductName} compact />
      </div>

      {/* Show Linking Card */}
      {availableShows.length > 0 && (
        <Card className="border-border/50 bg-gradient-to-r from-indigo-500/5 to-violet-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Link to Production</Label>
                  <p className="text-xs text-muted-foreground">
                    {isPodcastMode ? 'Podcast mode: TTS disabled (live recording)' : 'Script linked to production pipeline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={linkedShowId || ''} onValueChange={(v) => { const newId = v || null; setLinkedShowId(newId); onShowSelect?.(newId); }}>
                  <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select a production..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No production linked</SelectItem>
                    {availableShows.map(show => (
                      <SelectItem key={show.id} value={show.id}>
                        <span className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] capitalize">{show.show_type}</Badge>
                          {show.title}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {linkedShowId && (
                  <Button variant="ghost" size="sm" onClick={() => { setLinkedShowId(null); onShowSelect?.(null); }}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {isPodcastMode && (
              <div className="mt-3 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  <strong>Podcast/Interview Mode:</strong> TTS voiceover is disabled for live recording formats.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Script Editor Card */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardContent className="p-6">
          {/* Header + New/Upload */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Script Editor</h2>
                <p className="text-sm text-muted-foreground">
                  {isPodcastMode ? 'Create scripts for your podcast/interview' : 'Create, analyze, and enhance your scripts'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleNewScript} variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" />New Script</Button>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" disabled={isUploadingScript}>
                {isUploadingScript ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Upload Script
              </Button>
              <input ref={fileInputRef} type="file" accept=".txt,.md,text/plain" onChange={handleScriptFileUpload} className="hidden" />
            </div>
          </div>

          {/* Script Library Tabs */}
          <Tabs defaultValue="video" className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium">Script Library</Label>
              <TabsList level="child">
                <TabsTrigger value="video" level="child"><Video className="h-4 w-4 mr-2 text-red-500" />Video ({videoScripts.length})</TabsTrigger>
                <TabsTrigger value="audio" level="child"><Mic className="h-4 w-4 mr-2 text-purple-500" />Audio ({audioScripts.length})</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="video" className="mt-0">
              <ScriptListGrid scripts={videoScripts} selectedId={selectedScriptId} onSelect={handleSelectScript} onDelete={onDeleteScript} type="video" />
            </TabsContent>
            <TabsContent value="audio" className="mt-0">
              <ScriptListGrid scripts={audioScripts} selectedId={selectedScriptId} onSelect={handleSelectScript} onDelete={onDeleteScript} type="audio" />
            </TabsContent>
          </Tabs>

          {/* Resume Draft Banner */}
          {hasDraft && selectedScriptId && (
            <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Edit3 className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium text-amber-700">Draft in Progress</p>
                  <p className="text-sm text-muted-foreground">You have unsaved enhancement changes</p>
                </div>
              </div>
              <Button onClick={handleResumeDraft} size="sm" className="bg-amber-500 hover:bg-amber-600">Resume Review</Button>
            </div>
          )}

          {/* Stats Bar */}
          <ScriptStatsBar stats={stats} />

          {/* AI Provider Selector */}
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-border/50">
            <Label className="text-sm font-medium whitespace-nowrap">AI Provider:</Label>
            <Select value={aiProvider} onValueChange={onAiProviderChange}>
              <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini"><div className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-gradient-to-br from-blue-500 to-green-500" /><span>Google Gemini</span></div></SelectItem>
                <SelectItem value="openai"><div className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-gradient-to-br from-green-600 to-teal-500" /><span>OpenAI GPT</span></div></SelectItem>
                <SelectItem value="claude"><div className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-gradient-to-br from-orange-500 to-amber-500" /><span>Anthropic Claude</span></div></SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              {aiProvider === 'gemini' && 'Fast & balanced analysis'}
              {aiProvider === 'openai' && 'Advanced reasoning'}
              {aiProvider === 'claude' && 'Nuanced writing improvements'}
            </span>
          </div>

          {/* Action Buttons Grid - Row 1: Core */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            <ActionButton icon={<Search className="h-6 w-6 mx-auto mb-2 text-blue-500" />} isActive={isAnalyzing} activeColor="blue" label="AI Analyze" sublabel="Recommendations" onClick={handleAnalyze} />
            <ActionButton icon={<Sparkles className="h-6 w-6 mx-auto mb-2 text-purple-500" />} isActive={isEnhancing} activeColor="purple" label="AI Enhance" sublabel="Customize & improve" onClick={openEnhancementDialog} />
            {isTTSEnabled ? (
              <ActionButton icon={<Volume2 className="h-6 w-6 mx-auto mb-2 text-green-500" />} isActive={isTTSGenerating} activeColor="green" label="Generate TTS" sublabel="Full script audio" onClick={() => setShowTTSOptions(!showTTSOptions)} />
            ) : (
              <div className="p-4 rounded-lg border bg-muted/30 border-border/30 text-center opacity-50 cursor-not-allowed" title="TTS not available for podcast/interview formats">
                <Volume2 className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">TTS Disabled</span>
                <p className="text-xs text-muted-foreground mt-1">Podcast mode</p>
              </div>
            )}
            <ActionButton icon={<Save className="h-6 w-6 mx-auto mb-2 text-primary" />} isActive={false} activeColor="primary" label="Save Script" sublabel="Store to library" onClick={handleSaveScriptWithVersion} />
          </div>
          {/* Action Buttons Grid - Row 2: Extended */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <ActionButton icon={<Globe className="h-6 w-6 mx-auto mb-2 text-cyan-500" />} isActive={false} activeColor="cyan" label="Transcreation" sublabel="Regional adaptation" onClick={() => setShowTranscreation(!showTranscreation)} />
            <ActionButton icon={<Shield className="h-6 w-6 mx-auto mb-2 text-emerald-500" />} isActive={false} activeColor="emerald" label="Brand Voice" sublabel="Compliance check" onClick={() => setShowBrandVoice(!showBrandVoice)} />
            <ActionButton icon={<History className="h-6 w-6 mx-auto mb-2 text-indigo-500" />} isActive={false} activeColor="indigo" label="Version History" sublabel={`${scriptVersions.length} versions`} onClick={() => setShowVersionHistory(!showVersionHistory)} />
          </div>

          {/* TTS Options Panel */}
          {isTTSEnabled && (
            <TTSOptionsPanel
              isOpen={showTTSOptions}
              onOpenChange={setShowTTSOptions}
              ttsProvider={ttsProvider}
              onProviderChange={onTtsProviderChange}
              ttsVoice={ttsVoice}
              onVoiceChange={onTtsVoiceChange}
              isTTSGenerating={isTTSGenerating}
              currentContent={currentContent}
              onGenerateTTS={handleGenerateTTS}
              ttsResult={ttsResult}
              onPlay={playTTS}
              onDownload={() => downloadTTS()}
              onSaveAsVoiceover={handleSaveTTSAsVoiceover}
              savedScripts={savedScripts}
              selectedTTSScriptId={selectedTTSScriptId}
              selectedScriptId={selectedScriptId}
              onTTSScriptSelect={handleTTSScriptSelect}
              enhancedContent={enhancedContent}
              activeVersion={activeVersion}
              onVersionChange={(v: 'original' | 'enhanced') => unifiedEditor.updateScene(sceneId, { activeVersion: v })}
              originalStats={originalStats}
              enhancedStats={enhancedStats}
              stats={stats}
              openaiVoices={OPENAI_VOICES}
              elevenlabsVoices={ELEVENLABS_VOICES}
              googleVoices={GOOGLE_VOICES}
            />
          )}

          {/* Progressive Analysis Overlay */}
          <ProgressiveAnalysisOverlay steps={analysisSteps} isVisible={showProgressiveAnalysis && isAnalyzing} />

          {/* Analysis Results */}
          {showAnalysis && analysisResult && (
            <AnalysisResultsPanel
              analysisResult={analysisResult}
              isAnalyzing={isAnalyzing}
              onReAnalyze={handleAnalyze}
              onClose={() => setShowAnalysis(false)}
              onApplyFix={handleApplyAnalysisFix}
              onUpdateRecommendation={handleUpdateRecommendation}
              onNoteAll={handleNoteAll}
            />
          )}

          {/* Enhancement Review */}
          {showEnhancementReview && enhancedContent && (
            <EnhancementReviewPanel
              enhancedContent={enhancedContent}
              originalContent={originalContent}
              enhancementChanges={enhancementChanges}
              reviewProgress={reviewProgress}
              engagementScore={engagementScore}
              enhancementMarkers={enhancementMarkers}
              originalStats={originalStats}
              enhancedStats={enhancedStats}
              isEnhancing={isEnhancing}
              isSavingDraft={isSavingDraft}
              editingChangeId={editingChangeId}
              editedEnhancedText={editedEnhancedText}
              onAcceptChange={handleAcceptChange}
              onSkipChange={handleSkipChange}
              onAcceptAll={handleAcceptAll}
              onSkipAll={handleSkipAll}
              onCompleteEnhancement={handleCompleteEnhancement}
              onSaveDraft={handleSaveDraft}
              onClose={() => setShowEnhancementReview(false)}
              onRequestNewEnhancement={openEnhancementDialog}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              onSetEditedText={setEditedEnhancedText}
              onApplyChange={handleApplyEnhancementChange}
            />
          )}

          {/* Transcreation Preview */}
          <TranscreationPreview
            originalScript={currentContent}
            scriptName={scriptName || 'Script'}
            isVisible={showTranscreation}
            onClose={() => setShowTranscreation(false)}
            onApplyTranscreation={handleApplyTranscreation}
          />

          {/* Brand Voice Checker */}
          <BrandVoiceChecker
            scriptContent={currentContent}
            isVisible={showBrandVoice}
            onClose={() => setShowBrandVoice(false)}
            onApplyFix={handleApplyAnalysisFix}
          />

          {/* Version History */}
          <VersionHistoryPanel
            isVisible={showVersionHistory}
            onClose={() => setShowVersionHistory(false)}
            versions={scriptVersions}
            currentContent={currentContent}
            onRestoreVersion={handleRestoreVersion}
            onSaveVersion={addVersionEntry}
          />

          {/* Revert Option */}
          {originalContent && activeVersion === 'enhanced' && !showEnhancementReview && (
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-500/10 text-purple-600">
                <Sparkles className="h-3 w-3 mr-1" />Enhanced Version Active
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleRevertToOriginal}>
                <RotateCcw className="h-4 w-4 mr-1" />Revert to Original
              </Button>
            </div>
          )}

          {/* Script Editor Form */}
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="script-name">Script Name *</Label>
                <Input id="script-name" value={scriptName} onChange={(e) => setScriptName(e.target.value)} placeholder="Enter script name..." className="mt-1" />
              </div>
              <div>
                <Label>Script Type</Label>
                <Select value={scriptType} onValueChange={(v: 'video' | 'audio') => setScriptType(v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video"><div className="flex items-center gap-2"><Video className="h-4 w-4 text-red-500" />Video Script</div></SelectItem>
                    <SelectItem value="audio"><div className="flex items-center gap-2"><Mic className="h-4 w-4 text-purple-500" />Audio Script</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Script Mode</Label>
                <Select value={scriptMode} onValueChange={(v: ScriptMode) => setScriptMode(v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SCRIPT_MODES.map((mode) => (
                      <SelectItem key={mode.id} value={mode.id}>
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{mode.label}</span>
                          {!mode.ttsEnabled && <Badge variant="outline" className="text-[10px] ml-1">No TTS</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Chapter/Scene Mode Toggle */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/50">
              <Label className="text-sm font-medium whitespace-nowrap">Editing Mode:</Label>
              <div className="flex items-center gap-0.5 border rounded-md p-0.5">
                <Button
                  variant={!chapterModeEnabled ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs px-3"
                  onClick={() => setChapterModeEnabled(false)}
                >
                  Single Script
                </Button>
                <Button
                  variant={chapterModeEnabled ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs px-3"
                  onClick={() => setChapterModeEnabled(true)}
                >
                  Chapters / Scenes
                </Button>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {chapterModeEnabled
                  ? 'Multi-scene editing — podcast segments, webcast chapters, video scenes'
                  : 'Single continuous script — quick editing for simple content'}
              </span>
            </div>

            {/* Script Content — Single mode or Chapter mode */}
            {chapterModeEnabled ? (
              /* Multi-scene mode — shared panel with Cast */
              <UnifiedScriptPanel
                editor={unifiedEditor}
                showVisualPrompt={scriptType === 'video'}
                renderActions={(scene) => (
                  <div className="flex items-center gap-2">
                    {isTTSEnabled && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1"
                        onClick={() => {
                          const textForTTS = scene.activeVersion === 'enhanced' && scene.enhancedContent
                            ? scene.enhancedContent
                            : scene.content;
                          if (!textForTTS.trim()) { toast.error('No content to generate TTS'); return; }
                          generateTTS({ provider: ttsProvider, voice: ttsVoice, text: textForTTS, scriptMode });
                          toast.info(`Generating TTS for "${scene.title}"...`);
                        }}
                      >
                        <Volume2 className="h-3 w-3" /> Generate TTS
                      </Button>
                    )}
                    {scene.status !== 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1 text-green-600"
                        onClick={() => unifiedEditor.approveScene(scene.id)}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                )}
              />
            ) : (
              /* Single-script mode — existing textarea editor */
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="script-content">Script Content</Label>
                  {enhancedContent && (
                    <div className="flex gap-2">
                      <Button variant={activeVersion === 'original' ? 'secondary' : 'ghost'} size="sm" onClick={() => unifiedEditor.updateScene(sceneId, { activeVersion: 'original' })}>Original</Button>
                      <Button variant={activeVersion === 'enhanced' ? 'secondary' : 'ghost'} size="sm" onClick={() => unifiedEditor.updateScene(sceneId, { activeVersion: 'enhanced' })}>
                        <Sparkles className="h-3 w-3 mr-1" />Enhanced
                      </Button>
                    </div>
                  )}
                </div>
                <ScriptModeToolbar
                  mode={scriptMode}
                  onInsert={(marker) => {
                    const textarea = textareaRef.current;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = activeVersion === 'enhanced' && enhancedContent ? enhancedContent : scriptContent;
                      const newText = text.slice(0, start) + marker + text.slice(end);
                      if (activeVersion === 'enhanced') unifiedEditor.updateScene(sceneId, { enhancedContent: newText });
                      else setScriptContent(newText);
                      setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + marker.length, start + marker.length); }, 0);
                    }
                  }}
                  disabled={!scriptContent.trim() && !enhancedContent}
                />
                <Textarea
                  ref={textareaRef}
                  id="script-content"
                  value={activeVersion === 'enhanced' && enhancedContent ? enhancedContent : scriptContent}
                  onChange={(e) => { if (activeVersion === 'enhanced') unifiedEditor.updateScene(sceneId, { enhancedContent: e.target.value }); else setScriptContent(e.target.value); }}
                  placeholder="Start writing your script here..."
                  className="mt-1 min-h-[300px] font-mono text-sm"
                />
              </div>
            )}

            {/* Bottom Action Bar */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAnalyze} disabled={isAnalyzing || !scriptContent.trim()} variant="outline">
                {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}Analyze
              </Button>
              <Button onClick={openEnhancementDialog} disabled={isEnhancing || !scriptContent.trim()} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {isEnhancing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}AI Enhance
              </Button>
              <Button variant="outline" onClick={() => navigator.clipboard.writeText(currentContent)} disabled={!currentContent.trim()}>
                <Copy className="h-4 w-4 mr-2" />Copy
              </Button>
              <div className="flex-1" />
              <Button onClick={handleSaveScript} disabled={!scriptContent.trim() || !scriptName.trim()}>
                <Save className="h-4 w-4 mr-2" />Save Script
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Scripts Grid */}
      {savedScripts.length > 0 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Saved Scripts ({savedScripts.length})
            </h3>
            <Tabs defaultValue="video" className="w-full">
              <TabsList level="child" className="mb-4">
                <TabsTrigger value="video" level="child"><Video className="h-4 w-4 mr-2 text-red-500" />Video ({videoScripts.length})</TabsTrigger>
                <TabsTrigger value="audio" level="child"><Mic className="h-4 w-4 mr-2 text-purple-500" />Audio ({audioScripts.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="video" level="child" className="mt-0 p-0 border-0 shadow-none bg-transparent">
                {videoScripts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No video scripts saved yet</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {videoScripts.map(script => {
                      const voiceover = savedVoiceovers.find(v => v.scriptId === script.id);
                      return <SavedScriptCard key={script.id} script={script} isSelected={selectedScriptId === script.id} onSelect={() => handleSelectScript(script.id)} onDelete={() => onDeleteScript(script.id)} voiceoverUrl={voiceover?.url} />;
                    })}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="audio" level="child" className="mt-0 p-0 border-0 shadow-none bg-transparent">
                {audioScripts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No audio scripts saved yet</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {audioScripts.map(script => {
                      const voiceover = savedVoiceovers.find(v => v.scriptId === script.id);
                      return <SavedScriptCard key={script.id} script={script} isSelected={selectedScriptId === script.id} onSelect={() => handleSelectScript(script.id)} onDelete={() => onDeleteScript(script.id)} voiceoverUrl={voiceover?.url} />;
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Enhancement Dialog */}
      <EnhancementDialog
        open={showEnhancementDialog}
        onOpenChange={setShowEnhancementDialog}
        enhancementFocus={enhancementFocus}
        onFocusChange={onEnhancementFocusChange}
        customInstructions={customEnhancementInstructions}
        onCustomInstructionsChange={setCustomEnhancementInstructions}
        onQuickEnhance={() => { setCustomEnhancementInstructions(''); unifiedEditor.setEnhancementFocus('balanced'); handleEnhance(false); }}
        onEnhanceWithSettings={() => handleEnhance(true)}
        isEnhancing={isEnhancing}
      />
    </div>
  );
}

// ═══════════════════════════════════
// INTERNAL HELPER COMPONENTS
// ═══════════════════════════════════

/** Inline script list for the library tabs */
function ScriptListGrid({ scripts, selectedId, onSelect, onDelete, type }: {
  scripts: SavedScript[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  type: 'video' | 'audio';
}) {
  const Icon = type === 'video' ? Video : Mic;
  const color = type === 'video' ? 'red' : 'purple';
  const gradientFrom = type === 'video' ? 'from-red-500' : 'from-purple-500';
  const gradientTo = type === 'video' ? 'to-orange-500' : 'to-pink-500';

  if (scripts.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg bg-muted/30">
        <Icon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No {type} scripts yet</p>
        <p className="text-xs text-muted-foreground">Create or upload a {type} script to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-2">
      {scripts.map(script => (
        <div
          key={script.id}
          onClick={() => onSelect(script.id)}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
            selectedId === script.id
              ? `border-${color}-500/50 bg-${color}-500/5`
              : `border-border/50 hover:border-${color}-500/30 hover:bg-muted/50`
          )}
        >
          <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center shrink-0`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{script.name}</p>
            <p className="text-xs text-muted-foreground">
              {script.stats?.wordCount || (script.content?.split(/\s+/).length ?? 0)} words
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {script.enhancedContent && (
              <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/30">Enhanced</Badge>
            )}
            {script.draftStatus === 'in_progress' && (
              <Badge variant="secondary" className="text-xs">Draft</Badge>
            )}
            {script.hasVoiceover && (
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                <Volume2 className="h-3 w-3" />
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); onDelete(script.id); }}>
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      ))}
    </div>
  );
}

/** Reusable action button for the 4-button grid */
function ActionButton({ icon, isActive, activeColor, label, sublabel, onClick }: {
  icon: React.ReactNode;
  isActive: boolean;
  activeColor: string;
  label: string;
  sublabel: string;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg border cursor-pointer transition-all text-center",
        isActive ? `bg-${activeColor}-500/10 border-${activeColor}-500/50` : `bg-muted/50 border-border/50 hover:border-${activeColor}-500/50`
      )}
      onClick={onClick}
    >
      {isActive ? <Loader2 className={`h-6 w-6 mx-auto mb-2 text-${activeColor}-500 animate-spin`} /> : icon}
      <span className="text-sm font-medium">{label}</span>
      <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
    </div>
  );
}
