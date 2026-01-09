/**
 * Segmented Script Editor - Main component for editing segmented scripts
 * Vertical card stack with per-segment editing, TTS, and AI enhancements
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Layers,
  Clock,
  FileText,
  Download,
  Save,
  Wand2,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Globe,
  Video,
  Image as ImageIcon,
  FileText as DocumentIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  ScriptSegment, 
  SegmentedScriptData, 
  AIEnhancementType, 
  TTSOptions,
  BatchTTSProgress,
  SourceType
} from './types';
import { SegmentCard } from './SegmentCard';
import { SegmentTTSPanel } from './SegmentTTSPanel';

interface SegmentedScriptEditorProps {
  scriptData: SegmentedScriptData;
  onScriptUpdate?: (data: SegmentedScriptData) => void;
  onSave?: (data: SegmentedScriptData) => void;
  onExport?: (format: 'txt' | 'json' | 'pdf') => void;
  className?: string;
}

export function SegmentedScriptEditor({
  scriptData,
  onScriptUpdate,
  onSave,
  onExport,
  className,
}: SegmentedScriptEditorProps) {
  const [segments, setSegments] = useState<ScriptSegment[]>(scriptData.segments);
  const [title, setTitle] = useState(scriptData.title);
  const [isEditing, setIsEditing] = useState(false);
  const [playingSegmentId, setPlayingSegmentId] = useState<string | null>(null);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchTTSProgress | null>(null);
  
  const [ttsOptions, setTTSOptions] = useState<TTSOptions>({
    provider: 'elevenlabs',
    voice: 'rachel',
    speed: 1.0,
    stability: 0.5,
    similarityBoost: 0.75,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Get source icon
  const getSourceIcon = () => {
    const icons: Record<SourceType, React.ReactNode> = {
      video: <Video className="h-4 w-4" />,
      url: <Globe className="h-4 w-4" />,
      document: <DocumentIcon className="h-4 w-4" />,
      presentation: <Layers className="h-4 w-4" />,
      image: <ImageIcon className="h-4 w-4" />,
    };
    return icons[scriptData.sourceType] || <FileText className="h-4 w-4" />;
  };

  // Calculate totals
  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);
  const totalWordCount = segments.reduce((sum, s) => sum + s.wordCount, 0);
  const segmentsWithAudio = segments.filter(s => s.audioUrl).length;

  // Update segment narration
  const handleUpdateNarration = useCallback((segmentId: string, narration: string) => {
    setSegments(prev => prev.map(s => {
      if (s.id === segmentId) {
        const wordCount = narration.trim().split(/\s+/).filter(w => w).length;
        const duration = Math.ceil(wordCount / 2.5); // ~150 wpm
        return { ...s, narration, wordCount, duration };
      }
      return s;
    }));
    toast.success('Segment updated');
  }, []);

  // AI Enhancement for single segment
  const handleEnhanceSegment = useCallback(async (
    segmentId: string, 
    enhancementType: AIEnhancementType,
    customInstructions?: string
  ) => {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment) return;

    // Mark as enhancing
    setSegments(prev => prev.map(s => 
      s.id === segmentId ? { ...s, isEnhancing: true } : s
    ));

    try {
      const enhancementPrompts: Record<AIEnhancementType, string> = {
        rewrite: 'Rewrite this text to improve clarity, flow, and engagement while maintaining the same meaning and length.',
        expand: 'Expand this text with more detail, examples, and supporting information. Make it approximately 50% longer.',
        summarize: 'Summarize this text to be more concise while keeping the key points. Reduce length by about 30%.',
        polish: 'Polish this text for professional quality. Improve word choice, eliminate filler words, and enhance impact.',
        transitions: 'Add a smooth transition at the beginning and/or end to connect with adjacent content.',
        brand_voice: 'Rewrite in a professional, trustworthy brand voice suitable for healthcare or enterprise content.',
      };

      const prompt = `${enhancementPrompts[enhancementType]}

${customInstructions ? `Additional instructions: ${customInstructions}\n` : ''}
Original text:
${segment.narration}

Return ONLY the enhanced text, no explanations or formatting.`;

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.0-flash-exp',
          prompt,
          systemPrompt: 'You are a professional script editor. Enhance text while maintaining natural spoken quality for voiceover.',
          action: 'enhance_segment',
        },
      });

      if (error) throw new Error(error.message);

      const enhancedNarration = data.content.trim();
      const wordCount = enhancedNarration.split(/\s+/).filter((w: string) => w).length;
      const duration = Math.ceil(wordCount / 2.5);

      setSegments(prev => prev.map(s => {
        if (s.id === segmentId) {
          return {
            ...s,
            originalNarration: s.originalNarration || s.narration, // Save original
            narration: enhancedNarration,
            wordCount,
            duration,
            isEnhancing: false,
            enhancementApplied: enhancementType,
            audioUrl: undefined, // Clear audio since text changed
            audioBlob: undefined,
          };
        }
        return s;
      }));

      toast.success(`Segment enhanced with "${enhancementType}"`);
    } catch (err) {
      console.error('Enhancement error:', err);
      setSegments(prev => prev.map(s => 
        s.id === segmentId ? { ...s, isEnhancing: false } : s
      ));
      toast.error('Enhancement failed. Please try again.');
    }
  }, [segments]);

  // Revert enhancement
  const handleRevertEnhancement = useCallback((segmentId: string) => {
    setSegments(prev => prev.map(s => {
      if (s.id === segmentId && s.originalNarration) {
        const wordCount = s.originalNarration.split(/\s+/).filter(w => w).length;
        const duration = Math.ceil(wordCount / 2.5);
        return {
          ...s,
          narration: s.originalNarration,
          originalNarration: undefined,
          wordCount,
          duration,
          enhancementApplied: undefined,
          audioUrl: undefined,
          audioBlob: undefined,
        };
      }
      return s;
    }));
    toast.success('Reverted to original');
  }, []);

  // Generate TTS for single segment
  const handleGenerateTTS = useCallback(async (segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment) return;

    setSegments(prev => prev.map(s => 
      s.id === segmentId ? { ...s, isGeneratingTTS: true } : s
    ));

    try {
      const functionName = ttsOptions.provider === 'elevenlabs' 
        ? 'elevenlabs-tts' 
        : 'text-to-speech';

      const body: Record<string, unknown> = {
        text: segment.narration,
        voice: ttsOptions.voice,
        speed: ttsOptions.speed,
      };

      if (ttsOptions.provider === 'elevenlabs') {
        body.stability = ttsOptions.stability;
        body.similarityBoost = ttsOptions.similarityBoost;
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
      });

      if (error) throw new Error(error.message);

      // Create audio URL from base64
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;

      setSegments(prev => prev.map(s => {
        if (s.id === segmentId) {
          return {
            ...s,
            audioUrl,
            isGeneratingTTS: false,
          };
        }
        return s;
      }));

      toast.success('Voice generated');
    } catch (err) {
      console.error('TTS error:', err);
      setSegments(prev => prev.map(s => 
        s.id === segmentId ? { ...s, isGeneratingTTS: false } : s
      ));
      toast.error('Voice generation failed');
    }
  }, [segments, ttsOptions]);

  // Batch generate TTS
  const handleBatchGenerateTTS = useCallback(async () => {
    const segmentsToGenerate = segments.filter(s => !s.audioUrl);
    if (segmentsToGenerate.length === 0) return;

    setIsBatchGenerating(true);
    setBatchProgress({
      total: segmentsToGenerate.length,
      completed: 0,
      failed: 0,
    });

    for (const segment of segmentsToGenerate) {
      setBatchProgress(prev => prev ? { ...prev, currentSegmentId: segment.id } : null);
      
      try {
        await handleGenerateTTS(segment.id);
        setBatchProgress(prev => prev ? { ...prev, completed: prev.completed + 1 } : null);
      } catch (err) {
        setBatchProgress(prev => prev ? { ...prev, failed: prev.failed + 1 } : null);
      }
    }

    setIsBatchGenerating(false);
    toast.success('Batch generation complete');
  }, [segments, handleGenerateTTS]);

  // Play segment audio
  const handlePlaySegment = useCallback((segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment?.audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(segment.audioUrl);
    audioRef.current = audio;
    
    audio.onended = () => setPlayingSegmentId(null);
    audio.play();
    setPlayingSegmentId(segmentId);
  }, [segments]);

  // Stop playing
  const handleStopPlaying = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingSegmentId(null);
  }, []);

  // Download segment audio
  const handleDownloadSegmentAudio = useCallback((segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment?.audioUrl) return;

    const a = document.createElement('a');
    a.href = segment.audioUrl;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_segment_${segment.segmentNumber}.mp3`;
    a.click();
  }, [segments, title]);

  // Preview all segments
  const handlePreviewAll = useCallback(() => {
    // Play segments sequentially
    const segmentsWithAudio = segments.filter(s => s.audioUrl);
    if (segmentsWithAudio.length === 0) return;

    let currentIndex = 0;

    const playNext = () => {
      if (currentIndex >= segmentsWithAudio.length) {
        setPlayingSegmentId(null);
        return;
      }

      const segment = segmentsWithAudio[currentIndex];
      const audio = new Audio(segment.audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        currentIndex++;
        playNext();
      };
      
      audio.play();
      setPlayingSegmentId(segment.id);
    };

    playNext();
  }, [segments]);

  // Download all audio (combined or zip)
  const handleDownloadAll = useCallback(() => {
    segments.filter(s => s.audioUrl).forEach((segment, index) => {
      setTimeout(() => {
        handleDownloadSegmentAudio(segment.id);
      }, index * 500);
    });
  }, [segments, handleDownloadSegmentAudio]);

  // Save script
  const handleSave = useCallback(() => {
    const updatedData: SegmentedScriptData = {
      ...scriptData,
      title,
      segments,
      totalDuration,
      totalWordCount,
      updatedAt: new Date().toISOString(),
    };
    onSave?.(updatedData);
    toast.success('Script saved');
  }, [scriptData, title, segments, totalDuration, totalWordCount, onSave]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {isEditing ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                  className="text-lg font-semibold h-8 w-[300px]"
                  autoFocus
                />
              ) : (
                <CardTitle 
                  className="text-lg cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  {title}
                </CardTitle>
              )}
              <CardDescription className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  {getSourceIcon()}
                  {scriptData.sourceType}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {segments.length} segments
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(totalDuration)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {totalWordCount} words
                </span>
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onExport?.('txt')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Source Info */}
        {(scriptData.sourceUrl || scriptData.detectedType) && (
          <CardContent className="pt-0 pb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              {scriptData.detectedType && (
                <Badge variant="secondary" className="text-xs">
                  {scriptData.detectedType}
                  {scriptData.confidence && ` (${Math.round(scriptData.confidence * 100)}%)`}
                </Badge>
              )}
              {scriptData.scriptFormat && (
                <Badge variant="outline" className="text-xs">
                  {scriptData.scriptFormat.replace(/_/g, ' ')}
                </Badge>
              )}
              {scriptData.sourceUrl && (
                <a 
                  href={scriptData.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate max-w-[300px]"
                >
                  {scriptData.sourceUrl}
                </a>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* TTS Panel */}
      <SegmentTTSPanel
        segments={segments}
        ttsOptions={ttsOptions}
        onTTSOptionsChange={setTTSOptions}
        onGenerateSegment={handleGenerateTTS}
        onGenerateBatch={handleBatchGenerateTTS}
        onPreviewAll={handlePreviewAll}
        onDownloadAll={handleDownloadAll}
        batchProgress={batchProgress || undefined}
        isGeneratingBatch={isBatchGenerating}
      />

      {/* Segments Stack */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Script Segments
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Volume2 className="h-3 w-3 mr-1" />
              {segmentsWithAudio}/{segments.length} with audio
            </Badge>
          </div>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {segments.map((segment) => (
              <SegmentCard
                key={segment.id}
                segment={segment}
                isPlaying={playingSegmentId === segment.id}
                onPlay={() => handlePlaySegment(segment.id)}
                onStop={handleStopPlaying}
                onGenerateTTS={() => handleGenerateTTS(segment.id)}
                onDownloadAudio={() => handleDownloadSegmentAudio(segment.id)}
                onUpdateNarration={(narration) => handleUpdateNarration(segment.id, narration)}
                onEnhance={(type, instructions) => handleEnhanceSegment(segment.id, type, instructions)}
                onRevertEnhancement={() => handleRevertEnhancement(segment.id)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
