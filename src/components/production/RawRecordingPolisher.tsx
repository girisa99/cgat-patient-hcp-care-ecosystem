/**
 * Raw Recording Polisher - P1 #11
 * 
 * Transcribes raw recordings, cleans them, and enables section re-recording.
 * Flow: Raw Recording → Transcribe → Polish → Re-record sections
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mic,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Wand2,
  CheckCircle,
  AlertCircle,
  Clock,
  Volume2,
  Edit3,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
  speaker?: string;
  needsReRecord: boolean;
  issues: SegmentIssue[];
}

interface SegmentIssue {
  type: 'filler' | 'stutter' | 'pause' | 'audio_quality' | 'unclear';
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface PolishSuggestion {
  segmentId: string;
  originalText: string;
  suggestedText: string;
  reason: string;
}

interface RawRecordingPolisherProps {
  recordingUrl?: string;
  recordingDuration?: number;
  onPolishComplete?: (segments: TranscriptSegment[]) => void;
  onReRecordRequest?: (segment: TranscriptSegment) => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const RawRecordingPolisher: React.FC<RawRecordingPolisherProps> = ({
  recordingUrl,
  recordingDuration = 0,
  onPolishComplete,
  onReRecordRequest,
  className,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'idle' | 'transcribing' | 'analyzing' | 'polishing' | 'complete'>('idle');
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [suggestions, setSuggestions] = useState<PolishSuggestion[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Mock transcription segments for demo
  const mockSegments: TranscriptSegment[] = [
    {
      id: '1',
      startTime: 0,
      endTime: 5.2,
      text: "Hello everyone, today we're going to talk about...",
      confidence: 0.95,
      speaker: 'Speaker 1',
      needsReRecord: false,
      issues: [],
    },
    {
      id: '2',
      startTime: 5.2,
      endTime: 12.8,
      text: "Um, so basically, uh, the main thing is that we need to, you know, focus on...",
      confidence: 0.78,
      speaker: 'Speaker 1',
      needsReRecord: true,
      issues: [
        { type: 'filler', description: 'Multiple filler words detected', severity: 'medium' },
        { type: 'unclear', description: 'Unclear statement', severity: 'low' },
      ],
    },
    {
      id: '3',
      startTime: 12.8,
      endTime: 20.1,
      text: "The key benefits of our solution include improved efficiency and cost savings.",
      confidence: 0.92,
      speaker: 'Speaker 1',
      needsReRecord: false,
      issues: [],
    },
    {
      id: '4',
      startTime: 20.1,
      endTime: 28.5,
      text: "[long pause] ...and then, uh, we also have the... the integration capabilities.",
      confidence: 0.65,
      speaker: 'Speaker 1',
      needsReRecord: true,
      issues: [
        { type: 'pause', description: 'Awkward pause detected', severity: 'high' },
        { type: 'stutter', description: 'Repetition detected', severity: 'medium' },
      ],
    },
    {
      id: '5',
      startTime: 28.5,
      endTime: 35.0,
      text: "Let me now show you a quick demo of how this works in practice.",
      confidence: 0.94,
      speaker: 'Speaker 1',
      needsReRecord: false,
      issues: [],
    },
  ];

  const mockSuggestions: PolishSuggestion[] = [
    {
      segmentId: '2',
      originalText: "Um, so basically, uh, the main thing is that we need to, you know, focus on...",
      suggestedText: "The main focus should be on...",
      reason: 'Removed filler words and improved clarity',
    },
    {
      segmentId: '4',
      originalText: "[long pause] ...and then, uh, we also have the... the integration capabilities.",
      suggestedText: "Additionally, we offer powerful integration capabilities.",
      reason: 'Removed pause, stutter, and improved flow',
    },
  ];

  const startProcessing = useCallback(async () => {
    setIsProcessing(true);
    setProgress(0);
    setStage('transcribing');

    // Simulate transcription
    for (let i = 0; i <= 40; i++) {
      await new Promise(r => setTimeout(r, 50));
      setProgress(i);
    }

    setStage('analyzing');
    for (let i = 40; i <= 70; i++) {
      await new Promise(r => setTimeout(r, 50));
      setProgress(i);
    }

    setStage('polishing');
    for (let i = 70; i <= 100; i++) {
      await new Promise(r => setTimeout(r, 50));
      setProgress(i);
    }

    setSegments(mockSegments);
    setSuggestions(mockSuggestions);
    setStage('complete');
    setIsProcessing(false);
    onPolishComplete?.(mockSegments);
  }, [onPolishComplete]);

  const handleReRecord = useCallback((segment: TranscriptSegment) => {
    onReRecordRequest?.(segment);
  }, [onReRecordRequest]);

  const applySuggestion = useCallback((suggestion: PolishSuggestion) => {
    setSegments(prev => prev.map(seg => 
      seg.id === suggestion.segmentId 
        ? { ...seg, text: suggestion.suggestedText, needsReRecord: false, issues: [] }
        : seg
    ));
    setSuggestions(prev => prev.filter(s => s.segmentId !== suggestion.segmentId));
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const issuesCount = segments.reduce((sum, seg) => sum + seg.issues.length, 0);
  const needsReRecordCount = segments.filter(s => s.needsReRecord).length;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recording Polisher
        </CardTitle>
        <CardDescription>
          Transcribe, analyze, and polish your raw recordings
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Processing Status */}
        {stage !== 'idle' && stage !== 'complete' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="capitalize">
                {stage === 'transcribing' && 'Transcribing audio...'}
                {stage === 'analyzing' && 'Analyzing for issues...'}
                {stage === 'polishing' && 'Generating suggestions...'}
              </Badge>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Start Button */}
        {stage === 'idle' && (
          <div className="text-center py-8">
            <Wand2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Upload or record audio to begin polishing
            </p>
            <Button onClick={startProcessing} disabled={!recordingUrl && true}>
              <Sparkles className="mr-2 h-4 w-4" />
              Start Polish Process
            </Button>
            {!recordingUrl && (
              <Button onClick={startProcessing} variant="outline" className="ml-2">
                Use Demo Recording
              </Button>
            )}
          </div>
        )}

        {/* Results */}
        {stage === 'complete' && (
          <Tabs defaultValue="transcript" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="suggestions">
                  Suggestions
                  {suggestions.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                      {suggestions.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="issues">
                  Issues
                  {issuesCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                      {issuesCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatTime(recordingDuration || 35)}
                </Badge>
                <Badge variant={needsReRecordCount > 0 ? 'destructive' : 'default'}>
                  {needsReRecordCount} sections need re-record
                </Badge>
              </div>
            </div>

            {/* Transcript Tab */}
            <TabsContent value="transcript">
              <ScrollArea className="h-[400px] border rounded-lg p-4">
                <div className="space-y-3">
                  {segments.map((segment) => (
                    <div
                      key={segment.id}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedSegment === segment.id && "border-primary bg-primary/5",
                        segment.needsReRecord && "border-amber-500/50 bg-amber-500/5",
                        segment.issues.some(i => i.severity === 'high') && "border-red-500/50 bg-red-500/5"
                      )}
                      onClick={() => setSelectedSegment(segment.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                          </Badge>
                          {segment.speaker && (
                            <Badge variant="secondary" className="text-xs">
                              {segment.speaker}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {segment.needsReRecord && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReRecord(segment);
                              }}
                            >
                              <RotateCcw className="mr-1 h-3 w-3" />
                              Re-record
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            {isPlaying && selectedSegment === segment.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm">{segment.text}</p>
                      {segment.issues.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {segment.issues.map((issue, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className={cn(
                                "text-xs",
                                issue.severity === 'high' && "border-red-500 text-red-600",
                                issue.severity === 'medium' && "border-amber-500 text-amber-600",
                                issue.severity === 'low' && "border-slate-400"
                              )}
                            >
                              {issue.type}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Suggestions Tab */}
            <TabsContent value="suggestions">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <Card key={suggestion.segmentId}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Original:</p>
                            <p className="text-sm line-through text-muted-foreground">
                              {suggestion.originalText}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Suggested:</p>
                            <p className="text-sm font-medium text-primary">
                              {suggestion.suggestedText}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                              <Sparkles className="inline mr-1 h-3 w-3" />
                              {suggestion.reason}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReRecord(segments.find(s => s.id === suggestion.segmentId)!)}
                              >
                                <Mic className="mr-1 h-3 w-3" />
                                Re-record Instead
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => applySuggestion(suggestion)}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Apply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {suggestions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p>All suggestions have been applied!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Issues Tab */}
            <TabsContent value="issues">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {segments.filter(s => s.issues.length > 0).map((segment) => (
                    <Card key={segment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline">
                            {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReRecord(segment)}
                          >
                            <RotateCcw className="mr-1 h-3 w-3" />
                            Re-record
                          </Button>
                        </div>
                        <p className="text-sm mb-3">{segment.text}</p>
                        <div className="space-y-2">
                          {segment.issues.map((issue, i) => (
                            <div
                              key={i}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded text-sm",
                                issue.severity === 'high' && "bg-red-500/10 text-red-600",
                                issue.severity === 'medium' && "bg-amber-500/10 text-amber-600",
                                issue.severity === 'low' && "bg-slate-500/10"
                              )}
                            >
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <span className="capitalize font-medium">{issue.type}:</span>
                              <span>{issue.description}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {segments.filter(s => s.issues.length > 0).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p>No issues detected in your recording!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        {/* Action Bar */}
        {stage === 'complete' && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setStage('idle');
              setSegments([]);
              setSuggestions([]);
            }}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Start Over
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                <Volume2 className="mr-2 h-4 w-4" />
                Preview All
              </Button>
              <Button disabled={needsReRecordCount > 0}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Finalize Recording
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RawRecordingPolisher;
