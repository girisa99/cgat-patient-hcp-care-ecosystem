/**
 * SCRIPT ENHANCE EDITOR
 * 
 * Inline script editing with AI enhancement suggestions.
 * Automatically triggers audio regeneration when script changes.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Edit2, Check, X, Sparkles, Wand2, RotateCcw,
  Loader2, FileText, MessageSquare, Lightbulb,
  Zap, Copy, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLabelStudioBackground } from '@/services/labelStudioBackgroundService';

interface EnhancementSuggestion {
  type: 'clarity' | 'engagement' | 'brevity' | 'tone' | 'cta';
  original: string;
  suggested: string;
  reason: string;
}

interface ScriptEnhanceEditorProps {
  chapterId: string;
  chapterTitle: string;
  script: string;
  languageCode: string;
  templateContext?: string;
  confidenceScore?: number;
  onScriptChange: (newScript: string) => void;
  onRegenerateAudio?: () => Promise<void>;
  isReadOnly?: boolean;
  className?: string;
}

export const ScriptEnhanceEditor: React.FC<ScriptEnhanceEditorProps> = ({
  chapterId,
  chapterTitle,
  script,
  languageCode,
  templateContext,
  confidenceScore,
  onScriptChange,
  onRegenerateAudio,
  isReadOnly = false,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedScript, setEditedScript] = useState(script);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [suggestions, setSuggestions] = useState<EnhancementSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { recordEvent } = useLabelStudioBackground();

  // Track if script has changed from original
  useEffect(() => {
    setHasChanges(editedScript !== script);
  }, [editedScript, script]);

  // Reset edited script when prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditedScript(script);
    }
  }, [script, isEditing]);

  const handleSave = useCallback(async () => {
    onScriptChange(editedScript);
    setIsEditing(false);
    setHasChanges(false);
    
    // Track edit event
    recordEvent({
      eventType: 'caption_edited', // Using closest matching event type for script edits
      context: {
        product: 'vibe',
        contentType: 'script',
        originalValue: script.substring(0, 100),
        selectedValue: editedScript.substring(0, 100),
        userAction: 'edit',
      },
      metadata: {
        chapterId,
        originalLength: script.length,
        newLength: editedScript.length,
        language: languageCode,
      }
    });

    // Prompt for audio regeneration if text changed significantly
    const changePercent = Math.abs(editedScript.length - script.length) / script.length;
    if (changePercent > 0.1 && onRegenerateAudio) {
      toast.info('Script changed - consider regenerating audio', {
        action: {
          label: 'Regenerate',
          onClick: () => onRegenerateAudio(),
        },
      });
    }
  }, [editedScript, script, onScriptChange, chapterId, languageCode, onRegenerateAudio, recordEvent]);

  const handleCancel = () => {
    setEditedScript(script);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleEnhance = async () => {
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'enhance_script',
          content: editedScript,
          context: {
            chapterTitle,
            language: languageCode,
            template: templateContext,
            currentConfidence: confidenceScore,
          }
        }
      });

      if (error) throw error;

      if (data?.enhancedScript) {
        setEditedScript(data.enhancedScript);
        toast.success('Script enhanced with AI');
        
        recordEvent({
          eventType: 'script_enhancement_accepted',
          context: {
            product: 'vibe',
            contentType: 'script_enhancement',
            userAction: 'accept',
          },
          metadata: {
            chapterId,
            improvements: data.improvements || [],
          }
        });
      }

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Enhancement failed:', err);
      toast.error('Failed to enhance script');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAnalyze = async () => {
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'analyze_script',
          content: editedScript,
          context: {
            language: languageCode,
          }
        }
      });

      if (error) throw error;

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      } else {
        toast.info('No improvement suggestions found');
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      toast.error('Failed to analyze script');
    } finally {
      setIsEnhancing(false);
    }
  };

  const applySuggestion = (suggestion: EnhancementSuggestion) => {
    const newScript = editedScript.replace(suggestion.original, suggestion.suggested);
    setEditedScript(newScript);
    setSuggestions(prev => prev.filter(s => s !== suggestion));
    toast.success(`Applied ${suggestion.type} improvement`);
  };

  const wordCount = editedScript.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadingTime = Math.ceil(wordCount / 150); // 150 wpm average
  const estimatedSpeakingTime = Math.ceil(wordCount / 130); // 130 wpm for speech

  const getSuggestionIcon = (type: EnhancementSuggestion['type']) => {
    switch (type) {
      case 'clarity': return <MessageSquare className="w-3 h-3" />;
      case 'engagement': return <Zap className="w-3 h-3" />;
      case 'brevity': return <FileText className="w-3 h-3" />;
      case 'tone': return <MessageSquare className="w-3 h-3" />;
      case 'cta': return <Lightbulb className="w-3 h-3" />;
      default: return <Sparkles className="w-3 h-3" />;
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Script</span>
          {confidenceScore !== undefined && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px]",
                confidenceScore >= 95 ? "text-green-600 border-green-500/30" :
                confidenceScore >= 80 ? "text-yellow-600 border-yellow-500/30" :
                "text-red-600 border-red-500/30"
              )}
            >
              Quality: {confidenceScore}%
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {!isReadOnly && !isEditing && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="w-3 h-3 mr-1" /> Edit
            </Button>
          )}
          
          {isEditing && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={handleAnalyze}
                disabled={isEnhancing}
              >
                {isEnhancing ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Lightbulb className="w-3 h-3 mr-1" />
                )}
                Analyze
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={handleEnhance}
                disabled={isEnhancing}
              >
                {isEnhancing ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Wand2 className="w-3 h-3 mr-1" />
                )}
                Enhance
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Script Content */}
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editedScript}
            onChange={(e) => setEditedScript(e.target.value)}
            className="min-h-[150px] text-sm font-mono"
            placeholder="Enter your script..."
          />
          
          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>{wordCount} words</span>
              <span>~{estimatedReadingTime} min read</span>
              <span>~{estimatedSpeakingTime} min spoken</span>
            </div>
            {hasChanges && (
              <Badge variant="secondary" className="text-[10px]">Unsaved changes</Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => setEditedScript(script)}
              disabled={!hasChanges}
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Reset
            </Button>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={handleCancel}
              >
                <X className="w-3 h-3 mr-1" /> Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={handleSave}
                disabled={!hasChanges}
              >
                <Save className="w-3 h-3 mr-1" /> Save
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-lg border bg-muted/30 text-sm">
          {script || (
            <span className="text-muted-foreground italic">No script generated yet</span>
          )}
        </div>
      )}

      {/* Suggestions Popover */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="space-y-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" />
              AI Suggestions ({suggestions.length})
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-5 text-[10px]"
              onClick={() => setShowSuggestions(false)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {suggestions.map((suggestion, idx) => (
              <div key={idx} className="p-2 rounded bg-background border text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[9px] capitalize gap-1">
                    {getSuggestionIcon(suggestion.type)}
                    {suggestion.type}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 text-[10px]"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <Check className="w-2 h-2 mr-1" /> Apply
                  </Button>
                </div>
                <p className="text-muted-foreground line-through">{suggestion.original}</p>
                <p className="text-green-700">{suggestion.suggested}</p>
                <p className="text-[10px] text-muted-foreground italic">{suggestion.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptEnhanceEditor;
