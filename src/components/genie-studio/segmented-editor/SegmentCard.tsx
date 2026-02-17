/**
 * Segment Card - Individual segment in the vertical stack
 * Displays narration with editing, TTS, and AI enhancement controls
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Pause, 
  Volume2, 
  Edit3, 
  Check, 
  X, 
  Loader2,
  Clock,
  FileText,
  Download,
  Wand2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScriptSegment, AIEnhancementType } from './types';
import { SegmentAIEnhancer } from './SegmentAIEnhancer';

interface SegmentCardProps {
  segment: ScriptSegment;
  isPlaying?: boolean;
  isDragging?: boolean;
  onPlay?: () => void;
  onStop?: () => void;
  onGenerateTTS?: () => Promise<void>;
  onDownloadAudio?: () => void;
  onUpdateNarration?: (narration: string) => void;
  onEnhance?: (type: AIEnhancementType, customInstructions?: string) => Promise<void>;
  onRevertEnhancement?: () => void;
  className?: string;
}

export function SegmentCard({
  segment,
  isPlaying = false,
  isDragging = false,
  onPlay,
  onStop,
  onGenerateTTS,
  onDownloadAudio,
  onUpdateNarration,
  onEnhance,
  onRevertEnhancement,
  className,
}: SegmentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [editedNarration, setEditedNarration] = useState(segment.narration);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSaveEdit = () => {
    onUpdateNarration?.(editedNarration);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedNarration(segment.narration);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setEditedNarration(segment.narration);
    setIsEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getSegmentTypeLabel = () => {
    const labels: Record<string, string> = {
      slide: 'Slide',
      chapter: 'Chapter',
      section: 'Section',
      scene: 'Scene',
      step: 'Step',
    };
    return labels[segment.type] || 'Segment';
  };

  return (
    <Card 
      className={cn(
        "group transition-all duration-200",
        isDragging && "shadow-lg ring-2 ring-primary/30",
        !isExpanded && "cursor-pointer",
        className
      )}
    >
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div className="opacity-0 group-hover:opacity-50 cursor-grab active:cursor-grabbing transition-opacity">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          
          {/* Segment Badge */}
          <Badge variant="secondary" className="font-mono text-xs">
            {getSegmentTypeLabel()} {segment.segmentNumber}
          </Badge>
          
          {/* Title */}
          {segment.title && (
            <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {segment.title}
            </span>
          )}
          
          {/* Enhancement Badge */}
          {segment.enhancementApplied && (
            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Enhanced
            </Badge>
          )}
          
          {/* Stats */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(segment.duration)}</span>
            <span className="mx-1">•</span>
            <FileText className="h-3 w-3" />
            <span>{segment.wordCount} words</span>
          </div>
          
          {/* Expand/Collapse */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-3 pt-0 px-4 pb-4">
          {/* Narration Text */}
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                ref={textareaRef}
                value={editedNarration}
                onChange={(e) => setEditedNarration(e.target.value)}
                rows={Math.max(4, Math.ceil(editedNarration.length / 80))}
                className="text-sm resize-none"
                placeholder="Enter narration script..."
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap cursor-text hover:bg-muted/30 rounded p-2 -mx-2 transition-colors"
              onClick={handleStartEdit}
            >
              {segment.narration}
            </div>
          )}

          {/* Visual Notes */}
          {segment.visualNotes && !isEditing && (
            <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
              <span className="font-medium">Visual:</span> {segment.visualNotes}
            </div>
          )}

          {/* AI Enhancer Panel */}
          {showEnhancer && onEnhance && (
            <SegmentAIEnhancer
              segment={segment}
              onEnhance={onEnhance}
              onRevert={segment.originalNarration ? onRevertEnhancement : undefined}
              onClose={() => setShowEnhancer(false)}
            />
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/50 flex-wrap">
            {/* Edit Button */}
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartEdit}
                disabled={segment.isGeneratingTTS || segment.isEnhancing}
                className="text-xs"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}

            {/* AI Enhance Button */}
            {onEnhance && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEnhancer(!showEnhancer)}
                disabled={isEditing || segment.isGeneratingTTS || segment.isEnhancing}
                className="text-xs"
              >
                {segment.isEnhancing ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3 w-3 mr-1" />
                    AI Enhance
                  </>
                )}
              </Button>
            )}

            {/* Generate TTS Button */}
            {!segment.audioUrl && onGenerateTTS && (
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerateTTS}
                disabled={segment.isGeneratingTTS || isEditing}
                className="text-xs"
              >
                {segment.isGeneratingTTS ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3 w-3 mr-1" />
                    Generate Voice
                  </>
                )}
              </Button>
            )}

            {/* Playback Controls */}
            {segment.audioUrl && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isPlaying ? onStop : onPlay}
                  className="text-xs"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3 w-3 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      Play
                    </>
                  )}
                </Button>
                
                {onDownloadAudio && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDownloadAudio}
                    className="text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                )}
              </>
            )}

            {/* Audio Ready Badge */}
            {segment.audioUrl && (
              <Badge 
                variant="outline" 
                className="ml-auto text-xs bg-green-500/10 text-green-600 border-green-500/20"
              >
                <Volume2 className="h-3 w-3 mr-1" />
                Audio Ready
              </Badge>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
