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
  FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTTSGeneration, OPENAI_VOICES, ELEVENLABS_VOICES } from '@/components/document-processing/RecordingStudio/hooks/useTTSGeneration';

// Types
export interface SavedScript {
  id: string;
  name: string;
  content: string;
  type: 'video' | 'audio';
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
  type: 'pacing' | 'clarity' | 'engagement' | 'length' | 'readability' | 'pause' | 'break';
  severity: 'info' | 'warning' | 'suggestion';
  title: string;
  description: string;
  originalText?: string;
  suggestedText?: string;
  accepted: boolean | null;
}

interface EnhancementChange {
  id: string;
  type: 'modification' | 'addition' | 'removal' | 'formatting' | 'pause' | 'break';
  original: string;
  enhanced: string;
  reason: string;
  accepted: boolean | null;
  position?: number;
}

interface ScriptEditorTabProps {
  savedScripts: SavedScript[];
  onSaveScript: (script: SavedScript) => void;
  onDeleteScript: (id: string) => void;
  onUpdateScript: (id: string, updates: Partial<SavedScript>) => void;
  onSaveVoiceover: (url: string, name: string, scriptId?: string) => void;
  savedVoiceovers: Array<{ id: string; name: string; url?: string; scriptId?: string }>;
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
  savedVoiceovers
}: ScriptEditorTabProps) {
  // Script Selection & Content State
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [scriptName, setScriptName] = useState('');
  const [scriptContent, setScriptContent] = useState('');
  const [scriptType, setScriptType] = useState<'video' | 'audio'>('video');
  const [isNewScript, setIsNewScript] = useState(true);
  
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
  } | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Enhancement State
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementChanges, setEnhancementChanges] = useState<EnhancementChange[]>([]);
  const [showEnhancementReview, setShowEnhancementReview] = useState(false);
  const [reviewProgress, setReviewProgress] = useState(0);
  
  // Draft State
  const [hasDraft, setHasDraft] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastDraftSave, setLastDraftSave] = useState<Date | null>(null);
  
  // TTS State
  const [showTTSOptions, setShowTTSOptions] = useState(false);
  const [ttsProvider, setTtsProvider] = useState<'openai' | 'elevenlabs'>('elevenlabs');
  const [ttsVoice, setTtsVoice] = useState('');
  
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
  
  // Set default TTS voice based on provider
  useEffect(() => {
    if (ttsProvider === 'openai') {
      setTtsVoice(OPENAI_VOICES[0]?.value || 'alloy');
    } else {
      setTtsVoice(ELEVENLABS_VOICES[0]?.value || 'aria');
    }
  }, [ttsProvider]);
  
  // Analyze Script
  const handleAnalyze = async () => {
    if (!scriptContent.trim()) {
      toast.error('Please enter script content first');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-script', {
        body: { scriptContent, mode: 'analyze' }
      });
      
      if (error) throw error;
      
      if (data?.success && data.data) {
        const recommendations = (data.data.recommendations || []).map((rec: any, i: number) => ({
          ...rec,
          id: `rec-${i}`,
          accepted: null
        }));
        
        setAnalysisResult({
          stats: data.data.stats || stats,
          recommendations
        });
        setShowAnalysis(true);
        toast.success(`Analysis complete! Found ${recommendations.length} recommendations.`);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      // Fallback to local analysis
      const localRecommendations: AnalysisRecommendation[] = [];
      
      if (stats.readabilityScore === 'difficult') {
        localRecommendations.push({
          id: 'rec-readability',
          type: 'readability',
          severity: 'warning',
          title: 'Complex sentences detected',
          description: 'Consider breaking long sentences into shorter ones for easier voiceover delivery.',
          accepted: null
        });
      }
      
      if (stats.wordCount > 500) {
        localRecommendations.push({
          id: 'rec-length',
          type: 'length',
          severity: 'info',
          title: 'Script is quite long',
          description: `At ${stats.estimatedSpeakingMinutes} minutes, consider if this needs to be split into sections.`,
          accepted: null
        });
      }
      
      // Check for missing pauses
      if (!scriptContent.includes('...') && !scriptContent.includes('—')) {
        localRecommendations.push({
          id: 'rec-pacing',
          type: 'pacing',
          severity: 'suggestion',
          title: 'Consider adding natural pauses',
          description: 'Use "..." for pauses to give viewers time to absorb information.',
          accepted: null
        });
      }
      
      setAnalysisResult({
        stats,
        recommendations: localRecommendations
      });
      setShowAnalysis(true);
      toast.success('Analysis complete!');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Enhance Script
  const handleEnhance = async () => {
    if (!scriptContent.trim()) {
      toast.error('Please enter script content first');
      return;
    }
    
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-script', {
        body: { scriptContent, mode: 'enhance' }
      });
      
      if (error) throw error;
      
      if (data?.success && data.data) {
        const enhanced = data.data.enhancedScript || '';
        const clean = data.data.cleanScript || enhanced.replace(/\.\.\./g, '. ').replace(/—/g, ', ');
        const changes = (data.data.changes || []).map((change: any, i: number) => ({
          ...change,
          id: `change-${i}`,
          accepted: null
        }));
        
        setOriginalContent(scriptContent);
        setEnhancedContent(enhanced);
        setCleanTTSContent(clean);
        setEnhancementChanges(changes);
        setShowEnhancementReview(true);
        setReviewProgress(0);
        
        toast.success(`Enhancement complete! ${changes.length} changes suggested.`);
      }
    } catch (err) {
      console.error('Enhancement error:', err);
      toast.error('Enhancement failed. Please try again.');
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
    
    const result = await generateTTS({
      provider: ttsProvider,
      voice: ttsVoice,
      text: textForTTS
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
                <p className="text-sm text-muted-foreground">Create, analyze, and enhance your scripts</p>
              </div>
            </div>
            <Button onClick={handleNewScript} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Script
            </Button>
          </div>
          
          {/* Script Selection */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Video Scripts ({videoScripts.length})</Label>
              <Select
                value={selectedScriptId && videoScripts.find(s => s.id === selectedScriptId) ? selectedScriptId : ''}
                onValueChange={(v) => { if (v) handleSelectScript(v); }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a video script..." />
                </SelectTrigger>
                <SelectContent>
                  {videoScripts.map(script => (
                    <SelectItem key={script.id} value={script.id}>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-red-500" />
                        <span>{script.name}</span>
                        {script.enhancedContent && <Badge variant="outline" className="text-xs">Enhanced</Badge>}
                        {script.draftStatus === 'in_progress' && <Badge variant="secondary" className="text-xs">Draft</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Audio Scripts ({audioScripts.length})</Label>
              <Select
                value={selectedScriptId && audioScripts.find(s => s.id === selectedScriptId) ? selectedScriptId : ''}
                onValueChange={(v) => { if (v) handleSelectScript(v); }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an audio script..." />
                </SelectTrigger>
                <SelectContent>
                  {audioScripts.map(script => (
                    <SelectItem key={script.id} value={script.id}>
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-purple-500" />
                        <span>{script.name}</span>
                        {script.enhancedContent && <Badge variant="outline" className="text-xs">Enhanced</Badge>}
                        {script.draftStatus === 'in_progress' && <Badge variant="secondary" className="text-xs">Draft</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
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
              onClick={handleEnhance}
            >
              {isEnhancing ? (
                <Loader2 className="h-6 w-6 mx-auto mb-2 text-purple-500 animate-spin" />
              ) : (
                <Wand2 className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              )}
              <span className="text-sm font-medium">AI Enhance</span>
              <p className="text-xs text-muted-foreground mt-1">Improve script</p>
            </div>
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
            <div 
              className="p-4 rounded-lg border bg-muted/50 border-border/50 hover:border-primary/50 cursor-pointer transition-all text-center"
              onClick={handleSaveScript}
            >
              <Save className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">Save Script</span>
              <p className="text-xs text-muted-foreground mt-1">Store to library</p>
            </div>
          </div>
          
          {/* TTS Options Panel */}
          <Collapsible open={showTTSOptions} onOpenChange={setShowTTSOptions}>
            <CollapsibleContent className="mb-6 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-green-500" />
                  TTS Generation Options
                </h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label>Provider</Label>
                  <Select value={ttsProvider} onValueChange={(v: 'openai' | 'elevenlabs') => setTtsProvider(v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elevenlabs">ElevenLabs (Premium)</SelectItem>
                      <SelectItem value="openai">OpenAI (Standard)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Voice</Label>
                  <Select value={ttsVoice} onValueChange={setTtsVoice}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(ttsProvider === 'openai' ? OPENAI_VOICES : ELEVENLABS_VOICES).map(voice => (
                        <SelectItem key={voice.value} value={voice.value}>{voice.label}</SelectItem>
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
                <div className="mb-4">
                  <Label className="text-xs text-muted-foreground mb-2 block">Generate TTS from:</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant={activeVersion === 'original' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setActiveVersion('original')}
                    >
                      Original ({originalStats?.wordCount || stats.wordCount} words)
                    </Button>
                    <Button 
                      variant={activeVersion === 'enhanced' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setActiveVersion('enhanced')}
                    >
                      Enhanced ({enhancedStats?.wordCount || 0} words)
                    </Button>
                  </div>
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
          
          {/* Analysis Results */}
          {showAnalysis && analysisResult && (
            <div className="mb-6 p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-500" />
                  Script Analysis
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAnalysis(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
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
                  <ScrollArea className="max-h-64">
                    <div className="space-y-2 pr-4">
                      {analysisResult.recommendations.map(rec => (
                        <div 
                          key={rec.id}
                          className={cn(
                            "p-3 rounded-lg border flex items-start gap-3",
                            rec.severity === 'warning' && "border-orange-500/30 bg-orange-500/5",
                            rec.severity === 'suggestion' && "border-purple-500/30 bg-purple-500/5",
                            rec.severity === 'info' && "border-border bg-background"
                          )}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs capitalize">{rec.type}</Badge>
                              {rec.severity === 'warning' && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                            </div>
                            <p className="font-medium text-sm">{rec.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                            {rec.suggestedText && (
                              <div className="mt-2 p-2 rounded bg-green-500/10 text-xs">
                                <span className="text-green-600">Suggestion: </span>
                                {rec.suggestedText}
                              </div>
                            )}
                          </div>
                          {rec.accepted === null && (
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2"
                                onClick={() => setAnalysisResult(prev => prev ? {
                                  ...prev,
                                  recommendations: prev.recommendations.map(r => 
                                    r.id === rec.id ? { ...r, accepted: true } : r
                                  )
                                } : null)}
                              >
                                <Check className="h-3 w-3 text-green-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2"
                                onClick={() => setAnalysisResult(prev => prev ? {
                                  ...prev,
                                  recommendations: prev.recommendations.map(r => 
                                    r.id === rec.id ? { ...r, accepted: false } : r
                                  )
                                } : null)}
                              >
                                <X className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          )}
                          {rec.accepted !== null && (
                            <Badge variant={rec.accepted ? 'default' : 'secondary'} className="text-xs shrink-0">
                              {rec.accepted ? 'Noted' : 'Dismissed'}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>Script looks great! No major issues found.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Enhancement Review Panel */}
          {showEnhancementReview && enhancedContent && (
            <div className="mb-6 p-4 rounded-lg border border-purple-500/30 bg-purple-500/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-500" />
                  Review AI Enhancements
                </h3>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSavingDraft}>
                    {isSavingDraft ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                    Save Draft
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowEnhancementReview(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
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
              <ScrollArea className="max-h-72 mb-4">
                <div className="space-y-3 pr-4">
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
                              className="h-7 px-2"
                              onClick={() => handleAcceptChange(change.id)}
                            >
                              <Check className="h-3 w-3 text-green-500 mr-1" />
                              Accept
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2"
                              onClick={() => handleSkipChange(change.id)}
                            >
                              <X className="h-3 w-3 text-red-500 mr-1" />
                              Skip
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
              </ScrollArea>
              
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
            <div className="grid md:grid-cols-2 gap-4">
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
                        Audio Script (Podcast/Voiceover)
                      </div>
                    </SelectItem>
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
              <Textarea
                id="script-content"
                value={activeVersion === 'enhanced' && enhancedContent ? enhancedContent : scriptContent}
                onChange={(e) => {
                  if (activeVersion === 'enhanced') {
                    setEnhancedContent(e.target.value);
                  } else {
                    setScriptContent(e.target.value);
                  }
                }}
                placeholder="Start writing your script here... Use '...' for pauses in speech."
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
                onClick={handleEnhance}
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedScripts.map(script => (
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
                    <div className="flex items-center gap-2">
                      {script.type === 'video' ? (
                        <Video className="h-4 w-4 text-red-500" />
                      ) : (
                        <Mic className="h-4 w-4 text-purple-500" />
                      )}
                      <h4 className="font-medium truncate">{script.name}</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
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
                        Has TTS
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(script.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
