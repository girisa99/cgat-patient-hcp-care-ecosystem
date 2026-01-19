/**
 * Content Context Panel
 * Displays and manages the context from prompts, documents, URLs, and images
 * Ensures AI generation stays aligned with source material
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  FileText,
  Link,
  Image as ImageIcon,
  MessageSquare,
  Upload,
  Trash2,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Eye,
  X,
  FileUp,
  Globe,
  Lightbulb,
  Target,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface ContentSource {
  id: string;
  type: 'prompt' | 'document' | 'url' | 'image';
  content: string;
  fileName?: string;
  fileSize?: number;
  thumbnailUrl?: string;
  extractedText?: string;
  keyTopics?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  wordCount?: number;
  status: 'pending' | 'processing' | 'ready' | 'error';
  relevanceScore?: number;
}

interface ContentContextPanelProps {
  sources: ContentSource[];
  onSourcesChange: (sources: ContentSource[]) => void;
  onAddSource: (type: ContentSource['type']) => void;
  onRemoveSource: (id: string) => void;
  onRefreshContext: () => void;
  isProcessing?: boolean;
  className?: string;
}

export function ContentContextPanel({
  sources,
  onSourcesChange,
  onAddSource,
  onRemoveSource,
  onRefreshContext,
  isProcessing = false,
  className
}: ContentContextPanelProps) {
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [showKeyTopics, setShowKeyTopics] = useState(true);

  const getSourceIcon = (type: ContentSource['type']) => {
    switch (type) {
      case 'prompt': return MessageSquare;
      case 'document': return FileText;
      case 'url': return Globe;
      case 'image': return ImageIcon;
    }
  };

  const getStatusColor = (status: ContentSource['status']) => {
    switch (status) {
      case 'ready': return 'text-green-500';
      case 'processing': return 'text-amber-500';
      case 'error': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: ContentSource['status']) => {
    switch (status) {
      case 'ready': return CheckCircle2;
      case 'processing': return RefreshCw;
      case 'error': return AlertCircle;
      default: return Eye;
    }
  };

  // Aggregate key topics from all sources
  const allKeyTopics = sources
    .flatMap(s => s.keyTopics || [])
    .filter((topic, index, self) => self.indexOf(topic) === index)
    .slice(0, 10);

  // Calculate overall context strength
  const contextStrength = Math.min(100, sources.reduce((acc, s) => {
    if (s.status === 'ready') {
      return acc + (s.relevanceScore || 25);
    }
    return acc;
  }, 0));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Context Strength */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Content Context</h3>
            <p className="text-sm text-muted-foreground">
              {sources.length} source{sources.length !== 1 ? 's' : ''} loaded
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Context Strength</p>
            <p className="text-sm font-semibold text-foreground">{contextStrength}%</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefreshContext}
            disabled={isProcessing}
          >
            <RefreshCw className={cn("h-4 w-4", isProcessing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Context Strength Bar */}
      <div className="space-y-1">
        <Progress value={contextStrength} className="h-2" />
        <p className="text-xs text-muted-foreground text-center">
          {contextStrength < 30 && "Add more context for better results"}
          {contextStrength >= 30 && contextStrength < 70 && "Good context - AI will generate relevant content"}
          {contextStrength >= 70 && "Excellent context - AI has strong direction"}
        </p>
      </div>

      {/* Add Source Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { type: 'prompt' as const, label: 'Prompt', icon: MessageSquare },
          { type: 'document' as const, label: 'Document', icon: FileUp },
          { type: 'url' as const, label: 'URL', icon: Globe },
          { type: 'image' as const, label: 'Image', icon: ImageIcon }
        ].map(({ type, label, icon: Icon }) => (
          <Button
            key={type}
            variant="outline"
            size="sm"
            className="h-auto py-2 flex-col gap-1"
            onClick={() => onAddSource(type)}
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>

      {/* Source List */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Active Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {sources.length === 0 ? (
            <div className="text-center py-6">
              <div className="p-3 rounded-full bg-muted w-fit mx-auto mb-2">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No sources added yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add prompts, documents, URLs, or images to provide context
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {sources.map(source => {
                  const Icon = getSourceIcon(source.type);
                  const StatusIcon = getStatusIcon(source.status);
                  const isExpanded = expandedSource === source.id;
                  
                  return (
                    <Collapsible
                      key={source.id}
                      open={isExpanded}
                      onOpenChange={() => setExpandedSource(isExpanded ? null : source.id)}
                    >
                      <div className={cn(
                        "rounded-lg border transition-all",
                        isExpanded && "ring-1 ring-primary/30"
                      )}>
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-3 flex items-center gap-3 text-left hover:bg-muted/30 rounded-lg">
                            <div className={cn(
                              "p-2 rounded-lg",
                              source.status === 'ready' ? "bg-green-500/10" : "bg-muted"
                            )}>
                              <Icon className={cn(
                                "h-4 w-4",
                                source.status === 'ready' ? "text-green-600" : "text-muted-foreground"
                              )} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium truncate">
                                  {source.fileName || source.type.charAt(0).toUpperCase() + source.type.slice(1)}
                                </p>
                                <StatusIcon className={cn("h-3 w-3", getStatusColor(source.status))} />
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {source.content.slice(0, 50)}...
                              </p>
                            </div>
                            
                            {source.relevanceScore && (
                              <Badge variant="outline" className="text-[10px]">
                                {source.relevanceScore}%
                              </Badge>
                            )}
                            
                            <ChevronDown className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform",
                              isExpanded && "rotate-180"
                            )} />
                          </button>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="px-3 pb-3 space-y-3">
                            <div className="p-2 rounded bg-muted/50">
                              <p className="text-xs text-foreground line-clamp-4">
                                {source.extractedText || source.content}
                              </p>
                            </div>
                            
                            {source.keyTopics && source.keyTopics.length > 0 && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Key Topics</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {source.keyTopics.map(topic => (
                                    <Badge key={topic} variant="secondary" className="text-[10px]">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                {source.wordCount && <span>{source.wordCount} words</span>}
                                {source.fileSize && <span>{(source.fileSize / 1024).toFixed(1)}KB</span>}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-destructive hover:text-destructive"
                                onClick={() => onRemoveSource(source.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Aggregated Key Topics */}
      {allKeyTopics.length > 0 && (
        <Collapsible open={showKeyTopics} onOpenChange={setShowKeyTopics}>
          <Card>
            <CollapsibleTrigger asChild>
              <button className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Detected Topics</p>
                    <p className="text-xs text-muted-foreground">{allKeyTopics.length} topics extracted</p>
                  </div>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showKeyTopics && "rotate-180")} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {allKeyTopics.map(topic => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  AI will use these topics to generate relevant, contextual content
                </p>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
}
