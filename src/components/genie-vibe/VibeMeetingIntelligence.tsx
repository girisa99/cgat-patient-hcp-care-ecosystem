/**
 * VibeMeetingIntelligence - Meeting Transcript Panel for Genie Vibe
 * 
 * Integrates useMeetingIntelligence hook with VibeRecordTab
 * Features:
 * - Live transcription during recording
 * - Speaker identification
 * - Real-time transcript display
 * - Meeting summary generation
 * - Action items extraction
 * - Transcript export
 */

import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Mic,
  MicOff,
  Pause,
  Play,
  Download,
  FileText,
  Sparkles,
  Clock,
  Users,
  CheckCircle2,
  ListTodo,
  MessageSquare,
  Volume2,
  Copy,
  ChevronDown,
  ChevronUp,
  Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMeetingIntelligence, TranscriptSegment, MeetingSummary } from '@/hooks/useMeetingIntelligence';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface VibeMeetingIntelligenceProps {
  isRecording: boolean;
  onTranscriptionStateChange?: (isTranscribing: boolean) => void;
  className?: string;
}

const SPEAKER_COLORS: Record<string, string> = {
  'Speaker': 'bg-blue-500',
  'Speaker 1': 'bg-blue-500',
  'Speaker 2': 'bg-green-500',
  'Speaker 3': 'bg-purple-500',
  'Speaker 4': 'bg-orange-500',
  'Note': 'bg-amber-500',
  'Host': 'bg-pink-500',
  'Guest': 'bg-cyan-500',
};

export function VibeMeetingIntelligence({
  isRecording,
  onTranscriptionStateChange,
  className,
}: VibeMeetingIntelligenceProps) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary'>('transcript');

  const meeting = useMeetingIntelligence();

  // Format duration
  const formatDuration = useCallback((seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
  }, []);

  // Handle start transcription
  const handleStartTranscription = useCallback(async () => {
    await meeting.startTranscription({ provider: 'browser' });
    onTranscriptionStateChange?.(true);
  }, [meeting, onTranscriptionStateChange]);

  // Handle stop transcription
  const handleStopTranscription = useCallback(async () => {
    await meeting.stopTranscription();
    onTranscriptionStateChange?.(false);
  }, [meeting, onTranscriptionStateChange]);

  // Handle export
  const handleExport = useCallback((format: 'txt' | 'json' | 'srt') => {
    const content = meeting.exportTranscript(format);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${new Date().toISOString().slice(0, 10)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Transcript exported as ${format.toUpperCase()}`);
  }, [meeting]);

  // Handle copy
  const handleCopy = useCallback(() => {
    const content = meeting.exportTranscript('txt');
    navigator.clipboard.writeText(content);
    toast.success('Transcript copied to clipboard');
  }, [meeting]);

  // Get speaker color
  const getSpeakerColor = (speaker: string): string => {
    return SPEAKER_COLORS[speaker] || 'bg-gray-500';
  };

  // Mobile: Collapsible panel
  if (isMobile) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className={className}>
        <Card className="border-primary/20">
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-2 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Transcription</CardTitle>
                  {meeting.isRecording && (
                    <Badge variant="destructive" className="animate-pulse text-xs">
                      <Radio className="h-2 w-2 mr-1" />
                      Live
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {meeting.transcript.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {meeting.transcript.length}
                    </Badge>
                  )}
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              {/* Quick Controls */}
              <div className="flex items-center gap-2">
                {!meeting.isRecording ? (
                  <Button
                    size="sm"
                    onClick={handleStartTranscription}
                    disabled={meeting.isProcessing}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    <Mic className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={meeting.isPaused ? meeting.resumeTranscription : meeting.pauseTranscription}
                      className="flex-1"
                    >
                      {meeting.isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleStopTranscription}
                      className="flex-1"
                    >
                      <MicOff className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>

              {/* Compact Transcript */}
              <ScrollArea className="h-32">
                {meeting.transcript.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {meeting.isRecording ? 'Listening...' : 'Start transcription to capture speech'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {meeting.transcript.slice(-5).map((segment) => (
                      <div key={segment.id} className="flex gap-2 text-xs">
                        <div className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shrink-0',
                          getSpeakerColor(segment.speaker)
                        )}>
                          {segment.speaker.charAt(0)}
                        </div>
                        <p className="text-muted-foreground">{segment.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  // Desktop: Full panel
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Meeting Intelligence
            </CardTitle>
            {meeting.isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                LIVE
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(meeting.recordingDuration)}
            </Badge>
            
            {meeting.isRecording && (
              <div className="flex items-center gap-1">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-100"
                    style={{ width: `${meeting.audioLevel}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 pt-3">
          {!meeting.isRecording ? (
            <Button 
              onClick={handleStartTranscription} 
              disabled={meeting.isProcessing}
              className="bg-red-500 hover:bg-red-600"
            >
              <Mic className="h-4 w-4 mr-2" />
              Start Transcription
            </Button>
          ) : (
            <>
              <Button 
                onClick={meeting.isPaused ? meeting.resumeTranscription : meeting.pauseTranscription}
                variant="outline"
              >
                {meeting.isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>
              <Button 
                onClick={handleStopTranscription}
                variant="destructive"
              >
                <MicOff className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => meeting.generateSummary()}
            disabled={meeting.isProcessing || meeting.transcript.length === 0}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Summarize
          </Button>

          <div className="flex-1" />

          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={meeting.transcript.length === 0}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleExport('txt')} disabled={meeting.transcript.length === 0}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'transcript' | 'summary')} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="transcript" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Transcript
            {meeting.transcript.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {meeting.transcript.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transcript" className="flex-1 m-0 p-0">
          <ScrollArea className="h-[300px] px-4">
            <div className="space-y-3 py-4">
              {meeting.transcript.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    {meeting.isRecording 
                      ? 'Listening... speak to see the transcript' 
                      : 'Start transcription to capture speech'}
                  </p>
                  {meeting.currentProvider && (
                    <Badge variant="outline" className="mt-2">
                      Provider: {meeting.currentProvider}
                    </Badge>
                  )}
                </div>
              ) : (
                meeting.transcript.map((segment) => (
                  <div 
                    key={segment.id} 
                    className={cn(
                      'flex gap-3 p-3 rounded-lg transition-colors',
                      !segment.isFinal && 'opacity-70 bg-muted/50',
                      segment.isFinal && 'bg-card hover:bg-muted/30'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0',
                      getSpeakerColor(segment.speaker)
                    )}>
                      {segment.speaker.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{segment.speaker}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(Math.floor(segment.startTime / 1000))}
                        </span>
                        {!segment.isFinal && (
                          <Badge variant="outline" className="text-xs">typing...</Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground/90">{segment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="summary" className="flex-1 m-0 p-4">
          {meeting.summary ? (
            <ScrollArea className="h-[300px]">
              <div className="space-y-6">
                {/* Stats */}
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDuration(meeting.summary.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{meeting.summary.participantCount} participant(s)</span>
                  </div>
                </div>

                {/* Key Points */}
                {meeting.summary.keyPoints.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Key Points
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {meeting.summary.keyPoints.map((point, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-muted-foreground">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Items */}
                {meeting.summary.actionItems.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-blue-500" />
                      Action Items
                    </h4>
                    <ul className="space-y-2">
                      {meeting.summary.actionItems.map((item, i) => (
                        <li key={i} className="text-sm bg-muted/50 p-2 rounded">
                          <p>{item.task}</p>
                          {(item.assignee || item.deadline) && (
                            <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                              {item.assignee && <span>👤 {item.assignee}</span>}
                              {item.deadline && <span>📅 {item.deadline}</span>}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps */}
                {meeting.summary.nextSteps.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Next Steps</h4>
                    <ul className="space-y-1 text-sm">
                      {meeting.summary.nextSteps.map((step, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-blue-500">→</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm text-center">
                Record and click "Summarize"<br />
                to generate AI-powered notes
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}

export default VibeMeetingIntelligence;
