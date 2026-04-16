/**
 * PROMPT ENHANCER — Inline UI for AI-powered prompt improvement
 *
 * Shows real-time quick enhancement as user types.
 * "Enhance" button triggers full AI enhancement with region/format/style context.
 * Displays improvement suggestions, quality score, and regional notes.
 *
 * Integrates with promptEnhancementEngine → enrichment pipeline → ai-universal-processor.
 * Reusable across Cast, Deck, Spark, Mind.
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles, Loader2, ChevronDown, ChevronRight, Check, Wand2,
  Globe, Palette, Eye, Zap, ArrowRight, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  enhancePrompt,
  quickEnhance,
  type PromptContext,
  type PromptEnhancementResult,
  type EnhancedPrompt,
  type EnhancementMode,
} from '@/services/promptEnhancementEngine';

interface PromptEnhancerProps {
  /** Current raw prompt text */
  rawPrompt: string;
  /** Called when user accepts an enhanced prompt */
  onAccept: (enhancedPrompt: string) => void;
  /** Region code for regional context */
  region?: string;
  /** Language code */
  language?: string;
  /** Format name */
  format?: string;
  /** Visual style */
  visualStyle?: string;
  /** Content intent */
  intent?: string;
  /** Brand tone */
  brandTone?: string;
  /** Target audience */
  audience?: string;
  className?: string;
}

const MODE_LABELS: Record<EnhancementMode, { label: string; icon: React.ElementType }> = {
  creative_writing: { label: 'Creative', icon: Sparkles },
  image_generation: { label: 'Visual', icon: Palette },
  video_generation: { label: 'Video', icon: Eye },
  brainstorming: { label: 'Ideation', icon: Zap },
  character_roleplay: { label: 'Character', icon: Globe },
  avatar_presenter: { label: 'Avatar', icon: Globe },
  combination: { label: 'Multi-Modal', icon: Sparkles },
  ceremonial: { label: 'Ceremonial', icon: Globe },
  auto: { label: 'Auto', icon: Wand2 },
};

export const PromptEnhancer: React.FC<PromptEnhancerProps> = ({
  rawPrompt,
  onAccept,
  region,
  language,
  format,
  visualStyle,
  intent,
  brandTone,
  audience,
  className,
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [result, setResult] = useState<PromptEnhancementResult | null>(null);
  const [quickResult, setQuickResult] = useState<EnhancedPrompt | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMode, setSelectedMode] = useState<EnhancementMode>('auto');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const context: PromptContext = useMemo(() => ({
    rawPrompt,
    region,
    language,
    format,
    visualStyle,
    intent,
    brandTone,
    audience,
    mode: selectedMode,
  }), [rawPrompt, region, language, format, visualStyle, intent, brandTone, audience, selectedMode]);

  // Debounced quick enhancement as user types
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!rawPrompt || rawPrompt.length < 10) {
      setQuickResult(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      setQuickResult(quickEnhance(context));
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [rawPrompt, region, language, format, visualStyle, intent]);

  const handleFullEnhance = async () => {
    if (!rawPrompt || rawPrompt.length < 5) {
      toast.error('Enter some text first');
      return;
    }
    setIsEnhancing(true);
    try {
      const enhancementResult = await enhancePrompt(context);
      setResult(enhancementResult);
      setShowSuggestions(true);
      toast.success(`Prompt enhanced (quality: ${enhancementResult.primary.qualityScore}/100)`);
    } catch {
      toast.error('Enhancement failed — try again');
    } finally {
      setIsEnhancing(false);
    }
  };

  const acceptPrimary = () => {
    if (result?.primary.enhanced) {
      onAccept(result.primary.enhanced);
      toast.success('Enhanced prompt applied');
    }
  };

  const acceptSuggestion = (enhancedPrompt: string) => {
    onAccept(enhancedPrompt);
    toast.success('Suggestion applied');
  };

  if (!rawPrompt || rawPrompt.length < 10) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Quick enhancement indicator */}
      {quickResult && !result && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10">
          <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="text-xs text-muted-foreground flex-1">
            Quality: <span className="font-medium text-foreground">{quickResult.qualityScore}/100</span>
            {quickResult.improvements.length > 0 && (
              <> — {quickResult.improvements[0]}</>
            )}
          </span>
          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
            {MODE_LABELS[quickResult.mode]?.label || 'Auto'}
          </Badge>
          <Button size="sm" variant="default" className="h-6 text-[10px] px-2" onClick={handleFullEnhance} disabled={isEnhancing}>
            {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />}
            Enhance
          </Button>
        </div>
      )}

      {/* Full enhancement result */}
      {result && (
        <Card className="border-primary/20">
          <CardContent className="p-3 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">Enhanced Prompt</span>
                <Badge className="text-[9px] px-1 py-0 h-4 bg-primary/10 text-primary border-0">
                  {result.primary.qualityScore}/100
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={handleFullEnhance} disabled={isEnhancing}>
                  <RefreshCw className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="default" className="h-6 text-[10px] px-2" onClick={acceptPrimary}>
                  <Check className="w-3 h-3 mr-1" /> Apply
                </Button>
              </div>
            </div>

            {/* Enhanced text preview */}
            <Textarea
              value={result.primary.enhanced}
              readOnly
              className="text-xs min-h-[80px] bg-muted/30 resize-none"
              rows={4}
            />

            {/* Improvements */}
            {result.primary.improvements.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {result.primary.improvements.map((imp, i) => (
                  <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-green-600 border-green-200">
                    <Check className="w-2.5 h-2.5 mr-0.5" />
                    {imp}
                  </Badge>
                ))}
              </div>
            )}

            {/* Regional notes */}
            {result.regionalNotes.length > 0 && (
              <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                <Globe className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{result.regionalNotes.join(' · ')}</span>
              </div>
            )}

            {/* Preview */}
            {result.preview && (
              <div className="text-[10px] text-muted-foreground italic px-2 py-1 bg-muted/20 rounded">
                <Eye className="w-3 h-3 inline mr-1" />
                {result.preview}
              </div>
            )}

            {/* Alternative suggestions */}
            {result.suggestions.length > 0 && (
              <div>
                <button
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                >
                  {showSuggestions ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  {result.suggestions.length} alternative{result.suggestions.length !== 1 ? 's' : ''}
                </button>
                {showSuggestions && (
                  <div className="space-y-1.5 mt-1.5">
                    {result.suggestions.map(sug => (
                      <div key={sug.id} className="flex items-start gap-2 p-2 rounded border border-border/40 hover:border-primary/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-medium">{sug.label}</span>
                            <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5">{sug.qualityScore}/100</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{sug.description}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5 flex-shrink-0"
                          onClick={() => acceptSuggestion(sug.enhancedPrompt)}
                        >
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromptEnhancer;
