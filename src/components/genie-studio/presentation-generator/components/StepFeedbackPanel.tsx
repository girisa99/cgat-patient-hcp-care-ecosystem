/**
 * Step Feedback Panel - Compact feedback for Genie AI Deck improvement
 * Minimal design with quick like/improve actions
 */

import React, { useState, useCallback } from 'react';
import { ThumbsUp, ThumbsDown, Send, Loader2, Check, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { labelStudioService } from '@/services/labelStudioBackgroundService';
import { toast } from 'sonner';

interface StepFeedbackPanelProps {
  stepNumber: number;
  stepName: string;
  stepContent?: string;
  className?: string;
  variant?: 'full' | 'compact' | 'inline';
}

export function StepFeedbackPanel({
  stepNumber,
  stepName,
  stepContent,
  className,
  variant = 'full',
}: StepFeedbackPanelProps) {
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitFeedback = useCallback(async (
    selectedRating: 'positive' | 'negative',
    text?: string
  ) => {
    setIsSubmitting(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      
      // Store to RAG for AI improvement
      const ragContribution = {
        user_id: user.user?.id,
        contribution_type: 'step_feedback',
        content_summary: JSON.stringify({
          rating: selectedRating,
          step: stepNumber,
          stepName,
          feedbackText: text,
          timestamp: new Date().toISOString()
        }),
        rag_enhancement_data: {
          feedback_type: selectedRating,
          context: 'wizard_step',
          product: 'deck',
          step: stepNumber,
          stepName,
          timestamp: new Date().toISOString()
        },
        relevance_score: selectedRating === 'positive' ? 0.9 : 0.3
      };

      await supabase
        .from('knowledge_base_contributions')
        .insert(ragContribution);

      // Store to conversation_learning_feedback for analytics
      await supabase
        .from('conversation_learning_feedback')
        .insert({
          feedback_type: selectedRating,
          feedback_text: text || null,
          domain: 'deck',
          feedback_score: selectedRating === 'positive' ? 5 : 1,
          message_index: stepNumber,
          metadata: {
            context: 'wizard_step_guidance',
            step: stepNumber,
            stepName,
            product: 'deck',
            timestamp: new Date().toISOString()
          }
        });

      // Record to Label Studio for ML training
      labelStudioService.recordEvent({
        eventType: 'script_enhancement_accepted',
        context: {
          product: 'spark',
          contentType: 'wizard_step',
          originalValue: stepContent,
          userAction: selectedRating === 'positive' ? 'accept' : 'reject'
        },
        metadata: {
          feedbackText: text,
          step: stepNumber,
          stepName
        }
      });

      setIsSubmitted(true);
      
      toast.success('Thanks! Improving Genie AI Deck.', {
        duration: 2000,
        icon: <Brain className="h-3 w-3" />
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  }, [stepNumber, stepName, stepContent]);

  const handleRating = useCallback((newRating: 'positive' | 'negative') => {
    setRating(newRating);
    
    if (variant === 'inline') {
      submitFeedback(newRating);
    } else {
      setShowTextInput(true);
    }
  }, [variant, submitFeedback]);

  const handleSubmitWithText = useCallback(() => {
    if (rating) {
      submitFeedback(rating, feedbackText);
    }
  }, [rating, feedbackText, submitFeedback]);

  // Already submitted state
  if (isSubmitted) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md bg-green-500/10 border border-green-500/20",
        className
      )}>
        <Check className="h-3 w-3 text-green-600" />
        <span className="text-xs text-green-700 dark:text-green-400">
          Feedback recorded
        </span>
      </div>
    );
  }

  // Inline variant - minimal
  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-xs text-muted-foreground">Helpful?</span>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 p-0",
            rating === 'positive' && "bg-green-500/20 text-green-600"
          )}
          onClick={() => handleRating('positive')}
          disabled={isSubmitting}
        >
          {isSubmitting && rating === 'positive' ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ThumbsUp className="h-3 w-3" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 p-0",
            rating === 'negative' && "bg-red-500/20 text-red-600"
          )}
          onClick={() => handleRating('negative')}
          disabled={isSubmitting}
        >
          {isSubmitting && rating === 'negative' ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ThumbsDown className="h-3 w-3" />
          )}
        </Button>
      </div>
    );
  }

  // Full/Compact variant - reduced size
  return (
    <div className={cn(
      "rounded-md border bg-muted/30 p-2.5",
      className
    )}>
      <div className="flex items-center justify-between gap-3">
        {/* Left: Title */}
        <div className="flex items-center gap-1.5">
          <Brain className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Help improve Genie AI Deck
          </span>
        </div>

        {/* Right: Rating Buttons */}
        {!showTextInput && (
          <div className="flex items-center gap-1.5">
            <Button
              variant={rating === 'positive' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                "h-6 px-2 text-xs gap-1",
                rating === 'positive' && "bg-green-600 hover:bg-green-700"
              )}
              onClick={() => handleRating('positive')}
              disabled={isSubmitting}
            >
              <ThumbsUp className="h-3 w-3" />
              Good
            </Button>
            <Button
              variant={rating === 'negative' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                "h-6 px-2 text-xs gap-1",
                rating === 'negative' && "bg-amber-600 hover:bg-amber-700"
              )}
              onClick={() => handleRating('negative')}
              disabled={isSubmitting}
            >
              <ThumbsDown className="h-3 w-3" />
              Improve
            </Button>
          </div>
        )}
      </div>

      {/* Text Feedback - compact */}
      {showTextInput && (
        <div className="mt-2 pt-2 border-t border-border/50 space-y-2">
          <Textarea
            placeholder={rating === 'positive' 
              ? "What worked well?" 
              : "How can we improve?"}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={1}
            className="text-xs resize-none min-h-[28px] py-1.5"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmitWithText}
              disabled={isSubmitting}
              className="h-6 px-2 text-xs gap-1"
            >
              {isSubmitting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StepFeedbackPanel;
