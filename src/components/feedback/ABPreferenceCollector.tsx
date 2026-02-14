/**
 * A/B Preference Collector
 * 
 * Shows two AI outputs side-by-side for pairwise comparison.
 * User picks the better one — highest quality training signal for RLHF.
 * Records preference to Label Studio + knowledge_base_contributions.
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, ArrowLeftRight, Check, Loader2, Equal, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { labelStudioService } from '@/services/labelStudioBackgroundService';
import { toast } from 'sonner';

export interface ABOption {
  id: string;
  label: string;
  content: string;
  provider?: string;
  metadata?: Record<string, any>;
}

interface ABPreferenceCollectorProps {
  /** The two options to compare */
  optionA: ABOption;
  optionB: ABOption;
  /** Context about what's being compared */
  context: {
    product: string;
    contentType: string;
    prompt?: string;
  };
  /** Called when user makes a choice */
  onPreferenceSelected?: (winnerId: string, reason?: string) => void;
  /** Visual variant */
  variant?: 'cards' | 'inline';
  className?: string;
}

export const ABPreferenceCollector: React.FC<ABPreferenceCollectorProps> = ({
  optionA,
  optionB,
  context,
  onPreferenceSelected,
  variant = 'cards',
  className,
}) => {
  const [selected, setSelected] = useState<'a' | 'b' | 'tie' | null>(null);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitPreference = useCallback(async (choice: 'a' | 'b' | 'tie', reasonText?: string) => {
    setIsSubmitting(true);
    try {
      const winnerId = choice === 'a' ? optionA.id : choice === 'b' ? optionB.id : 'tie';
      const { data: user } = await supabase.auth.getUser();

      // Store to knowledge_base_contributions for RAG learning
      await supabase.from('knowledge_base_contributions').insert({
        user_id: user.user?.id,
        contribution_type: 'ab_preference',
        content_summary: JSON.stringify({
          winner: winnerId,
          choice,
          optionA: { id: optionA.id, label: optionA.label, provider: optionA.provider },
          optionB: { id: optionB.id, label: optionB.label, provider: optionB.provider },
          context,
          reason: reasonText,
        }),
        rag_enhancement_data: {
          preference_type: 'pairwise_comparison',
          product: context.product,
          content_type: context.contentType,
          winner_provider: choice === 'a' ? optionA.provider : choice === 'b' ? optionB.provider : 'tie',
          timestamp: new Date().toISOString(),
        },
        relevance_score: choice === 'tie' ? 0.5 : 0.9,
      });

      // Record to Label Studio for ML training
      labelStudioService.recordEvent({
        eventType: 'caption_selected',
        context: {
          product: context.product as any,
          contentType: `ab_${context.contentType}`,
          originalValue: `A:${optionA.id}|B:${optionB.id}`,
          selectedValue: winnerId,
          userAction: 'accept',
        },
        metadata: { choice, reason: reasonText, providers: [optionA.provider, optionB.provider] },
      });

      setIsSubmitted(true);
      onPreferenceSelected?.(winnerId, reasonText);
      toast.success('Preference recorded — this helps improve AI quality!');
    } catch (err) {
      console.error('[ABPreference] Failed to submit:', err);
      toast.error('Failed to record preference');
    } finally {
      setIsSubmitting(false);
    }
  }, [optionA, optionB, context, onPreferenceSelected]);

  const handleSelect = (choice: 'a' | 'b' | 'tie') => {
    setSelected(choice);
    setShowReason(true);
  };

  const handleSubmit = () => {
    if (selected) submitPreference(selected, reason || undefined);
  };

  if (isSubmitted) {
    return (
      <div className={cn("flex items-center justify-center gap-2 p-4 rounded-lg border bg-primary/5", className)}>
        <Check className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium">Thanks! Your preference helps train better AI.</span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowLeftRight className="h-3.5 w-3.5" />
          <span>Which output is better?</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={cn(
              "p-3 rounded-lg border text-left text-sm transition-all",
              selected === 'a' ? "border-primary bg-primary/10 ring-1 ring-primary" : "hover:border-primary/50"
            )}
            onClick={() => handleSelect('a')}
          >
            <Badge variant="outline" className="mb-1.5 text-[10px]">{optionA.label}</Badge>
            <p className="text-xs line-clamp-4">{optionA.content}</p>
          </button>
          <button
            className={cn(
              "p-3 rounded-lg border text-left text-sm transition-all",
              selected === 'b' ? "border-primary bg-primary/10 ring-1 ring-primary" : "hover:border-primary/50"
            )}
            onClick={() => handleSelect('b')}
          >
            <Badge variant="outline" className="mb-1.5 text-[10px]">{optionB.label}</Badge>
            <p className="text-xs line-clamp-4">{optionB.content}</p>
          </button>
        </div>
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => handleSelect('tie')}>
            <Equal className="h-3 w-3 mr-1" /> Both are equal
          </Button>
        </div>
        {showReason && selected && (
          <div className="space-y-2 animate-in slide-in-from-top-2">
            <Textarea
              placeholder="Why do you prefer this? (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-14 text-xs resize-none"
            />
            <Button size="sm" className="w-full h-7 text-xs" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Trophy className="h-3 w-3 mr-1" />}
              Submit Preference
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Cards variant (default)
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="py-3 px-4 bg-muted/30">
        <CardTitle className="text-sm flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-primary" />
          Which output do you prefer?
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Option A */}
          <button
            className={cn(
              "p-4 rounded-lg border-2 text-left transition-all",
              selected === 'a'
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/40 hover:shadow-sm"
            )}
            onClick={() => handleSelect('a')}
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant={selected === 'a' ? 'default' : 'outline'} className="text-[10px]">
                Option A
              </Badge>
              {optionA.provider && (
                <span className="text-[10px] text-muted-foreground">{optionA.provider}</span>
              )}
            </div>
            <p className="text-sm">{optionA.content}</p>
            {selected === 'a' && (
              <div className="mt-2 flex items-center gap-1 text-primary text-xs">
                <Trophy className="h-3 w-3" /> Selected
              </div>
            )}
          </button>

          {/* Option B */}
          <button
            className={cn(
              "p-4 rounded-lg border-2 text-left transition-all",
              selected === 'b'
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/40 hover:shadow-sm"
            )}
            onClick={() => handleSelect('b')}
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant={selected === 'b' ? 'default' : 'outline'} className="text-[10px]">
                Option B
              </Badge>
              {optionB.provider && (
                <span className="text-[10px] text-muted-foreground">{optionB.provider}</span>
              )}
            </div>
            <p className="text-sm">{optionB.content}</p>
            {selected === 'b' && (
              <div className="mt-2 flex items-center gap-1 text-primary text-xs">
                <Trophy className="h-3 w-3" /> Selected
              </div>
            )}
          </button>
        </div>

        {/* Tie option */}
        <div className="flex justify-center">
          <Button
            variant={selected === 'tie' ? 'secondary' : 'ghost'}
            size="sm"
            className="text-xs"
            onClick={() => handleSelect('tie')}
          >
            <Equal className="h-3.5 w-3.5 mr-1.5" /> Both are equally good
          </Button>
        </div>

        {/* Reason + submit */}
        {showReason && selected && (
          <div className="space-y-3 animate-in slide-in-from-top-2 border-t pt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              Why do you prefer this? (optional)
            </div>
            <Textarea
              placeholder="e.g., More engaging tone, better CTA, clearer value prop..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-16 text-sm resize-none"
            />
            <Button className="w-full" size="sm" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trophy className="h-4 w-4 mr-2" />
              )}
              Submit Preference
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ABPreferenceCollector;
