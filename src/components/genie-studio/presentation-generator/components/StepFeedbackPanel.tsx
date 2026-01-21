/**
 * Step Feedback Panel - Visible Likes/Dislikes with Label Studio Integration
 * Prominently displays feedback options at the bottom of each step
 */

import React, { useState, useCallback } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Send, Loader2, Check, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
      
      // 1. Store to RAG (knowledge_base_contributions) for future AI improvement
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

      // 2. Also store to conversation_learning_feedback for detailed analytics
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

      // 3. Record to Label Studio background service for ML training
      labelStudioService.recordEvent({
        eventType: 'script_enhancement_accepted',
        context: {
          product: 'spark', // Use spark as deck proxy for label studio types
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
      
      toast.success('Thank you! Your feedback improves our AI.', {
        duration: 2000,
        icon: <Brain className="h-4 w-4" />
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
      // For inline, submit immediately
      submitFeedback(newRating);
    } else {
      // For full/compact, show text input option
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
        "flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30",
        className
      )}>
        <Check className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700 dark:text-green-400">
          Feedback recorded! AI is learning from your input.
        </span>
        <Badge variant="outline" className="text-[9px] px-1.5 bg-green-500/10 border-green-500/30 text-green-600">
          <Brain className="h-2.5 w-2.5 mr-0.5" />
          Label Studio
        </Badge>
      </div>
    );
  }

  // Inline variant - minimal
  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-xs text-muted-foreground">Was this helpful?</span>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 w-7 p-0",
            rating === 'positive' && "bg-green-500/20 text-green-600"
          )}
          onClick={() => handleRating('positive')}
          disabled={isSubmitting}
        >
          {isSubmitting && rating === 'positive' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ThumbsUp className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 w-7 p-0",
            rating === 'negative' && "bg-red-500/20 text-red-600"
          )}
          onClick={() => handleRating('negative')}
          disabled={isSubmitting}
        >
          {isSubmitting && rating === 'negative' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ThumbsDown className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    );
  }

  // Full/Compact variant
  return (
    <div className={cn(
      "rounded-lg border bg-gradient-to-r from-primary/5 via-background to-accent/5 overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="px-4 py-3 bg-muted/50 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Help Improve Genie AI</span>
        </div>
        <Badge variant="outline" className="text-[9px] px-1.5">
          <Brain className="h-2.5 w-2.5 mr-0.5" />
          Label Studio Learning
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Is Step {stepNumber}: <strong>{stepName}</strong> clear and helpful?
        </p>

        {/* Rating Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant={rating === 'positive' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              "flex-1 gap-2",
              rating === 'positive' && "bg-green-600 hover:bg-green-700"
            )}
            onClick={() => handleRating('positive')}
            disabled={isSubmitting}
          >
            <ThumbsUp className="h-4 w-4" />
            Yes, it's clear
          </Button>
          <Button
            variant={rating === 'negative' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              "flex-1 gap-2",
              rating === 'negative' && "bg-red-600 hover:bg-red-700"
            )}
            onClick={() => handleRating('negative')}
            disabled={isSubmitting}
          >
            <ThumbsDown className="h-4 w-4" />
            Needs improvement
          </Button>
        </div>

        {/* Text Feedback */}
        {showTextInput && (
          <div className="space-y-3 pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              {rating === 'positive' 
                ? 'What did you like most?' 
                : 'How can we improve this step?'}
            </p>
            <Textarea
              placeholder={rating === 'positive' 
                ? "The flow diagram was really helpful..." 
                : "It would be clearer if..."}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Optional: Add specific suggestions
              </span>
              <Button
                size="sm"
                onClick={handleSubmitWithText}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Submit Feedback
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StepFeedbackPanel;
