/**
 * VibeMeetingIntelligence - Thin wrapper around existing MeetingTranscriptPanel
 * 
 * REFACTORED: Uses existing MeetingTranscriptPanel to avoid duplication (~400 lines saved)
 * - Integrates useMeetingIntelligence hook
 * - Adapts props for Genie Vibe context
 * - Responsive: Collapsible on mobile
 */

import React, { useState, useCallback } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageSquare, ChevronDown, ChevronUp, Radio, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { MeetingTranscriptPanel } from '@/components/meeting/MeetingTranscriptPanel';
import { useMeetingIntelligence } from '@/hooks/useMeetingIntelligence';

interface VibeMeetingIntelligenceProps {
  isRecording: boolean;
  onTranscriptionStateChange?: (isTranscribing: boolean) => void;
  className?: string;
}

export function VibeMeetingIntelligence({
  isRecording,
  onTranscriptionStateChange,
  className,
}: VibeMeetingIntelligenceProps) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  
  // Use the existing hook
  const meeting = useMeetingIntelligence();
  
  // Handle start/stop with callback
  const handleStartRecording = useCallback(async () => {
    await meeting.startTranscription({ provider: 'browser' });
    onTranscriptionStateChange?.(true);
  }, [meeting, onTranscriptionStateChange]);
  
  const handleStopRecording = useCallback(async () => {
    await meeting.stopTranscription();
    onTranscriptionStateChange?.(false);
  }, [meeting, onTranscriptionStateChange]);
  
  const handleAddNote = useCallback((note: string) => {
    meeting.addManualNote(note);
  }, [meeting]);

  // Mobile: Compact collapsible view
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
            <div className="p-3 pt-0 space-y-2">
              {/* Quick Controls */}
              <div className="flex gap-2">
                {!meeting.isRecording ? (
                  <Button
                    size="sm"
                    onClick={handleStartRecording}
                    disabled={meeting.isProcessing}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    <Mic className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleStopRecording}
                    className="flex-1"
                  >
                    <MicOff className="h-3 w-3 mr-1" />
                    Stop
                  </Button>
                )}
              </div>
              
              {/* Compact Transcript */}
              <ScrollArea className="h-28">
                {meeting.transcript.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">
                    {meeting.isRecording ? 'Listening...' : 'Start to capture speech'}
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {meeting.transcript.slice(-5).map((segment) => (
                      <p key={segment.id} className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{segment.speaker}:</span> {segment.text}
                      </p>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  // Desktop: Use the full existing MeetingTranscriptPanel
  return (
    <MeetingTranscriptPanel
      isRecording={meeting.isRecording}
      isPaused={meeting.isPaused}
      isProcessing={meeting.isProcessing}
      transcript={meeting.transcript}
      summary={meeting.summary}
      recordingDuration={meeting.recordingDuration}
      audioLevel={meeting.audioLevel}
      currentProvider={meeting.currentProvider}
      onStartRecording={handleStartRecording}
      onStopRecording={handleStopRecording}
      onPauseRecording={meeting.pauseTranscription}
      onResumeRecording={meeting.resumeTranscription}
      onGenerateSummary={() => meeting.generateSummary()}
      onExportTranscript={meeting.exportTranscript}
      onAddNote={handleAddNote}
      className={cn('h-full', className)}
    />
  );
}

export default VibeMeetingIntelligence;
