/**
 * Smart Editing Sidebar
 * Flexible checklist for advanced users
 * Works on both mobile and desktop
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Upload,
  Music,
  Wand2,
  ArrowRightLeft,
  Download,
  Sparkles,
  Lightbulb,
  ArrowRight,
  MessageCircle,
  Zap,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimelineClip } from './MultiClipTimeline';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isComplete: boolean;
  isRecommended: boolean;
  estimatedTime: string;
  tips: string[];
}

interface SmartEditingSidebarProps {
  clips: TimelineClip[];
  hasMusic: boolean;
  hasArrangement: boolean;
  hasTransitions: boolean;
  onItemAction: (itemId: string) => void;
  onAskAI: (context: string) => void;
  className?: string;
}

export const SmartEditingSidebar: React.FC<SmartEditingSidebarProps> = ({
  clips,
  hasMusic,
  hasArrangement,
  hasTransitions,
  onItemAction,
  onAskAI,
  className,
}) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const videoClips = clips.filter(c => c.type === 'video');
  const hasEnoughClips = videoClips.length >= 2;

  const checklistItems: ChecklistItem[] = [
    {
      id: 'import',
      title: 'Add video clips',
      description: `${videoClips.length} clips added${videoClips.length < 2 ? ' (need 2+)' : ''}`,
      icon: <Upload className="h-4 w-4" />,
      isComplete: hasEnoughClips,
      isRecommended: !hasEnoughClips,
      estimatedTime: '1-2 min',
      tips: [
        'Drag & drop multiple clips at once',
        'Long-press to preview before adding',
        'AI works best with 3-10 clips',
      ],
    },
    {
      id: 'music',
      title: 'Upload music track',
      description: hasMusic ? 'Beat sync enabled' : 'Optional for beat sync',
      icon: <Music className="h-4 w-4" />,
      isComplete: hasMusic,
      isRecommended: hasEnoughClips && !hasMusic,
      estimatedTime: '30 sec',
      tips: [
        'AI detects BPM automatically',
        'Works with MP3, WAV, M4A',
        'Skip if you want manual timing',
      ],
    },
    {
      id: 'arrange',
      title: 'Run AI arrangement',
      description: hasArrangement ? 'Clips arranged' : 'Auto-order clips',
      icon: <Wand2 className="h-4 w-4" />,
      isComplete: hasArrangement,
      isRecommended: hasEnoughClips && hasMusic && !hasArrangement,
      estimatedTime: '5 sec',
      tips: [
        'Story Mode: intro → content → outro',
        'Fast Cuts: energetic social content',
        'Relaxed: longer, contemplative pacing',
      ],
    },
    {
      id: 'transitions',
      title: 'Add smart transitions',
      description: hasTransitions ? 'Transitions applied' : 'AI suggests transitions',
      icon: <ArrowRightLeft className="h-4 w-4" />,
      isComplete: hasTransitions,
      isRecommended: hasArrangement && !hasTransitions,
      estimatedTime: '10 sec',
      tips: [
        'Dissolve: smooth scene changes',
        'Cut: fast-paced content',
        'Fade: context shifts',
      ],
    },
    {
      id: 'export',
      title: 'Preview & export',
      description: 'Finalize your video',
      icon: <Download className="h-4 w-4" />,
      isComplete: false,
      isRecommended: hasTransitions,
      estimatedTime: '1-3 min',
      tips: [
        'Preview before exporting',
        'Choose resolution (720p-4K)',
        'Direct share to social media',
      ],
    },
  ];

  const completedCount = checklistItems.filter(i => i.isComplete).length;
  const progress = (completedCount / checklistItems.length) * 100;
  const recommendedItem = checklistItems.find(i => i.isRecommended && !i.isComplete);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Quick Edit Checklist
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {completedCount}/{checklistItems.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-1.5 mt-2" />
      </CardHeader>

      <CardContent className="px-3 pb-3 space-y-2">
        {/* Recommended Next Action */}
        {recommendedItem && (
          <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg mb-3">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-medium text-primary">Recommended Next</span>
            </div>
            <Button
              size="sm"
              className="w-full h-8 text-xs"
              onClick={() => onItemAction(recommendedItem.id)}
            >
              {recommendedItem.icon}
              <span className="ml-2">{recommendedItem.title}</span>
              <ArrowRight className="h-3 w-3 ml-auto" />
            </Button>
          </div>
        )}

        {/* Checklist Items */}
        <div className="space-y-1">
          {checklistItems.map((item) => (
            <Collapsible
              key={item.id}
              open={expandedItem === item.id}
              onOpenChange={(open) => setExpandedItem(open ? item.id : null)}
            >
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left",
                    item.isComplete 
                      ? "bg-green-500/10 hover:bg-green-500/15" 
                      : item.isRecommended 
                        ? "bg-primary/5 hover:bg-primary/10 ring-1 ring-primary/20"
                        : "bg-muted/30 hover:bg-muted/50"
                  )}
                >
                  {item.isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-xs font-medium truncate",
                      item.isComplete && "line-through text-muted-foreground"
                    )}>
                      {item.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {item.estimatedTime}
                    </span>
                    {expandedItem === item.id ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="pl-6 pr-2 py-2 space-y-2">
                  {/* Tips */}
                  <div className="space-y-1">
                    {item.tips.map((tip, index) => (
                      <p key={index} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary">•</span>
                        {tip}
                      </p>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant={item.isComplete ? "outline" : "default"}
                      className="flex-1 h-7 text-[10px]"
                      onClick={() => onItemAction(item.id)}
                    >
                      {item.isComplete ? 'Modify' : 'Start'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[10px]"
                      onClick={() => onAskAI(`Help me with ${item.title}`)}
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Ask AI
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        {/* Quick AI Help */}
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => onAskAI('What should I do next?')}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          <span className="text-xs">Ask AI: What's next?</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default SmartEditingSidebar;
