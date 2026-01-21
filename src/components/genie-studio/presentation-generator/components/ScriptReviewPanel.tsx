/**
 * Script Review Panel Component
 * Multi-touchpoint workflow for reviewing/editing audio scripts before TTS generation
 * Flow: Review → Edit/Skip/Accept → Generate TTS
 * Follows RecordingStudio pattern for consistency
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Mic,
  Edit3,
  CheckCircle2,
  SkipForward,
  RefreshCw,
  Sparkles,
  Volume2,
  Clock,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Wand2,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface SlideScript {
  slideId: string;
  slideIndex: number;
  slideTitle: string;
  originalScript: string;
  editedScript?: string;
  status: 'pending' | 'accepted' | 'edited' | 'skipped';
  estimatedDuration?: number; // in seconds
  wordCount?: number;
  isExpanded?: boolean;
}

export interface ScriptReviewState {
  scripts: SlideScript[];
  allReviewed: boolean;
  acceptedCount: number;
  editedCount: number;
  skippedCount: number;
  totalDuration: number;
}

interface ScriptReviewPanelProps {
  scripts: SlideScript[];
  onScriptsChange: (scripts: SlideScript[]) => void;
  onConfirmAll: () => void;
  onEnhanceScript: (slideId: string, script: string) => Promise<string | null>;
  onPreviewAudio?: (slideId: string, script: string) => Promise<void>;
  isLoading?: boolean;
  voiceProvider?: string;
  voiceId?: string;
  className?: string;
}

// Utility to count words
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Estimate duration based on speaking rate (150 words/minute)
function estimateDuration(text: string): number {
  const words = countWords(text);
  return Math.ceil((words / 150) * 60); // seconds
}

// Format seconds to mm:ss
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ScriptReviewPanel({
  scripts,
  onScriptsChange,
  onConfirmAll,
  onEnhanceScript,
  onPreviewAudio,
  isLoading,
  voiceProvider,
  voiceId,
  className,
}: ScriptReviewPanelProps) {
  const [expandedSlideId, setExpandedSlideId] = useState<string | null>(null);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState('');
  const [enhancingSlideId, setEnhancingSlideId] = useState<string | null>(null);
  const [previewingSlideId, setPreviewingSlideId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Calculate review state
  const reviewState = useMemo<ScriptReviewState>(() => {
    const accepted = scripts.filter(s => s.status === 'accepted').length;
    const edited = scripts.filter(s => s.status === 'edited').length;
    const skipped = scripts.filter(s => s.status === 'skipped').length;
    const totalDuration = scripts.reduce((sum, s) => {
      const script = s.editedScript || s.originalScript;
      return sum + estimateDuration(script);
    }, 0);

    return {
      scripts,
      allReviewed: accepted + edited + skipped === scripts.length,
      acceptedCount: accepted,
      editedCount: edited,
      skippedCount: skipped,
      totalDuration,
    };
  }, [scripts]);

  // Progress percentage
  const progressPercent = scripts.length > 0
    ? Math.round(((reviewState.acceptedCount + reviewState.editedCount + reviewState.skippedCount) / scripts.length) * 100)
    : 0;

  // Handle accept script
  const handleAccept = useCallback((slideId: string) => {
    onScriptsChange(scripts.map(s =>
      s.slideId === slideId ? { ...s, status: 'accepted' } : s
    ));
    toast.success('Script accepted');
  }, [scripts, onScriptsChange]);

  // Handle skip script (no voiceover for this slide)
  const handleSkip = useCallback((slideId: string) => {
    onScriptsChange(scripts.map(s =>
      s.slideId === slideId ? { ...s, status: 'skipped' } : s
    ));
    toast.info('Voiceover skipped for this slide');
  }, [scripts, onScriptsChange]);

  // Handle edit
  const handleStartEdit = useCallback((slideId: string, currentScript: string) => {
    setEditingSlideId(slideId);
    setEditBuffer(currentScript);
    setExpandedSlideId(slideId);
  }, []);

  const handleSaveEdit = useCallback((slideId: string) => {
    onScriptsChange(scripts.map(s =>
      s.slideId === slideId
        ? { ...s, editedScript: editBuffer, status: 'edited', wordCount: countWords(editBuffer) }
        : s
    ));
    setEditingSlideId(null);
    setEditBuffer('');
    toast.success('Script updated');
  }, [scripts, editBuffer, onScriptsChange]);

  const handleCancelEdit = useCallback(() => {
    setEditingSlideId(null);
    setEditBuffer('');
  }, []);

  // Handle AI enhancement
  const handleEnhance = useCallback(async (slideId: string) => {
    const script = scripts.find(s => s.slideId === slideId);
    if (!script) return;

    setEnhancingSlideId(slideId);
    try {
      const currentScript = script.editedScript || script.originalScript;
      const enhanced = await onEnhanceScript(slideId, currentScript);
      
      if (enhanced) {
        onScriptsChange(scripts.map(s =>
          s.slideId === slideId
            ? { ...s, editedScript: enhanced, status: 'edited', wordCount: countWords(enhanced) }
            : s
        ));
        toast.success('Script enhanced with AI');
      }
    } catch (error) {
      toast.error('Failed to enhance script');
    } finally {
      setEnhancingSlideId(null);
    }
  }, [scripts, onEnhanceScript, onScriptsChange]);

  // Handle audio preview
  const handlePreview = useCallback(async (slideId: string) => {
    if (!onPreviewAudio) return;
    
    const script = scripts.find(s => s.slideId === slideId);
    if (!script) return;

    setPreviewingSlideId(slideId);
    try {
      const currentScript = script.editedScript || script.originalScript;
      await onPreviewAudio(slideId, currentScript);
    } catch (error) {
      toast.error('Failed to preview audio');
    } finally {
      setPreviewingSlideId(null);
    }
  }, [scripts, onPreviewAudio]);

  // Handle copy to clipboard
  const handleCopy = useCallback(async (slideId: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(slideId);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard');
  }, []);

  // Handle accept all pending
  const handleAcceptAll = useCallback(() => {
    onScriptsChange(scripts.map(s =>
      s.status === 'pending' ? { ...s, status: 'accepted' } : s
    ));
    toast.success('All pending scripts accepted');
  }, [scripts, onScriptsChange]);

  // Handle confirm and proceed
  const handleConfirmProceed = useCallback(() => {
    if (reviewState.skippedCount === scripts.length) {
      toast.warning('All slides are skipped - no voiceover will be generated');
    }
    setShowConfirmDialog(false);
    onConfirmAll();
  }, [reviewState.skippedCount, scripts.length, onConfirmAll]);

  return (
    <Card className={cn('border-2', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Script Review
            </CardTitle>
            <CardDescription className="mt-1">
              Review and edit voiceover scripts before recording
            </CardDescription>
          </div>
          
          {/* Voice Provider Badge */}
          {voiceProvider && (
            <Badge variant="outline" className="gap-1">
              <Volume2 className="h-3 w-3" />
              {voiceProvider}
              {voiceId && <span className="text-muted-foreground">/ {voiceId}</span>}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {reviewState.acceptedCount + reviewState.editedCount + reviewState.skippedCount} of {scripts.length} reviewed
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3 w-3" /> {reviewState.acceptedCount}
              </span>
              <span className="flex items-center gap-1 text-blue-600">
                <Edit3 className="h-3 w-3" /> {reviewState.editedCount}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <SkipForward className="h-3 w-3" /> {reviewState.skippedCount}
              </span>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Duration Estimate */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Est. Total Duration: {formatDuration(reviewState.totalDuration)}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAcceptAll}
            disabled={scripts.every(s => s.status !== 'pending')}
            className="h-7 text-xs"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Accept All Pending
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px] pr-2">
          <div className="space-y-3">
            {scripts.map((script, index) => {
              const currentScript = script.editedScript || script.originalScript;
              const isExpanded = expandedSlideId === script.slideId;
              const isEditing = editingSlideId === script.slideId;
              const isEnhancing = enhancingSlideId === script.slideId;
              const isPreviewing = previewingSlideId === script.slideId;
              const duration = estimateDuration(currentScript);
              const words = countWords(currentScript);

              return (
                <div
                  key={script.slideId}
                  className={cn(
                    'rounded-lg border p-3 transition-all',
                    script.status === 'accepted' && 'border-green-500/50 bg-green-50/30 dark:bg-green-950/10',
                    script.status === 'edited' && 'border-blue-500/50 bg-blue-50/30 dark:bg-blue-950/10',
                    script.status === 'skipped' && 'border-muted bg-muted/30 opacity-60',
                    script.status === 'pending' && 'border-border'
                  )}
                >
                  {/* Slide Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] h-5">
                        Slide {index + 1}
                      </Badge>
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {script.slideTitle}
                      </span>
                      {/* Status Badge */}
                      {script.status === 'accepted' && (
                        <Badge className="text-[9px] h-4 bg-green-100 text-green-700 border-green-300">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Accepted
                        </Badge>
                      )}
                      {script.status === 'edited' && (
                        <Badge className="text-[9px] h-4 bg-blue-100 text-blue-700 border-blue-300">
                          <Edit3 className="h-2.5 w-2.5 mr-0.5" /> Edited
                        </Badge>
                      )}
                      {script.status === 'skipped' && (
                        <Badge variant="outline" className="text-[9px] h-4">
                          <SkipForward className="h-2.5 w-2.5 mr-0.5" /> Skipped
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">
                        {words} words • {formatDuration(duration)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setExpandedSlideId(isExpanded ? null : script.slideId)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Script Preview (collapsed) */}
                  {!isExpanded && !isEditing && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {currentScript}
                    </p>
                  )}

                  {/* Expanded View */}
                  {isExpanded && !isEditing && (
                    <div className="space-y-3">
                      <div className="relative bg-muted/50 rounded-md p-3">
                        <p className="text-sm whitespace-pre-wrap">{currentScript}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => handleCopy(script.slideId, currentScript)}
                        >
                          {copiedId === script.slideId ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAccept(script.slideId)}
                          disabled={script.status === 'accepted'}
                          className="h-7 text-xs"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEdit(script.slideId, currentScript)}
                          className="h-7 text-xs"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEnhance(script.slideId)}
                          disabled={isEnhancing}
                          className="h-7 text-xs"
                        >
                          {isEnhancing ? (
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Wand2 className="h-3 w-3 mr-1" />
                          )}
                          AI Polish
                        </Button>
                        {onPreviewAudio && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(script.slideId)}
                            disabled={isPreviewing}
                            className="h-7 text-xs"
                          >
                            {isPreviewing ? (
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Play className="h-3 w-3 mr-1" />
                            )}
                            Preview
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSkip(script.slideId)}
                          className="h-7 text-xs text-muted-foreground"
                        >
                          <SkipForward className="h-3 w-3 mr-1" />
                          Skip
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Editing Mode */}
                  {isEditing && (
                    <div className="space-y-3">
                      <Textarea
                        value={editBuffer}
                        onChange={(e) => setEditBuffer(e.target.value)}
                        placeholder="Edit your script..."
                        className="min-h-[120px] text-sm"
                        autoFocus
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          {countWords(editBuffer)} words • {formatDuration(estimateDuration(editBuffer))}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="h-7 text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(script.slideId)}
                            className="h-7 text-xs"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          {reviewState.skippedCount > 0 && (
            <Alert className="flex-1 mr-4 py-2 border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-xs">
                {reviewState.skippedCount} slide{reviewState.skippedCount > 1 ? 's' : ''} will have no voiceover
              </AlertDescription>
            </Alert>
          )}
          
          <Button
            onClick={() => setShowConfirmDialog(true)}
            disabled={!reviewState.allReviewed || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            Confirm & Generate Audio
          </Button>
        </div>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Confirm Audio Generation
            </DialogTitle>
            <DialogDescription>
              Review your script selections before generating voiceovers
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="text-2xl font-bold text-green-600">{reviewState.acceptedCount}</div>
                <div className="text-xs text-muted-foreground">Accepted</div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div className="text-2xl font-bold text-blue-600">{reviewState.editedCount}</div>
                <div className="text-xs text-muted-foreground">Edited</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-muted-foreground">{reviewState.skippedCount}</div>
                <div className="text-xs text-muted-foreground">Skipped</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Estimated Duration</span>
              </div>
              <span className="font-medium">{formatDuration(reviewState.totalDuration)}</span>
            </div>

            {voiceProvider && (
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Voice Provider</span>
                </div>
                <Badge variant="secondary">{voiceProvider}</Badge>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Go Back
            </Button>
            <Button onClick={handleConfirmProceed} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Voiceovers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/**
 * Hook to manage script review state
 */
export function useScriptReview(initialScripts: SlideScript[]) {
  const [scripts, setScripts] = useState<SlideScript[]>(initialScripts);

  const updateScripts = useCallback((newScripts: SlideScript[]) => {
    setScripts(newScripts);
  }, []);

  const resetScripts = useCallback(() => {
    setScripts(initialScripts.map(s => ({ ...s, status: 'pending', editedScript: undefined })));
  }, [initialScripts]);

  const getConfirmedScripts = useCallback(() => {
    return scripts
      .filter(s => s.status !== 'skipped')
      .map(s => ({
        slideId: s.slideId,
        script: s.editedScript || s.originalScript,
      }));
  }, [scripts]);

  return {
    scripts,
    updateScripts,
    resetScripts,
    getConfirmedScripts,
  };
}

export { countWords, estimateDuration, formatDuration };
