/**
 * PROACTIVE EDITING SUGGESTIONS COMPONENT
 * 
 * UI component for displaying proactive editing suggestions.
 * Used in EmbeddedEditorPanel (Wizard Step 7) and standalone editors.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, Sparkles, Check, X, Wand2 } from 'lucide-react';
import { ProactiveEditSuggestion, EditorPriority } from '@/services/proactivePipelineEditorService';
import { cn } from '@/lib/utils';

interface ProactiveEditingSuggestionsProps {
  suggestions: ProactiveEditSuggestion[];
  onApply: (index: number) => void;
  onDismiss: (pipelineId: string) => void;
  compact?: boolean;
  className?: string;
}

const PRIORITY_COLORS: Record<EditorPriority, string> = {
  CRITICAL: 'bg-destructive/10 text-destructive border-destructive/20',
  HIGH: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  MEDIUM: 'bg-primary/10 text-primary border-primary/20',
  LOW: 'bg-muted text-muted-foreground border-muted'
};

const PRIORITY_BADGES: Record<EditorPriority, 'destructive' | 'default' | 'secondary' | 'outline'> = {
  CRITICAL: 'destructive',
  HIGH: 'default',
  MEDIUM: 'secondary',
  LOW: 'outline'
};

export const ProactiveEditingSuggestions: React.FC<ProactiveEditingSuggestionsProps> = ({
  suggestions,
  onApply,
  onDismiss,
  compact = false,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [applyingIdx, setApplyingIdx] = useState<number | null>(null);

  const criticalSuggestions = suggestions.filter(s => s.priority === 'CRITICAL');

  const handleApply = (idx: number) => {
    setApplyingIdx(idx);
    onApply(idx);
    setTimeout(() => setApplyingIdx(null), 1000);
  };

  if (suggestions.length === 0) return null;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge variant="outline" className="gap-1">
          <Sparkles className="h-3 w-3" />
          {suggestions.length} suggestions
        </Badge>
      </div>
    );
  }

  return (
    <Card className={cn("border-primary/20", className)}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">AI Editing Suggestions</CardTitle>
                <Badge variant="secondary">{suggestions.length}</Badge>
                {criticalSuggestions.length > 0 && (
                  <Badge variant="destructive">{criticalSuggestions.length} critical</Badge>
                )}
              </div>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
            <CardDescription className="text-xs mt-1">
              Based on your content, we suggest these improvements
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={suggestion.pipelineId}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      PRIORITY_COLORS[suggestion.priority]
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Wand2 className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{suggestion.pipelineName}</span>
                          <Badge variant={PRIORITY_BADGES[suggestion.priority]} className="text-xs">
                            {suggestion.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{suggestion.reason}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <Button
                        size="sm"
                        variant={suggestion.priority === 'CRITICAL' ? 'destructive' : 'default'}
                        onClick={() => handleApply(idx)}
                        disabled={applyingIdx === idx}
                        className="h-8"
                      >
                        {applyingIdx === idx ? 'Applying...' : <><Check className="h-3 w-3 mr-1" />Apply</>}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDismiss(suggestion.pipelineId)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ProactiveEditingSuggestions;
