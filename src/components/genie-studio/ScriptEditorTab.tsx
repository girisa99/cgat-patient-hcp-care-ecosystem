/**
 * Comprehensive Script Editor Tab for GenieStudio
 * Full workflow: selection, analysis, enhancement, review, draft saving, TTS generation
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  FileText,
  Video,
  Mic,
  Search,
  Wand2,
  Sparkles,
  Volume2,
  Play,
  Pause,
  Download,
  Save,
  Check,
  X,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  Loader2,
  Copy,
  BookOpen,
  Trash2,
  Plus,
  Edit3,
  FileCheck,
  Upload,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTTSGeneration, OPENAI_VOICES, ELEVENLABS_VOICES, GOOGLE_VOICES } from '@/components/document-processing/RecordingStudio/hooks/useTTSGeneration';
import { ScriptModeToolbar } from './ScriptModeToolbar';
import { VoiceSelector } from './VoiceSelector';
import { RecordingLayoutPreview } from './RecordingLayoutPreview';
import { SCRIPT_MODES, type ScriptMode } from '@/types/projects';
import { SCRIPT_MODE_CONFIGS, getVoiceSettingsForMode, type VoicePreset } from '@/config/scriptModePresets';

// Types
export type ScriptPurpose = 'video' | 'audio' | 'podcast' | 'webcast' | 'interview' | 'panel' | 'tutorial';

export interface SavedScript {
  id: string;
  name: string;
  content: string;
  type: 'video' | 'audio';
  purpose?: ScriptPurpose; // New: specific purpose/show type
  showId?: string; // New: linked show ID
  showTitle?: string; // New: linked show title
  createdAt: number;
  updatedAt: number;
  enhancedContent?: string;
  cleanContent?: string; // For TTS
  draftContent?: string;
  draftStatus?: 'in_progress' | 'completed';
  draftChanges?: EnhancementChange[];
  stats?: ScriptStats;
  hasVoiceover?: boolean;
  voiceoverId?: string;
}

interface ScriptStats {
  wordCount: number;
  sentenceCount: number;
  characterCount: number;
  estimatedReadingMinutes: number;
  estimatedSpeakingMinutes: number;
  readabilityScore: 'easy' | 'moderate' | 'difficult';
}

interface AnalysisRecommendation {
  id: string;
  type: 'pacing' | 'clarity' | 'engagement' | 'length' | 'readability' | 'pause' | 'break' | 'section';
  severity: 'info' | 'warning' | 'suggestion';
  title: string;
  description: string;
  originalText?: string;
  suggestedText?: string;
  location?: string;
  accepted: boolean | null;
}

interface PauseOpportunity {
  afterText: string;
  reason: string;
}

interface SectionBreak {
  beforeText: string;
  sectionTitle: string;
}

interface OverallAssessment {
  strengths: string[];
  weaknesses: string[];
  voiceoverReadiness: 'ready' | 'needs_minor_edits' | 'needs_significant_work';
  engagementScore?: number;
  topPriority?: string;
}

interface EngagementAnalysis {
  openingHook?: { present: boolean; quality: 'weak' | 'moderate' | 'strong'; suggestion?: string };
  audienceConnection?: { score: number; uses_you: boolean; uses_questions: boolean; suggestions?: string[] };
  callToAction?: { present: boolean; clarity: 'weak' | 'moderate' | 'strong'; suggestion?: string };
  emotionalResonance?: { score: number; powerWords: number; suggestions?: string[] };
}

interface EnhancementChange {
  id: string;
  type: 'modification' | 'addition' | 'removal' | 'formatting' | 'pause' | 'break' | 'pacing' | 'engagement' | 'conversational' | 'hook' | 'transition' | 'cta';
  original: string;
  enhanced: string;
  reason: string;
  accepted: boolean | null;
  position?: string;
}

interface EnhancementMarkers {
  pausesAdded: number;
  sectionBreaksAdded: number;
  sentencesRewritten: number;
  engagementHooksAdded?: number;
  conversationalChanges?: number;
}

interface EngagementScore {
  before: number;
  after: number;
  improvements: string[];
}

// Show info for linking scripts to productions
export interface ShowInfo {
  id: string;
  title: string;
  show_type: 'podcast' | 'webcast' | 'interview' | 'panel' | 'tutorial' | 'other';
  current_stage: string;
}

interface ScriptEditorTabProps {
  savedScripts: SavedScript[];
  onSaveScript: (script: SavedScript) => void;
  onDeleteScript: (id: string) => void;
  onUpdateScript: (id: string, updates: Partial<SavedScript>) => void;
  onSaveVoiceover: (url: string, name: string, scriptId?: string) => void;
  savedVoiceovers: Array<{ id: string; name: string; url?: string; scriptId?: string }>;
  // New props for show integration
  availableShows?: ShowInfo[];
  selectedShowId?: string;
  onShowSelect?: (showId: string | null) => void;
}

// Calculate reading stats
function calculateStats(content: string): ScriptStats {
  const words = content.trim().split(/\s+/).filter(w => w.length > 0);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  
  const readingWPM = 200; // Average reading speed
  const speakingWPM = 130; // Average speaking speed for voiceover
  
  let readability: 'easy' | 'moderate' | 'difficult' = 'moderate';
  if (avgWordsPerSentence < 12) readability = 'easy';
  else if (avgWordsPerSentence > 20) readability = 'difficult';
  
  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    characterCount: content.length,
    estimatedReadingMinutes: Math.ceil(words.length / readingWPM),
    estimatedSpeakingMinutes: Math.ceil(words.length / speakingWPM),
    readabilityScore: readability
  };
}

export function ScriptEditorTab({
  savedScripts,
  onSaveScript,
  onDeleteScript,
  onUpdateScript,
  onSaveVoiceover,
  savedVoiceovers,
  availableShows = [],
  selectedShowId,
  onShowSelect
}: ScriptEditorTabProps) {
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Show Selection State
  const [linkedShowId, setLinkedShowId] = useState<string | null>(selectedShowId || null);
  const selectedShow = availableShows.find(s => s.id === linkedShowId);
  
  // Determine if TTS should be available based on show type
  // Podcasts: NO TTS (live recording with hosts)
  // Webcasts: TTS available for preview/rehearsal
  // Videos: TTS available
  const showType = selectedShow?.show_type;
  const isTTSEnabled = !showType || showType === 'webcast' || showType === 'tutorial' || showType === 'other';
  const isPodcastMode = showType === 'podcast' || showType === 'interview' || showType === 'panel';
  
  // Script Selection & Content State
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [scriptName, setScriptName] = useState('');
  const [scriptContent, setScriptContent] = useState('');
  const [scriptType, setScriptType] = useState<'video' | 'audio'>('video');
  const [scriptMode, setScriptMode] = useState<ScriptMode>('video');
  const [scriptPurpose, setScriptPurpose] = useState<ScriptPurpose>('video');
  const [isNewScript, setIsNewScript] = useState(true);
  const [isUploadingScript, setIsUploadingScript] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  // Enhanced Content State
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [enhancedContent, setEnhancedContent] = useState<string | null>(null);
  const [cleanTTSContent, setCleanTTSContent] = useState<string | null>(null);
  const [activeVersion, setActiveVersion] = useState<'original' | 'enhanced'>('original');
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    stats: ScriptStats;
    recommendations: AnalysisRecommendation[];
    pauseOpportunities?: PauseOpportunity[];
    sectionBreaks?: SectionBreak[];
    overallAssessment?: OverallAssessment;
    engagementAnalysis?: EngagementAnalysis;
  } | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Enhancement markers and engagement score for summary
  const [enhancementMarkers, setEnhancementMarkers] = useState<EnhancementMarkers | null>(null);
  const [engagementScore, setEngagementScore] = useState<EngagementScore | null>(null);
  
  // Enhancement State
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementChanges, setEnhancementChanges] = useState<EnhancementChange[]>([]);
  const [showEnhancementReview, setShowEnhancementReview] = useState(false);
  const [reviewProgress, setReviewProgress] = useState(0);
  
  // Custom Enhancement Instructions State
  const [showEnhancementDialog, setShowEnhancementDialog] = useState(false);
  const [customEnhancementInstructions, setCustomEnhancementInstructions] = useState('');
  const [enhancementFocus, setEnhancementFocus] = useState<'engagement' | 'clarity' | 'pacing' | 'conversational' | 'balanced' | 'humor'>('balanced');
  
  // Progressive Analysis State - Step by step walkthrough
  const [analysisSteps, setAnalysisSteps] = useState<{
    step: string;
    status: 'pending' | 'running' | 'complete';
    detail?: string;
  }[]>([]);
  const [showProgressiveAnalysis, setShowProgressiveAnalysis] = useState(false);
  
  // Draft State
  const [hasDraft, setHasDraft] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastDraftSave, setLastDraftSave] = useState<Date | null>(null);
  
  // TTS State
  const [showTTSOptions, setShowTTSOptions] = useState(false);
  const [ttsProvider, setTtsProvider] = useState<'openai' | 'elevenlabs' | 'google'>('elevenlabs');
  const [ttsVoice, setTtsVoice] = useState('');
  const [selectedTTSScriptId, setSelectedTTSScriptId] = useState<string | null>(null);
  
  // Mode-aware voice settings
  const [selectedVoicePreset, setSelectedVoicePreset] = useState<VoicePreset | null>(null);
  const [customVoiceSettings, setCustomVoiceSettings] = useState<{
    stability: number;
    similarityBoost: number;
    style: number;
    speed: number;
  } | undefined>(undefined);
  
  // AI Provider State for Script Analysis/Enhancement
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'claude'>('gemini');
  
  const {
    isGenerating: isTTSGenerating,
    lastResult: ttsResult,
    generate: generateTTS,
    play: playTTS,
    stop: stopTTS,
    download: downloadTTS
  } = useTTSGeneration();
  
  // Computed stats
  const currentContent = activeVersion === 'enhanced' && enhancedContent ? enhancedContent : scriptContent;
  const stats = calculateStats(currentContent);
  const originalStats = originalContent ? calculateStats(originalContent) : null;
  const enhancedStats = enhancedContent ? calculateStats(enhancedContent) : null;
  
  // Filter scripts by type
  const videoScripts = savedScripts.filter(s => s.type === 'video');
  const audioScripts = savedScripts.filter(s => s.type === 'audio');
  
  // Load script when selected
  const handleSelectScript = useCallback((scriptId: string) => {
    const script = savedScripts.find(s => s.id === scriptId);
    if (script) {
      setSelectedScriptId(scriptId);
      setScriptName(script.name);
      setScriptContent(script.content);
      setScriptType(script.type);
      setIsNewScript(false);
      setOriginalContent(script.content);
      
      // Check for enhanced version
      if (script.enhancedContent) {
        setEnhancedContent(script.enhancedContent);
        setCleanTTSContent(script.cleanContent || null);
      } else {
        setEnhancedContent(null);
        setCleanTTSContent(null);
      }
      
      // Check for draft
      if (script.draftStatus === 'in_progress' && script.draftContent) {
        setHasDraft(true);
        toast.info('Draft found! You can continue reviewing from where you left off.');
      } else {
        setHasDraft(false);
      }
      
      // Reset review states
      setShowAnalysis(false);
      setShowEnhancementReview(false);
      setActiveVersion(script.enhancedContent ? 'enhanced' : 'original');
      
      toast.success(`Loaded "${script.name}"`);
    }
  }, [savedScripts]);
  
  // Start new script
  const handleNewScript = () => {
    setSelectedScriptId(null);
    setScriptName('');
    setScriptContent('');
    setIsNewScript(true);
    setOriginalContent(null);
    setEnhancedContent(null);
    setCleanTTSContent(null);
    setActiveVersion('original');
    setShowAnalysis(false);
    setShowEnhancementReview(false);
    setHasDraft(false);
    setAnalysisResult(null);
    setEnhancementChanges([]);
  };
  
  // Handle script file upload (.txt, .md)
  const handleScriptFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validExtensions = ['.txt', '.md'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidExtension && file.type !== 'text/plain') {
      toast.error('Please upload a .txt or .md file');
      return;
    }
    
    // Validate file size (max 5MB)
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
      setOriginalContent(content);
      setIsNewScript(true);
      setSelectedScriptId(null);
      setEnhancedContent(null);
      setCleanTTSContent(null);
      
      toast.success(`Loaded "${fileName}" - ${content.split(/\s+/).filter(w => w).length} words`);
    } catch (error) {
      console.error('Error reading script file:', error);
      toast.error('Failed to read file');
    } finally {
      setIsUploadingScript(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  }, []);
  
  // Set default TTS voice based on provider
  useEffect(() => {
    if (ttsProvider === 'openai') {
      setTtsVoice(OPENAI_VOICES[0]?.value || 'alloy');
    } else if (ttsProvider === 'google') {
      setTtsVoice(GOOGLE_VOICES[0]?.value || 'en-US-Neural2-D');
    } else {
      setTtsVoice(ELEVENLABS_VOICES[0]?.value || 'aria');
    }
  }, [ttsProvider]);
  
  // Update voice preset when script mode changes
  useEffect(() => {
    const modeConfig = SCRIPT_MODE_CONFIGS[scriptMode];
    if (modeConfig) {
      const defaultVoice = modeConfig.tts.defaultVoice;
      setSelectedVoicePreset(defaultVoice);
      setTtsVoice(defaultVoice.voiceName.toLowerCase());
      setTtsProvider(defaultVoice.provider);
      setCustomVoiceSettings({
        stability: defaultVoice.stability,
        similarityBoost: defaultVoice.similarityBoost,
        style: defaultVoice.style,
        speed: defaultVoice.speed,
      });
    }
  }, [scriptMode]);
  
  // Analysis steps for progressive walkthrough
  const ANALYSIS_STEPS = [
    { id: 'stats', label: 'Calculating word count & reading time', icon: 'BookOpen' },
    { id: 'readability', label: 'Analyzing readability & complexity', icon: 'Search' },
    { id: 'pacing', label: 'Checking pacing & natural pauses', icon: 'Clock' },
    { id: 'engagement', label: 'Evaluating audience engagement', icon: 'Sparkles' },
    { id: 'clarity', label: 'Reviewing clarity & structure', icon: 'FileCheck' },
    { id: 'ai', label: 'Getting AI recommendations', icon: 'Wand2' },
  ];
  
  // Progressive step update helper
  const updateStep = (stepId: string, status: 'pending' | 'running' | 'complete', detail?: string) => {
    setAnalysisSteps(prev => prev.map(s => 
      s.step === stepId ? { ...s, status, detail } : s
    ));
  };
  
  // Analyze Script with Progressive Walkthrough
  const handleAnalyze = async () => {
    if (!scriptContent.trim()) {
      toast.error('Please enter script content first');
      return;
    }
    
    setIsAnalyzing(true);
    setShowProgressiveAnalysis(true);
    
    // Initialize all steps as pending
    setAnalysisSteps(ANALYSIS_STEPS.map(s => ({ step: s.id, status: 'pending' as const })));
    
    const localRecommendations: AnalysisRecommendation[] = [];
    
    try {
      // Step 1: Calculate stats
      updateStep('stats', 'running');
      await new Promise(r => setTimeout(r, 400));
      const currentStats = calculateStats(scriptContent);
      updateStep('stats', 'complete', `${currentStats.wordCount} words, ${currentStats.estimatedSpeakingMinutes}min speaking time`);
      
      // Step 2: Readability analysis
      updateStep('readability', 'running');
      await new Promise(r => setTimeout(r, 500));
      if (currentStats.readabilityScore === 'difficult') {
        localRecommendations.push({
          id: 'rec-readability',
          type: 'readability',
          severity: 'warning',
          title: 'Complex sentences detected',
          description: 'Consider breaking long sentences into shorter ones for easier voiceover delivery.',
          accepted: null
        });
        updateStep('readability', 'complete', '⚠️ Complex sentences found');
      } else {
        updateStep('readability', 'complete', `✓ ${currentStats.readabilityScore} readability`);
      }
      
      // Step 3: Pacing check
      updateStep('pacing', 'running');
      await new Promise(r => setTimeout(r, 400));
      const hasPauses = scriptContent.includes('...') || scriptContent.includes('—') || scriptContent.includes('–');
      if (!hasPauses) {
        localRecommendations.push({
          id: 'rec-pacing',
          type: 'pacing',
          severity: 'suggestion',
          title: 'Consider adding natural pauses',
          description: 'Use "..." for pauses to give viewers time to absorb information.',
          accepted: null
        });
        updateStep('pacing', 'complete', '💡 No pause markers found');
      } else {
        updateStep('pacing', 'complete', '✓ Pause markers present');
      }
      
      // Step 4: Engagement analysis
      updateStep('engagement', 'running');
      await new Promise(r => setTimeout(r, 450));
      const hasQuestions = scriptContent.includes('?');
      const hasCallToAction = /\b(click|subscribe|sign up|get started|learn more|try|join)\b/i.test(scriptContent);
      if (!hasQuestions && !hasCallToAction) {
        localRecommendations.push({
          id: 'rec-engagement',
          type: 'engagement',
          severity: 'suggestion',
          title: 'Consider adding engagement hooks',
          description: 'Questions or calls-to-action can increase viewer engagement.',
          accepted: null
        });
        updateStep('engagement', 'complete', '💡 Could improve engagement');
      } else {
        updateStep('engagement', 'complete', '✓ Good engagement elements');
      }
      
      // Step 5: Clarity check
      updateStep('clarity', 'running');
      await new Promise(r => setTimeout(r, 400));
      if (currentStats.wordCount > 500) {
        localRecommendations.push({
          id: 'rec-length',
          type: 'length',
          severity: 'info',
          title: 'Script is quite long',
          description: `At ${currentStats.estimatedSpeakingMinutes} minutes, consider if this needs to be split into sections.`,
          accepted: null
        });
        updateStep('clarity', 'complete', `ℹ️ ${currentStats.estimatedSpeakingMinutes}min - consider sections`);
      } else {
        updateStep('clarity', 'complete', '✓ Good length for single segment');
      }
      
      // Step 6: AI recommendations
      updateStep('ai', 'running');
      const providerNames = { gemini: 'Gemini', openai: 'OpenAI', claude: 'Claude' };
      try {
        const { data, error } = await supabase.functions.invoke('enhance-script', {
          body: { scriptContent, mode: 'analyze', provider: aiProvider }
        });
        
        if (!error && data?.success && data.data) {
          const aiData = data.data;
          
          // Add AI recommendations
          if (aiData.recommendations) {
            const aiRecs = (aiData.recommendations || []).map((rec: any, i: number) => ({
              ...rec,
              id: `ai-rec-${i}`,
              accepted: null
            }));
            localRecommendations.push(...aiRecs);
          }
          
          // Capture all analysis data
          const pauseOpps = aiData.pauseOpportunities || [];
          const sectionBrks = aiData.sectionBreaks || [];
          const overallAssess = aiData.overallAssessment || null;
          const engagementAnalysis = aiData.engagementAnalysis || null;
          
          const engagementInfo = overallAssess?.engagementScore ? `, engagement: ${overallAssess.engagementScore}/10` : '';
          updateStep('ai', 'complete', `Found ${localRecommendations.length} suggestions${engagementInfo}`);
          
          // Set full analysis result with all data
          setAnalysisResult({
            stats: currentStats,
            recommendations: localRecommendations,
            pauseOpportunities: pauseOpps,
            sectionBreaks: sectionBrks,
            overallAssessment: overallAssess,
            engagementAnalysis: engagementAnalysis
          });
        } else {
          updateStep('ai', 'complete', `✓ ${providerNames[aiProvider]} analysis complete`);
          setAnalysisResult({
            stats: currentStats,
            recommendations: localRecommendations
          });
        }
      } catch (err) {
        console.log('AI analysis skipped:', err);
        updateStep('ai', 'complete', '✓ Using local analysis');
        setAnalysisResult({
          stats: currentStats,
          recommendations: localRecommendations
        });
      }
      
      // Show results
      setShowAnalysis(true);
      toast.success(`Analysis complete! Found ${localRecommendations.length} recommendations.`);
      
    } catch (err) {
      console.error('Analysis error:', err);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => {
        setShowProgressiveAnalysis(false);
      }, 1500);
    }
  };
  
  // Open enhancement dialog for customization
  const openEnhancementDialog = () => {
    if (!scriptContent.trim()) {
      toast.error('Please enter script content first');
      return;
    }
    setShowEnhancementDialog(true);
  };
  
  // Enhance Script with optional custom instructions
  const handleEnhance = async (useCustomInstructions = false) => {
    if (!scriptContent.trim()) {
      toast.error('Please enter script content first');
      return;
    }
    
    setShowEnhancementDialog(false);
    setIsEnhancing(true);
    const providerNames = { gemini: 'Gemini', openai: 'OpenAI', claude: 'Claude' };
    
    try {
      // Build enhancement request with optional customization
      const enhancementBody: any = { 
        scriptContent, 
        mode: 'enhance', 
        provider: aiProvider 
      };
      
      // Add customization if provided
      if (useCustomInstructions) {
        enhancementBody.focus = enhancementFocus;
        if (customEnhancementInstructions.trim()) {
          enhancementBody.customInstructions = customEnhancementInstructions.trim();
        }
      }
      
      const { data, error } = await supabase.functions.invoke('enhance-script', {
        body: enhancementBody
      });
      
      if (error) throw error;
      
      if (data?.success && data.data) {
        const enhanced = data.data.enhancedScript || '';
        const clean = data.data.cleanScript || enhanced.replace(/\.\.\./g, '. ').replace(/—/g, ', ').replace(/---/g, '');
        const changes = (data.data.changes || []).map((change: any, i: number) => ({
          ...change,
          id: `change-${i}`,
          accepted: null
        }));
        
        // Capture markers for summary
        const markers = data.data.markers || {
          pausesAdded: 0,
          sectionBreaksAdded: 0,
          sentencesRewritten: 0,
          engagementHooksAdded: 0,
          conversationalChanges: 0
        };
        
        // Capture engagement score if available
        const engScore = data.data.engagementScore || null;
        
        setOriginalContent(scriptContent);
        setEnhancedContent(enhanced);
        setCleanTTSContent(clean);
        setEnhancementChanges(changes);
        setEnhancementMarkers(markers);
        setEngagementScore(engScore);
        setShowEnhancementReview(true);
        setReviewProgress(0);
        
        const engagementInfo = engScore ? ` Engagement: ${engScore.before}→${engScore.after}/10` : '';
        const markerSummary = markers.pausesAdded > 0 || markers.engagementHooksAdded > 0 
          ? ` (${markers.pausesAdded} pauses, ${markers.engagementHooksAdded || 0} hooks)` 
          : '';
        toast.success(`${providerNames[aiProvider]} enhancement complete! ${changes.length} changes.${engagementInfo}${markerSummary}`);
      }
    } catch (err) {
      console.error('Enhancement error:', err);
      toast.error(`${providerNames[aiProvider]} enhancement failed. Please try again.`);
    } finally {
      setIsEnhancing(false);
    }
  };
  
  // Accept single change
  const handleAcceptChange = (changeId: string) => {
    setEnhancementChanges(prev => 
      prev.map(c => c.id === changeId ? { ...c, accepted: true } : c)
    );
    updateReviewProgress();
  };
  
  // Skip single change
  const handleSkipChange = (changeId: string) => {
    setEnhancementChanges(prev => 
      prev.map(c => c.id === changeId ? { ...c, accepted: false } : c)
    );
    updateReviewProgress();
  };
  
  // Accept all changes
  const handleAcceptAll = () => {
    setEnhancementChanges(prev => prev.map(c => ({ ...c, accepted: true })));
    setReviewProgress(100);
    toast.success('All changes accepted!');
  };
  
  // Skip all remaining
  const handleSkipAll = () => {
    setEnhancementChanges(prev => prev.map(c => c.accepted === null ? { ...c, accepted: false } : c));
    setReviewProgress(100);
    toast.info('Remaining changes skipped');
  };
  
  // Update progress
  const updateReviewProgress = () => {
    const reviewed = enhancementChanges.filter(c => c.accepted !== null).length;
    const total = enhancementChanges.length;
    setReviewProgress(total > 0 ? Math.round((reviewed / total) * 100) : 0);
  };
  
  // Calculate review progress whenever changes update
  useEffect(() => {
    if (enhancementChanges.length > 0) {
      const reviewed = enhancementChanges.filter(c => c.accepted !== null).length;
      setReviewProgress(Math.round((reviewed / enhancementChanges.length) * 100));
    }
  }, [enhancementChanges]);
  
  // Apply accepted changes and finalize
  const handleCompleteEnhancement = () => {
    const acceptedChanges = enhancementChanges.filter(c => c.accepted === true);
    
    if (acceptedChanges.length > 0 && enhancedContent) {
      // Apply the enhanced content as the new script
      setScriptContent(enhancedContent);
      setActiveVersion('enhanced');
      toast.success(`Applied ${acceptedChanges.length} enhancements!`);
    } else {
      toast.info('No changes applied. Using original script.');
    }
    
    setShowEnhancementReview(false);
  };
  
  // Save draft (for resuming later)
  const handleSaveDraft = async () => {
    if (!scriptContent.trim() || !scriptName.trim()) {
      toast.error('Please add a name and content');
      return;
    }
    
    setIsSavingDraft(true);
    try {
      const script: SavedScript = {
        id: selectedScriptId || crypto.randomUUID(),
        name: scriptName,
        content: originalContent || scriptContent,
        type: scriptType,
        createdAt: selectedScriptId ? savedScripts.find(s => s.id === selectedScriptId)?.createdAt || Date.now() : Date.now(),
        updatedAt: Date.now(),
        draftContent: enhancedContent || undefined,
        draftStatus: 'in_progress',
        draftChanges: enhancementChanges.length > 0 ? enhancementChanges : undefined
      };
      
      onSaveScript(script);
      setHasDraft(true);
      setLastDraftSave(new Date());
      toast.success('Draft saved! You can return to continue reviewing.');
    } finally {
      setIsSavingDraft(false);
    }
  };
  
  // Resume draft
  const handleResumeDraft = () => {
    const script = savedScripts.find(s => s.id === selectedScriptId);
    if (script?.draftContent && script.draftChanges) {
      setEnhancedContent(script.draftContent);
      setEnhancementChanges(script.draftChanges);
      setShowEnhancementReview(true);
      toast.success('Resumed from draft!');
    }
  };
  
  // Save complete script
  const handleSaveScript = () => {
    if (!scriptContent.trim() || !scriptName.trim()) {
      toast.error('Please add a name and content');
      return;
    }
    
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
  
  // Revert to original
  const handleRevertToOriginal = () => {
    if (originalContent) {
      setScriptContent(originalContent);
      setActiveVersion('original');
      toast.info('Reverted to original script');
    }
  };
  
  // Generate TTS
  const handleGenerateTTS = async () => {
    const textForTTS = cleanTTSContent || (activeVersion === 'enhanced' && enhancedContent ? enhancedContent : scriptContent);
    
    if (!textForTTS.trim()) {
      toast.error('No content to generate TTS');
      return;
    }
    
    // Use mode-aware voice settings if available
    const voiceSettings = customVoiceSettings || (selectedVoicePreset ? {
      stability: selectedVoicePreset.stability,
      similarityBoost: selectedVoicePreset.similarityBoost,
      style: selectedVoicePreset.style,
      speed: selectedVoicePreset.speed,
    } : undefined);
    
    const result = await generateTTS({
      provider: ttsProvider,
      voice: ttsVoice,
      text: textForTTS,
      scriptMode, // Pass script mode for mode-aware TTS
      voiceSettings, // Pass custom voice settings
    });
    
    if (result) {
      playTTS();
      toast.success('TTS generated! Playing audio...');
    }
  };
  
  // Save TTS as voiceover and link to script
  const handleSaveTTSAsVoiceover = () => {
    if (ttsResult?.audioUrl) {
      const voiceoverName = `${scriptName || 'Script'} - ${activeVersion === 'enhanced' ? 'Enhanced' : 'Original'} TTS`;
      onSaveVoiceover(ttsResult.audioUrl, voiceoverName, selectedScriptId || undefined);
      
      // Update script to mark it has a voiceover
      if (selectedScriptId) {
        onUpdateScript(selectedScriptId, { hasVoiceover: true });
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Show Linking Card - Only show if shows are available */}
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
                <Select 
                  value={linkedShowId || ''} 
                  onValueChange={(v) => {
                    const newId = v || null;
                    setLinkedShowId(newId);
                    onShowSelect?.(newId);
                  }}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select a production..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No production linked</SelectItem>
                    {availableShows.map(show => (
                      <SelectItem key={show.id} value={show.id}>
                        <span className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {show.show_type}
                          </Badge>
                          {show.title}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {linkedShowId && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setLinkedShowId(null);
                      onShowSelect?.(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {isPodcastMode && (
              <div className="mt-3 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  <strong>Podcast/Interview Mode:</strong> TTS voiceover is disabled for live recording formats. 
                  AI enhancement and background music are available.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Script Selection Card */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Script Editor</h2>
                <p className="text-sm text-muted-foreground">
                  {isPodcastMode 
                    ? 'Create scripts for your podcast/interview - AI enhance available' 
                    : 'Create, analyze, and enhance your scripts'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleNewScript} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Script
              </Button>
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline" 
                size="sm"
                disabled={isUploadingScript}
              >
                {isUploadingScript ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload Script
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,text/plain"
                onChange={handleScriptFileUpload}
                className="hidden"
              />
            </div>
          </div>
          
          {/* Script Library - Separated by Type */}
          <Tabs defaultValue="video" className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium">Script Library</Label>
              <TabsList level="child">
                <TabsTrigger value="video" level="child">
                  <Video className="h-4 w-4 mr-2 text-red-500" />
                  Video ({videoScripts.length})
                </TabsTrigger>
                <TabsTrigger value="audio" level="child">
                  <Mic className="h-4 w-4 mr-2 text-purple-500" />
                  Audio ({audioScripts.length})
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="video" className="mt-0">
              {videoScripts.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg bg-muted/30">
                  <Video className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No video scripts yet</p>
                  <p className="text-xs text-muted-foreground">Create or upload a video script to get started</p>
                </div>
              ) : (
                <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-2">
                  {videoScripts.map(script => (
                    <div 
                      key={script.id}
                      onClick={() => handleSelectScript(script.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        selectedScriptId === script.id 
                          ? "border-red-500/50 bg-red-500/5" 
                          : "border-border/50 hover:border-red-500/30 hover:bg-muted/50"
                      )}
                    >
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0">
                        <Video className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{script.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {script.stats?.wordCount || script.content.split(/\s+/).length} words
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {script.enhancedContent && (
                          <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/30">
                            Enhanced
                          </Badge>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteScript(script.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="audio" className="mt-0">
              {audioScripts.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg bg-muted/30">
                  <Mic className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No audio scripts yet</p>
                  <p className="text-xs text-muted-foreground">Create or upload an audio script to get started</p>
                </div>
              ) : (
                <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-2">
                  {audioScripts.map(script => (
                    <div 
                      key={script.id}
                      onClick={() => handleSelectScript(script.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        selectedScriptId === script.id 
                          ? "border-purple-500/50 bg-purple-500/5" 
                          : "border-border/50 hover:border-purple-500/30 hover:bg-muted/50"
                      )}
                    >
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                        <Mic className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{script.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {script.stats?.wordCount || script.content.split(/\s+/).length} words
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {script.enhancedContent && (
                          <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/30">
                            Enhanced
                          </Badge>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteScript(script.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
              <Button onClick={handleResumeDraft} size="sm" className="bg-amber-500 hover:bg-amber-600">
                Resume Review
              </Button>
            </div>
          )}
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.wordCount}</div>
              <div className="text-xs text-muted-foreground">Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.sentenceCount}</div>
              <div className="text-xs text-muted-foreground">Sentences</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                {stats.estimatedReadingMinutes}m
              </div>
              <div className="text-xs text-muted-foreground">Reading</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                <Mic className="h-4 w-4" />
                {stats.estimatedSpeakingMinutes}m
              </div>
              <div className="text-xs text-muted-foreground">Speaking (TTS)</div>
            </div>
            <div className="text-center">
              <Badge 
                className={cn(
                  "text-xs",
                  stats.readabilityScore === 'easy' && "bg-green-500/10 text-green-600 border-green-500/30",
                  stats.readabilityScore === 'moderate' && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                  stats.readabilityScore === 'difficult' && "bg-red-500/10 text-red-600 border-red-500/30"
                )}
                variant="outline"
              >
                {stats.readabilityScore}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">Readability</div>
            </div>
          </div>
          
          {/* AI Provider Selector */}
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-border/50">
            <Label className="text-sm font-medium whitespace-nowrap">AI Provider:</Label>
            <Select value={aiProvider} onValueChange={(v) => setAiProvider(v as 'gemini' | 'openai' | 'claude')}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-gradient-to-br from-blue-500 to-green-500" />
                    <span>Google Gemini</span>
                  </div>
                </SelectItem>
                <SelectItem value="openai">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-gradient-to-br from-green-600 to-teal-500" />
                    <span>OpenAI GPT</span>
                  </div>
                </SelectItem>
                <SelectItem value="claude">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-gradient-to-br from-orange-500 to-amber-500" />
                    <span>Anthropic Claude</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              {aiProvider === 'gemini' && 'Fast & balanced analysis'}
              {aiProvider === 'openai' && 'Advanced reasoning'}
              {aiProvider === 'claude' && 'Nuanced writing improvements'}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div 
              className={cn(
                "p-4 rounded-lg border cursor-pointer transition-all text-center",
                isAnalyzing ? "bg-blue-500/10 border-blue-500/50" : "bg-muted/50 border-border/50 hover:border-blue-500/50"
              )}
              onClick={handleAnalyze}
            >
              {isAnalyzing ? (
                <Loader2 className="h-6 w-6 mx-auto mb-2 text-blue-500 animate-spin" />
              ) : (
                <Search className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              )}
              <span className="text-sm font-medium">AI Analyze</span>
              <p className="text-xs text-muted-foreground mt-1">Recommendations</p>
            </div>
            <div 
              className={cn(
                "p-4 rounded-lg border cursor-pointer transition-all text-center",
                isEnhancing ? "bg-purple-500/10 border-purple-500/50" : "bg-muted/50 border-border/50 hover:border-purple-500/50"
              )}
              onClick={openEnhancementDialog}
            >
              {isEnhancing ? (
                <Loader2 className="h-6 w-6 mx-auto mb-2 text-purple-500 animate-spin" />
              ) : (
                <Wand2 className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              )}
              <span className="text-sm font-medium">AI Enhance</span>
              <p className="text-xs text-muted-foreground mt-1">Customize & improve</p>
            </div>
            {/* TTS Button - Only show if TTS is enabled for this show type */}
            {isTTSEnabled ? (
              <div 
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-all text-center",
                  isTTSGenerating ? "bg-green-500/10 border-green-500/50" : "bg-muted/50 border-border/50 hover:border-green-500/50"
                )}
                onClick={() => setShowTTSOptions(!showTTSOptions)}
              >
                {isTTSGenerating ? (
                  <Loader2 className="h-6 w-6 mx-auto mb-2 text-green-500 animate-spin" />
                ) : (
                  <Volume2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                )}
                <span className="text-sm font-medium">Generate TTS</span>
                <p className="text-xs text-muted-foreground mt-1">Full script audio</p>
              </div>
            ) : (
              <div 
                className="p-4 rounded-lg border bg-muted/30 border-border/30 text-center opacity-50 cursor-not-allowed"
                title="TTS not available for podcast/interview formats"
              >
                <Volume2 className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">TTS Disabled</span>
                <p className="text-xs text-muted-foreground mt-1">Podcast mode</p>
              </div>
            )}
            <div 
              className="p-4 rounded-lg border bg-muted/50 border-border/50 hover:border-primary/50 cursor-pointer transition-all text-center"
              onClick={handleSaveScript}
            >
              <Save className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">Save Script</span>
              <p className="text-xs text-muted-foreground mt-1">Store to library</p>
            </div>
          </div>
          
          {/* TTS Options Panel - Only render if TTS is enabled */}
          {isTTSEnabled && (
          <Collapsible open={showTTSOptions} onOpenChange={setShowTTSOptions}>
            <CollapsibleContent className="mb-6 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-green-500" />
                  TTS Generation Options
                </h3>
              </div>
              
              {/* Script Selection for TTS */}
              <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                <Label className="text-xs font-medium mb-2 block">Select Script for TTS</Label>
                <Select 
                  value={selectedTTSScriptId || selectedScriptId || ''} 
                  onValueChange={(v) => {
                    setSelectedTTSScriptId(v);
                    const script = savedScripts.find(s => s.id === v);
                    if (script) {
                      setScriptContent(script.content);
                      setScriptName(script.name);
                      setOriginalContent(script.content);
                      if (script.enhancedContent) {
                        setEnhancedContent(script.enhancedContent);
                        setCleanTTSContent(script.cleanContent || null);
                        setActiveVersion('enhanced');
                      } else {
                        setEnhancedContent(null);
                        setActiveVersion('original');
                      }
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a script..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {savedScripts.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No scripts saved yet. Create one above!
                      </div>
                    ) : (
                      <>
                        {/* Video Scripts */}
                        {videoScripts.length > 0 && (
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                            Video Scripts
                          </div>
                        )}
                        {videoScripts.map(script => (
                          <SelectItem key={script.id} value={script.id}>
                            <div className="flex items-center gap-2 w-full">
                              <Video className="h-3.5 w-3.5 text-red-500 shrink-0" />
                              <span className="truncate">{script.name}</span>
                              <div className="flex items-center gap-1 ml-auto shrink-0">
                                {script.enhancedContent && (
                                  <Badge variant="outline" className="text-[10px] h-4 px-1 bg-purple-500/10 text-purple-600 border-purple-500/30">
                                    Enhanced
                                  </Badge>
                                )}
                                {script.hasVoiceover && (
                                  <Badge variant="outline" className="text-[10px] h-4 px-1 bg-green-500/10 text-green-600 border-green-500/30">
                                    <Volume2 className="h-2.5 w-2.5" />
                                  </Badge>
                                )}
                                <span className="text-[10px] text-muted-foreground">
                                  {script.stats?.wordCount || script.content.split(/\s+/).length}w
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                        {/* Audio Scripts */}
                        {audioScripts.length > 0 && (
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 mt-1">
                            Audio Scripts
                          </div>
                        )}
                        {audioScripts.map(script => (
                          <SelectItem key={script.id} value={script.id}>
                            <div className="flex items-center gap-2 w-full">
                              <Mic className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                              <span className="truncate">{script.name}</span>
                              <div className="flex items-center gap-1 ml-auto shrink-0">
                                {script.enhancedContent && (
                                  <Badge variant="outline" className="text-[10px] h-4 px-1 bg-purple-500/10 text-purple-600 border-purple-500/30">
                                    Enhanced
                                  </Badge>
                                )}
                                {script.hasVoiceover && (
                                  <Badge variant="outline" className="text-[10px] h-4 px-1 bg-green-500/10 text-green-600 border-green-500/30">
                                    <Volume2 className="h-2.5 w-2.5" />
                                  </Badge>
                                )}
                                <span className="text-[10px] text-muted-foreground">
                                  {script.stats?.wordCount || script.content.split(/\s+/).length}w
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                {(selectedTTSScriptId || selectedScriptId) && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {(() => {
                      const script = savedScripts.find(s => s.id === (selectedTTSScriptId || selectedScriptId));
                      if (!script) return null;
                      const wordCount = script.stats?.wordCount || script.content.split(/\s+/).length;
                      const speakingMin = Math.ceil(wordCount / 130);
                      return `${wordCount} words • ~${speakingMin} min speaking time${script.enhancedContent ? ' • Enhanced version available' : ''}`;
                    })()}
                  </p>
                )}
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label>Provider</Label>
                  <Select value={ttsProvider} onValueChange={(v: 'openai' | 'elevenlabs' | 'google') => setTtsProvider(v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elevenlabs">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded bg-gradient-to-br from-purple-500 to-pink-500" />
                          ElevenLabs (Premium)
                        </div>
                      </SelectItem>
                      <SelectItem value="openai">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded bg-gradient-to-br from-green-600 to-teal-500" />
                          OpenAI (Standard)
                        </div>
                      </SelectItem>
                      <SelectItem value="google">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded bg-gradient-to-br from-blue-500 to-green-500" />
                          Google Cloud (Neural)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {ttsProvider === 'elevenlabs' && 'Best quality, expressive voices'}
                    {ttsProvider === 'openai' && 'Fast, natural-sounding'}
                    {ttsProvider === 'google' && 'Multi-language, neural voices'}
                  </p>
                </div>
                <div>
                  <Label>Voice</Label>
                  <Select value={ttsVoice} onValueChange={setTtsVoice}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px]">
                      {(ttsProvider === 'openai' 
                        ? OPENAI_VOICES 
                        : ttsProvider === 'google' 
                          ? GOOGLE_VOICES 
                          : ELEVENLABS_VOICES
                      ).map(voice => (
                        <SelectItem key={voice.value} value={voice.value}>
                          <div className="flex items-center justify-between gap-3">
                            <span>{voice.label}</span>
                            <span className="text-[10px] text-muted-foreground">{voice.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleGenerateTTS} 
                    disabled={isTTSGenerating || !currentContent.trim()}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  >
                    {isTTSGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate TTS
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Version Selection for TTS */}
              {enhancedContent && (
                <div className="mb-4 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <Label className="text-xs font-medium mb-2 block">Generate TTS from:</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant={activeVersion === 'original' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setActiveVersion('original')}
                      className={activeVersion === 'original' ? '' : 'border-border/50'}
                    >
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      Original ({originalStats?.wordCount || stats.wordCount} words)
                    </Button>
                    <Button 
                      variant={activeVersion === 'enhanced' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setActiveVersion('enhanced')}
                      className={activeVersion === 'enhanced' ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-500/30 text-purple-600'}
                    >
                      <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                      Enhanced ({enhancedStats?.wordCount || 0} words)
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Enhanced version includes improved pacing and natural pauses for better voiceover delivery
                  </p>
                </div>
              )}
              
              {/* TTS Result */}
              {ttsResult && (
                <div className="p-4 rounded-lg bg-background border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      TTS Ready
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={playTTS}>
                        <Play className="h-4 w-4 mr-1" />
                        Play
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => downloadTTS()}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" onClick={handleSaveTTSAsVoiceover}>
                        <Save className="h-4 w-4 mr-1" />
                        Save to Voice Tab
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="ml-2">{ttsResult.duration.toFixed(1)}s</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Provider:</span>
                      <span className="ml-2 capitalize">{ttsResult.provider}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Characters:</span>
                      <span className="ml-2">{ttsResult.charactersProcessed}</span>
                    </div>
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
          )}
          
          {/* Progressive Analysis Walkthrough */}
          {showProgressiveAnalysis && isAnalyzing && (
            <div className="mb-6 p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  Analyzing Script...
                </h3>
              </div>
              
              <div className="space-y-3">
                {analysisSteps.map((step, idx) => {
                  const stepConfig = [
                    { id: 'stats', label: 'Calculating word count & reading time', icon: BookOpen },
                    { id: 'readability', label: 'Analyzing readability & complexity', icon: Search },
                    { id: 'pacing', label: 'Checking pacing & natural pauses', icon: Clock },
                    { id: 'engagement', label: 'Evaluating audience engagement', icon: Sparkles },
                    { id: 'clarity', label: 'Reviewing clarity & structure', icon: FileCheck },
                    { id: 'ai', label: 'Getting AI recommendations', icon: Wand2 },
                  ].find(s => s.id === step.step);
                  
                  if (!stepConfig) return null;
                  const Icon = stepConfig.icon;
                  
                  return (
                    <div 
                      key={step.step}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-all",
                        step.status === 'running' && "bg-blue-500/10 border border-blue-500/30",
                        step.status === 'complete' && "bg-green-500/5 border border-green-500/20",
                        step.status === 'pending' && "bg-muted/30 opacity-50"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        step.status === 'running' && "bg-blue-500/20",
                        step.status === 'complete' && "bg-green-500/20",
                        step.status === 'pending' && "bg-muted"
                      )}>
                        {step.status === 'running' ? (
                          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                        ) : step.status === 'complete' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "text-sm font-medium",
                          step.status === 'running' && "text-blue-600",
                          step.status === 'complete' && "text-foreground",
                          step.status === 'pending' && "text-muted-foreground"
                        )}>
                          {stepConfig.label}
                        </p>
                        {step.detail && step.status === 'complete' && (
                          <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          step.status === 'running' && "border-blue-500/50 text-blue-600",
                          step.status === 'complete' && "border-green-500/50 text-green-600",
                          step.status === 'pending' && "border-border text-muted-foreground"
                        )}
                      >
                        {step.status === 'running' ? 'Analyzing...' : 
                         step.status === 'complete' ? 'Done' : 
                         `Step ${idx + 1}`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-3 border-t border-blue-500/20">
                <Progress 
                  value={(analysisSteps.filter(s => s.status === 'complete').length / analysisSteps.length) * 100} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {analysisSteps.filter(s => s.status === 'complete').length} of {analysisSteps.length} steps complete
                </p>
              </div>
            </div>
          )}
          
          {/* Analysis Results */}
          {showAnalysis && analysisResult && (
            <div className="mb-6 p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-500" />
                  Script Analysis Results
                </h3>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAnalyze()}
                    disabled={isAnalyzing}
                    className="gap-1"
                  >
                    {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    Re-Analyze
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowAnalysis(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-[400px] pr-2">
              
              {/* Overall Assessment - NEW */}
              {analysisResult.overallAssessment && (
                <div className="mb-4 p-3 rounded-lg bg-background border">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs px-2",
                        analysisResult.overallAssessment.voiceoverReadiness === 'ready' && "border-green-500/50 text-green-600 bg-green-500/10",
                        analysisResult.overallAssessment.voiceoverReadiness === 'needs_minor_edits' && "border-yellow-500/50 text-yellow-600 bg-yellow-500/10",
                        analysisResult.overallAssessment.voiceoverReadiness === 'needs_significant_work' && "border-orange-500/50 text-orange-600 bg-orange-500/10"
                      )}
                    >
                      {analysisResult.overallAssessment.voiceoverReadiness === 'ready' && '✓ Ready for Recording'}
                      {analysisResult.overallAssessment.voiceoverReadiness === 'needs_minor_edits' && '⚠ Needs Minor Edits'}
                      {analysisResult.overallAssessment.voiceoverReadiness === 'needs_significant_work' && '⚡ Needs Significant Work'}
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysisResult.overallAssessment.strengths?.length > 0 && (
                      <div>
                        <Label className="text-xs text-green-600 flex items-center gap-1 mb-1.5">
                          <Check className="h-3 w-3" /> Strengths
                        </Label>
                        <ul className="space-y-1">
                          {analysisResult.overallAssessment.strengths.map((s, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-green-500 shrink-0">•</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysisResult.overallAssessment.weaknesses?.length > 0 && (
                      <div>
                        <Label className="text-xs text-orange-600 flex items-center gap-1 mb-1.5">
                          <AlertTriangle className="h-3 w-3" /> Areas to Improve
                        </Label>
                        <ul className="space-y-1">
                          {analysisResult.overallAssessment.weaknesses.map((w, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-orange-500 shrink-0">•</span>{w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {/* Engagement Score & Top Priority */}
                  {(analysisResult.overallAssessment.engagementScore || analysisResult.overallAssessment.topPriority) && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-4">
                        {analysisResult.overallAssessment.engagementScore && (
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            <span className="text-xs text-muted-foreground">Engagement:</span>
                            <Badge variant="outline" className={cn(
                              "text-xs",
                              analysisResult.overallAssessment.engagementScore >= 7 && "bg-green-500/10 text-green-600 border-green-500/30",
                              analysisResult.overallAssessment.engagementScore >= 4 && analysisResult.overallAssessment.engagementScore < 7 && "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
                              analysisResult.overallAssessment.engagementScore < 4 && "bg-red-500/10 text-red-600 border-red-500/30"
                            )}>
                              {analysisResult.overallAssessment.engagementScore}/10
                            </Badge>
                          </div>
                        )}
                        {analysisResult.overallAssessment.topPriority && (
                          <div className="flex-1">
                            <span className="text-xs text-muted-foreground">Top Priority: </span>
                            <span className="text-xs font-medium text-foreground">{analysisResult.overallAssessment.topPriority}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Engagement Analysis - NEW */}
              {analysisResult.engagementAnalysis && (
                <div className="mb-4">
                  <Collapsible defaultOpen>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary w-full justify-between p-2 rounded-lg hover:bg-muted/50">
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        Engagement Analysis
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="grid md:grid-cols-2 gap-3 pl-2">
                        {/* Opening Hook */}
                        {analysisResult.engagementAnalysis.openingHook && (
                          <div className="p-2 rounded border border-purple-500/20 bg-purple-500/5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">Opening Hook</span>
                              <Badge variant="outline" className={cn(
                                "text-[10px]",
                                analysisResult.engagementAnalysis.openingHook.quality === 'strong' && "bg-green-500/10 text-green-600",
                                analysisResult.engagementAnalysis.openingHook.quality === 'moderate' && "bg-yellow-500/10 text-yellow-600",
                                analysisResult.engagementAnalysis.openingHook.quality === 'weak' && "bg-red-500/10 text-red-600"
                              )}>
                                {analysisResult.engagementAnalysis.openingHook.quality}
                              </Badge>
                            </div>
                            {analysisResult.engagementAnalysis.openingHook.suggestion && (
                              <p className="text-[10px] text-muted-foreground">{analysisResult.engagementAnalysis.openingHook.suggestion}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Audience Connection */}
                        {analysisResult.engagementAnalysis.audienceConnection && (
                          <div className="p-2 rounded border border-blue-500/20 bg-blue-500/5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">Audience Connection</span>
                              <Badge variant="outline" className="text-[10px]">
                                {analysisResult.engagementAnalysis.audienceConnection.score}/10
                              </Badge>
                            </div>
                            <div className="flex gap-2 text-[10px] text-muted-foreground">
                              {analysisResult.engagementAnalysis.audienceConnection.uses_you && <span className="text-green-600">✓ Uses "you"</span>}
                              {analysisResult.engagementAnalysis.audienceConnection.uses_questions && <span className="text-green-600">✓ Has questions</span>}
                            </div>
                          </div>
                        )}
                        
                        {/* Call to Action */}
                        {analysisResult.engagementAnalysis.callToAction && (
                          <div className="p-2 rounded border border-green-500/20 bg-green-500/5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">Call to Action</span>
                              <Badge variant="outline" className={cn(
                                "text-[10px]",
                                analysisResult.engagementAnalysis.callToAction.present ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                              )}>
                                {analysisResult.engagementAnalysis.callToAction.present ? analysisResult.engagementAnalysis.callToAction.clarity : 'Missing'}
                              </Badge>
                            </div>
                            {analysisResult.engagementAnalysis.callToAction.suggestion && (
                              <p className="text-[10px] text-muted-foreground">{analysisResult.engagementAnalysis.callToAction.suggestion}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Emotional Resonance */}
                        {analysisResult.engagementAnalysis.emotionalResonance && (
                          <div className="p-2 rounded border border-pink-500/20 bg-pink-500/5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">Emotional Impact</span>
                              <Badge variant="outline" className="text-[10px]">
                                {analysisResult.engagementAnalysis.emotionalResonance.score}/10
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              {analysisResult.engagementAnalysis.emotionalResonance.powerWords} power words found
                            </p>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
              
              {/* Pause Opportunities - NEW */}
              {analysisResult.pauseOpportunities && analysisResult.pauseOpportunities.length > 0 && (
                <div className="mb-4">
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary w-full justify-between p-2 rounded-lg hover:bg-muted/50">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        Pause Opportunities ({analysisResult.pauseOpportunities.length})
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="space-y-2 pl-6">
                        {analysisResult.pauseOpportunities.map((pause, i) => (
                          <div key={i} className="p-2 rounded border border-blue-500/20 bg-blue-500/5">
                            <p className="text-xs font-medium text-foreground">
                              After: "<span className="text-blue-600">{pause.afterText}</span>"
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{pause.reason}</p>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
              
              {/* Section Breaks - NEW */}
              {analysisResult.sectionBreaks && analysisResult.sectionBreaks.length > 0 && (
                <div className="mb-4">
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary w-full justify-between p-2 rounded-lg hover:bg-muted/50">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-500" />
                        Suggested Section Breaks ({analysisResult.sectionBreaks.length})
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="space-y-2 pl-6">
                        {analysisResult.sectionBreaks.map((section, i) => (
                          <div key={i} className="p-2 rounded border border-purple-500/20 bg-purple-500/5">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-600">
                                Section {i + 1}
                              </Badge>
                              <span className="text-xs font-medium text-foreground">{section.sectionTitle}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Starts at: "<span className="text-purple-600">{section.beforeText.slice(0, 60)}...</span>"
                            </p>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
              
              {/* Recommendations */}
              {analysisResult.recommendations.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Recommendations ({analysisResult.recommendations.length})
                    </Label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setAnalysisResult(prev => prev ? {
                          ...prev,
                          recommendations: prev.recommendations.map(r => ({ ...r, accepted: true }))
                        } : null)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Note All
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                      {analysisResult.recommendations.map(rec => (
                        <div 
                          key={rec.id}
                          className={cn(
                            "p-3 rounded-lg border",
                            rec.severity === 'warning' && "border-orange-500/30 bg-orange-500/5",
                            rec.severity === 'suggestion' && "border-purple-500/30 bg-purple-500/5",
                            rec.severity === 'info' && "border-border bg-background",
                            rec.accepted !== null && "opacity-60"
                          )}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge variant="outline" className="text-xs capitalize">{rec.type}</Badge>
                              {rec.location && (
                                <Badge variant="secondary" className="text-[10px]">{rec.location}</Badge>
                              )}
                              {rec.severity === 'warning' && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                              {rec.accepted !== null && (
                                <Badge variant={rec.accepted ? 'default' : 'secondary'} className="text-[10px]">
                                  {rec.accepted ? '✓ Noted' : 'Dismissed'}
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium text-sm">{rec.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                            
                            {/* Original vs Suggested Text */}
                            {rec.originalText && rec.accepted === null && (
                              <div className="mt-2 p-2 rounded bg-red-500/5 border border-red-500/20">
                                <span className="text-[10px] text-red-600 font-medium">Original: </span>
                                <span className="text-xs text-red-600/80 line-through">{rec.originalText}</span>
                              </div>
                            )}
                            {rec.suggestedText && rec.accepted === null && (
                              <div className="mt-1 p-2 rounded bg-green-500/10 border border-green-500/20">
                                <span className="text-[10px] text-green-600 font-medium">Suggested: </span>
                                <span className="text-xs text-green-700">{rec.suggestedText}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Action Buttons - Apply Fix, Edit, Dismiss */}
                          {rec.accepted === null && (
                            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
                              {rec.suggestedText && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-7 px-2 text-xs gap-1 border-green-500/30 hover:bg-green-500/10"
                                  onClick={() => {
                                    // Apply the suggested fix to the script
                                    if (rec.originalText && rec.suggestedText) {
                                      const newContent = scriptContent.replace(rec.originalText, rec.suggestedText);
                                      setScriptContent(newContent);
                                      toast.success('Applied fix to script');
                                    }
                                    setAnalysisResult(prev => prev ? {
                                      ...prev,
                                      recommendations: prev.recommendations.map(r => 
                                        r.id === rec.id ? { ...r, accepted: true } : r
                                      )
                                    } : null);
                                  }}
                                >
                                  <Wand2 className="h-3 w-3 text-green-600" />
                                  Apply Fix
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 px-2 text-xs gap-1 border-blue-500/30 hover:bg-blue-500/10"
                                onClick={() => {
                                  // Scroll to and highlight the issue in editor
                                  toast.info('Edit mode: Make changes in the script editor');
                                  setAnalysisResult(prev => prev ? {
                                    ...prev,
                                    recommendations: prev.recommendations.map(r => 
                                      r.id === rec.id ? { ...r, accepted: true } : r
                                    )
                                  } : null);
                                }}
                              >
                                <Edit3 className="h-3 w-3 text-blue-600" />
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2 text-xs gap-1"
                                onClick={() => setAnalysisResult(prev => prev ? {
                                  ...prev,
                                  recommendations: prev.recommendations.map(r => 
                                    r.id === rec.id ? { ...r, accepted: false } : r
                                  )
                                } : null)}
                              >
                                <X className="h-3 w-3 text-muted-foreground" />
                                Dismiss
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>Script looks great! No major issues found.</p>
                </div>
              )}
              </ScrollArea>
            </div>
          )}
          
          {/* Enhancement Review Panel */}
          {showEnhancementReview && enhancedContent && (
            <div className="mb-6 p-4 rounded-lg border border-purple-500/30 bg-purple-500/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-500" />
                  Review AI Enhancements ({enhancementChanges.filter(c => c.accepted !== null).length}/{enhancementChanges.length})
                </h3>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={openEnhancementDialog}
                    disabled={isEnhancing}
                    className="gap-1"
                  >
                    {isEnhancing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    Request New Enhancement
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSavingDraft}>
                    {isSavingDraft ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                    Save Draft
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowEnhancementReview(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[400px] pr-2">
              
              {/* Engagement Score - Before/After */}
              {engagementScore && (
                <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      Engagement Score
                    </Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                        Before: {engagementScore.before}/10
                      </Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                        After: {engagementScore.after}/10
                      </Badge>
                    </div>
                  </div>
                  {engagementScore.improvements?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {engagementScore.improvements.slice(0, 4).map((imp, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">{imp}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Enhancement Summary */}
              {enhancementMarkers && (
                <div className="mb-4 p-3 rounded-lg bg-background border grid grid-cols-5 gap-3 text-center">
                  <div>
                    <p className="text-xl font-bold text-blue-500">{enhancementMarkers.pausesAdded}</p>
                    <p className="text-[10px] text-muted-foreground">Pauses</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-purple-500">{enhancementMarkers.sectionBreaksAdded}</p>
                    <p className="text-[10px] text-muted-foreground">Breaks</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-green-500">{enhancementMarkers.sentencesRewritten}</p>
                    <p className="text-[10px] text-muted-foreground">Rewritten</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-orange-500">{enhancementMarkers.engagementHooksAdded || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Hooks</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-pink-500">{enhancementMarkers.conversationalChanges || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Conversational</p>
                  </div>
                </div>
              )}
              
              {/* Review Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Review Progress: {enhancementChanges.filter(c => c.accepted !== null).length}/{enhancementChanges.length}
                  </span>
                  <span className="text-sm font-medium">{reviewProgress}%</span>
                </div>
                <Progress value={reviewProgress} className="h-2" />
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={handleSkipAll}>
                  <X className="h-4 w-4 mr-1" />
                  Skip All Remaining
                </Button>
                <Button size="sm" onClick={handleAcceptAll} className="bg-green-500 hover:bg-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  Accept All
                </Button>
              </div>
              
              {/* Changes List */}
              <div className="space-y-3 mb-4">
                {enhancementChanges.map((change, index) => (
                    <div 
                      key={change.id}
                      className={cn(
                        "p-3 rounded-lg border bg-background",
                        change.accepted === true && "border-green-500/30 bg-green-500/5",
                        change.accepted === false && "border-red-500/30 bg-red-500/5 opacity-60"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">{change.type}</Badge>
                          <span className="text-xs text-muted-foreground">Change {index + 1}</span>
                        </div>
                        {change.accepted === null ? (
                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 px-2 border-green-500/30 hover:bg-green-500/10"
                              onClick={() => {
                                // Apply this specific change to the script
                                if (change.original && change.enhanced) {
                                  const newContent = scriptContent.replace(change.original, change.enhanced);
                                  if (newContent !== scriptContent) {
                                    setScriptContent(newContent);
                                    toast.success('Applied fix to script');
                                  }
                                }
                                handleAcceptChange(change.id);
                              }}
                            >
                              <Wand2 className="h-3 w-3 text-green-600 mr-1" />
                              Apply Fix
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 px-2 border-blue-500/30 hover:bg-blue-500/10"
                              onClick={() => {
                                toast.info('Edit mode: Make changes in the script editor');
                                handleAcceptChange(change.id);
                              }}
                            >
                              <Edit3 className="h-3 w-3 text-blue-600 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2"
                              onClick={() => handleSkipChange(change.id)}
                            >
                              <X className="h-3 w-3 text-muted-foreground mr-1" />
                              Dismiss
                            </Button>
                          </div>
                        ) : (
                          <Badge variant={change.accepted ? 'default' : 'secondary'} className="text-xs">
                            {change.accepted ? 'Accepted' : 'Skipped'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{change.reason}</p>
                      {change.original && (
                        <p className="text-sm text-red-500/80 line-through mb-1">{change.original}</p>
                      )}
                      {change.enhanced && (
                        <p className="text-sm text-green-600">{change.enhanced}</p>
                      )}
                    </div>
                  ))}
              </div>
              
              {/* Compare Versions */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg border bg-background">
                  <Label className="text-xs text-muted-foreground mb-2 block flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Original ({originalStats?.wordCount || 0} words, ~{originalStats?.estimatedSpeakingMinutes || 0}m)
                  </Label>
                  <p className="text-sm line-clamp-4">{originalContent?.slice(0, 300)}...</p>
                </div>
                <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/5">
                  <Label className="text-xs text-muted-foreground mb-2 block flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Enhanced ({enhancedStats?.wordCount || 0} words, ~{enhancedStats?.estimatedSpeakingMinutes || 0}m)
                  </Label>
                  <p className="text-sm line-clamp-4">{enhancedContent?.slice(0, 300)}...</p>
                </div>
              </div>
              
              {/* Complete Button */}
              <Button 
                onClick={handleCompleteEnhancement} 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                disabled={reviewProgress < 100}
              >
                <FileCheck className="h-4 w-4 mr-2" />
                Complete Enhancement & Apply Changes
              </Button>
              </ScrollArea>
            </div>
          )}
          
          {/* Revert Option */}
          {originalContent && activeVersion === 'enhanced' && !showEnhancementReview && (
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-500/10 text-purple-600">
                <Sparkles className="h-3 w-3 mr-1" />
                Enhanced Version Active
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleRevertToOriginal}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Revert to Original
              </Button>
            </div>
          )}
          
          {/* Script Editor */}
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="script-name">Script Name *</Label>
                <Input
                  id="script-name"
                  value={scriptName}
                  onChange={(e) => setScriptName(e.target.value)}
                  placeholder="Enter script name..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Script Type</Label>
                <Select value={scriptType} onValueChange={(v: 'video' | 'audio') => setScriptType(v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-red-500" />
                        Video Script
                      </div>
                    </SelectItem>
                    <SelectItem value="audio">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-purple-500" />
                        Audio Script
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Script Mode</Label>
                <Select value={scriptMode} onValueChange={(v: ScriptMode) => setScriptMode(v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCRIPT_MODES.map((mode) => (
                      <SelectItem key={mode.id} value={mode.id}>
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{mode.label}</span>
                          {!mode.ttsEnabled && (
                            <Badge variant="outline" className="text-[10px] ml-1">No TTS</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="script-content">Script Content</Label>
                {enhancedContent && (
                  <div className="flex gap-2">
                    <Button
                      variant={activeVersion === 'original' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveVersion('original')}
                    >
                      Original
                    </Button>
                    <Button
                      variant={activeVersion === 'enhanced' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveVersion('enhanced')}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Enhanced
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Script Mode Toolbar */}
              <ScriptModeToolbar 
                mode={scriptMode} 
                onInsert={(marker) => {
                  const textarea = textareaRef.current;
                  if (textarea) {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const text = activeVersion === 'enhanced' && enhancedContent ? enhancedContent : scriptContent;
                    const newText = text.slice(0, start) + marker + text.slice(end);
                    if (activeVersion === 'enhanced') {
                      setEnhancedContent(newText);
                    } else {
                      setScriptContent(newText);
                    }
                    // Focus and set cursor position after the inserted marker
                    setTimeout(() => {
                      textarea.focus();
                      textarea.setSelectionRange(start + marker.length, start + marker.length);
                    }, 0);
                  }
                }}
                disabled={!scriptContent.trim() && !enhancedContent}
              />
              
              <Textarea
                ref={textareaRef}
                id="script-content"
                value={activeVersion === 'enhanced' && enhancedContent ? enhancedContent : scriptContent}
                onChange={(e) => {
                  if (activeVersion === 'enhanced') {
                    setEnhancedContent(e.target.value);
                  } else {
                    setScriptContent(e.target.value);
                  }
                }}
                placeholder="Start writing your script here... Use the toolbar above to insert markers."
                className="mt-1 min-h-[300px] font-mono text-sm"
              />
            </div>
            
            {/* Bottom Action Bar */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !scriptContent.trim()}
                variant="outline"
              >
                {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Analyze
              </Button>
              <Button 
                onClick={openEnhancementDialog}
                disabled={isEnhancing || !scriptContent.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                {isEnhancing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                AI Enhance
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigator.clipboard.writeText(currentContent)}
                disabled={!currentContent.trim()}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <div className="flex-1" />
              <Button 
                onClick={handleSaveScript}
                disabled={!scriptContent.trim() || !scriptName.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Script
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Saved Scripts List */}
      {savedScripts.length > 0 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Saved Scripts ({savedScripts.length})
            </h3>
            
            <Tabs defaultValue="video" className="w-full">
              <TabsList level="child" className="mb-4">
                <TabsTrigger value="video" level="child">
                  <Video className="h-4 w-4 mr-2 text-red-500" />
                  Video ({videoScripts.length})
                </TabsTrigger>
                <TabsTrigger value="audio" level="child">
                  <Mic className="h-4 w-4 mr-2 text-purple-500" />
                  Audio ({audioScripts.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="video" level="child" className="mt-0 p-0 border-0 shadow-none bg-transparent">
                {videoScripts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No video scripts saved yet</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {videoScripts.map(script => (
                      <div
                        key={script.id}
                        className={cn(
                          "p-4 rounded-lg border transition-all group cursor-pointer",
                          selectedScriptId === script.id 
                            ? "border-primary bg-primary/5" 
                            : "border-border/50 hover:border-primary/30"
                        )}
                        onClick={() => handleSelectScript(script.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Video className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <h4 className="font-medium truncate">{script.name}</h4>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteScript(script.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {script.content.slice(0, 100)}...
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            {script.stats?.wordCount || 0} words
                          </span>
                          {script.enhancedContent && (
                            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Enhanced
                            </Badge>
                          )}
                          {script.draftStatus === 'in_progress' && (
                            <Badge variant="secondary" className="text-xs">
                              <Edit3 className="h-3 w-3 mr-1" />
                              Draft
                            </Badge>
                          )}
                          {script.hasVoiceover && (
                            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">
                              <Volume2 className="h-3 w-3 mr-1" />
                              Voiceover
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="audio" level="child" className="mt-0 p-0 border-0 shadow-none bg-transparent">
                {audioScripts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No audio scripts saved yet</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {audioScripts.map(script => (
                      <div
                        key={script.id}
                        className={cn(
                          "p-4 rounded-lg border transition-all group cursor-pointer",
                          selectedScriptId === script.id 
                            ? "border-primary bg-primary/5" 
                            : "border-border/50 hover:border-primary/30"
                        )}
                        onClick={() => handleSelectScript(script.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Mic className="h-4 w-4 text-purple-500 flex-shrink-0" />
                            <h4 className="font-medium truncate">{script.name}</h4>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteScript(script.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {script.content.slice(0, 100)}...
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            {script.stats?.wordCount || 0} words
                          </span>
                          {script.enhancedContent && (
                            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Enhanced
                            </Badge>
                          )}
                          {script.draftStatus === 'in_progress' && (
                            <Badge variant="secondary" className="text-xs">
                              <Edit3 className="h-3 w-3 mr-1" />
                              Draft
                            </Badge>
                          )}
                          {script.hasVoiceover && (
                            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">
                              <Volume2 className="h-3 w-3 mr-1" />
                              Voiceover
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      {/* Enhancement Customization Dialog */}
      <Dialog open={showEnhancementDialog} onOpenChange={setShowEnhancementDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-500" />
              Customize AI Enhancement
            </DialogTitle>
            <DialogDescription>
              Customize how AI enhances your script before generating suggestions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Enhancement Focus */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Enhancement Focus</Label>
              <RadioGroup
                value={enhancementFocus}
                onValueChange={(v) => setEnhancementFocus(v as typeof enhancementFocus)}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="balanced" id="balanced" />
                  <Label htmlFor="balanced" className="flex-1 cursor-pointer">
                    <span className="font-medium">Balanced</span>
                    <p className="text-xs text-muted-foreground">General improvements across all areas</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="engagement" id="engagement" />
                  <Label htmlFor="engagement" className="flex-1 cursor-pointer">
                    <span className="font-medium">Engagement</span>
                    <p className="text-xs text-muted-foreground">Hooks, CTAs, audience connection</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="clarity" id="clarity" />
                  <Label htmlFor="clarity" className="flex-1 cursor-pointer">
                    <span className="font-medium">Clarity</span>
                    <p className="text-xs text-muted-foreground">Simpler sentences, better structure</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="pacing" id="pacing" />
                  <Label htmlFor="pacing" className="flex-1 cursor-pointer">
                    <span className="font-medium">Pacing</span>
                    <p className="text-xs text-muted-foreground">Pauses, rhythm, breathing room</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="conversational" id="conversational" />
                  <Label htmlFor="conversational" className="flex-1 cursor-pointer">
                    <span className="font-medium">Conversational</span>
                    <p className="text-xs text-muted-foreground">Natural, spoken-word friendly</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="humor" id="humor" />
                  <Label htmlFor="humor" className="flex-1 cursor-pointer">
                    <span className="font-medium">Humor & Personality</span>
                    <p className="text-xs text-muted-foreground">Add wit, light humor, personality</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Custom Instructions */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Custom Instructions (Optional)</Label>
              <Textarea
                placeholder="E.g., 'Make it more formal', 'Add humor', 'Focus on the opening hook', 'Keep medical terminology'..."
                value={customEnhancementInstructions}
                onChange={(e) => setCustomEnhancementInstructions(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Add specific instructions for how AI should enhance your script
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEnhancementDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setCustomEnhancementInstructions('');
                setEnhancementFocus('balanced');
                handleEnhance(false);
              }}
              disabled={isEnhancing}
            >
              Quick Enhance
            </Button>
            <Button 
              onClick={() => handleEnhance(true)}
              disabled={isEnhancing}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              {isEnhancing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Enhance with Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
