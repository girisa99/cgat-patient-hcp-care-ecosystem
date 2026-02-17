/**
 * MeetingTranscriptPanel - Live transcript display with speaker identification
 * 
 * Features:
 * - Real-time transcript updates
 * - Speaker color coding
 * - Auto-scroll to latest
 * - Export functionality
 * - Summary view
 */

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TranscriptSegment, MeetingSummary } from '@/hooks/useMeetingIntelligence';
import { toast } from 'sonner';

interface MeetingTranscriptPanelProps {
  isRecording: boolean;
  isPaused: boolean;
  isProcessing: boolean;
  transcript: TranscriptSegment[];
  summary: MeetingSummary | null;
  recordingDuration: number;
  audioLevel: number;
  currentProvider: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onGenerateSummary: () => void;
  onExportTranscript: (format: 'txt' | 'json' | 'srt') => string;
  onAddNote: (note: string) => void;
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

export function MeetingTranscriptPanel({
  isRecording,
  isPaused,
  isProcessing,
  transcript,
  summary,
  recordingDuration,
  audioLevel,
  currentProvider,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onGenerateSummary,
  onExportTranscript,
  onAddNote,
  className,
}: MeetingTranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('transcript');
  const [manualNote, setManualNote] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new transcript arrives
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, autoScroll]);

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleExport = (format: 'txt' | 'json' | 'srt') => {
    const content = onExportTranscript(format);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-transcript-${new Date().toISOString().slice(0, 10)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Transcript exported as ${format.toUpperCase()}`);
  };

  const handleCopyTranscript = () => {
    const content = onExportTranscript('txt');
    navigator.clipboard.writeText(content);
    toast.success('Transcript copied to clipboard');
  };

  const handleAddNote = () => {
    if (manualNote.trim()) {
      onAddNote(manualNote.trim());
      setManualNote('');
    }
  };

  const getSpeakerColor = (speaker: string): string => {
    return SPEAKER_COLORS[speaker] || 'bg-gray-500';
  };

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Meeting Intelligence
            </CardTitle>
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                LIVE
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Duration */}
            <Badge variant="outline" className="font-mono">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(recordingDuration)}
            </Badge>
            
            {/* Audio Level Indicator */}
            {isRecording && (
              <div className="flex items-center gap-1">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-100"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 pt-3">
          {!isRecording ? (
            <Button 
              onClick={onStartRecording} 
              disabled={isProcessing}
              className="bg-red-500 hover:bg-red-600"
            >
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <>
              <Button 
                onClick={isPaused ? onResumeRecording : onPauseRecording}
                variant="outline"
              >
                {isPaused ? (
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
                onClick={onStopRecording}
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
            onClick={onGenerateSummary}
            disabled={isProcessing || transcript.length === 0}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Summarize
          </Button>

          <div className="flex-1" />

          <Button variant="ghost" size="sm" onClick={handleCopyTranscript}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleExport('txt')}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="transcript" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Transcript
            {transcript.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {transcript.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transcript" className="flex-1 flex flex-col m-0 p-0">
          <ScrollArea className="flex-1 px-4" ref={scrollRef}>
            <div className="space-y-3 py-4">
              {transcript.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    {isRecording 
                      ? 'Listening... speak to see the transcript' 
                      : 'Start recording to capture the meeting transcript'}
                  </p>
                  {currentProvider && (
                    <Badge variant="outline" className="mt-2">
                      Provider: {currentProvider}
                    </Badge>
                  )}
                </div>
              ) : (
                transcript.map((segment) => (
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

          {/* Manual Note Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                placeholder="Add a manual note..."
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
              />
              <Button 
                onClick={handleAddNote} 
                size="icon"
                disabled={!manualNote.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="flex-1 m-0 p-4">
          {summary ? (
            <ScrollArea className="h-full">
              <div className="space-y-6">
                {/* Stats */}
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDuration(summary.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{summary.participantCount} participant(s)</span>
                  </div>
                </div>

                {/* Key Points */}
                {summary.keyPoints.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Key Points
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {summary.keyPoints.map((point, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-muted-foreground">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Items */}
                {summary.actionItems.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-blue-500" />
                      Action Items
                    </h4>
                    <ul className="space-y-2">
                      {summary.actionItems.map((item, i) => (
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

                {/* Decisions */}
                {summary.decisions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Decisions Made</h4>
                    <ul className="space-y-1 text-sm">
                      {summary.decisions.map((decision, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-green-500">✓</span>
                          {decision}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps */}
                {summary.nextSteps.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Next Steps</h4>
                    <ul className="space-y-1 text-sm">
                      {summary.nextSteps.map((step, i) => (
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
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm text-center">
                Record a meeting and click "Summarize"<br />
                to generate AI-powered meeting notes
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}

export default MeetingTranscriptPanel;
