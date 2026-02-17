/**
 * Inline Train AI Feedback Component
 * 
 * PURPOSE: Capture user feedback at key interaction points across all Genie Studio tools
 * - Thumbs up/down for quick feedback
 * - Optional text feedback for detailed improvement
 * - Stores to RAG (knowledge_base_contributions) for AI learning
 * - Integrates with Label Studio background service
 * 
 * USAGE: Add at key user journey points in Spark, Mind, Vibe, Arc
 */

import React, { useState, useCallback } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, X, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { labelStudioService } from '@/services/labelStudioBackgroundService';
import { toast } from 'sonner';

export type FeedbackContext = 
  | 'content_generation' // Spark - after AI generates content
  | 'script_analysis' // Mind - after AI analyzes script
  | 'script_enhancement' // Mind - after AI enhances content
  | 'recording_complete' // Vibe - after recording session
  | 'clip_generation' // Vibe - after AI creates clips
  | 'podcast_conversion' // Arc - after podcast to video
  | 'auto_publish' // Arc - after scheduling
  | 'ask_genie_response' // Ask Genie - after AI response
  | 'document_extraction' // Document Processing - after OCR/extraction
  | 'slide_generation' // Deck - after AI generates slide
  | 'slide_enhancement' // Deck - after AI enhances slide
  | 'presentation_complete'; // Deck - after full presentation generated

export interface FeedbackData {
  context: FeedbackContext;
  product: 'spark' | 'mind' | 'vibe' | 'arc' | 'hub' | 'ask_genie' | 'document' | 'deck';
  contentId?: string; // Reference to the content being rated
  originalContent?: string; // The AI output being rated
  userInput?: string; // What the user asked for
  metadata?: Record<string, any>;
}

interface InlineTrainAIFeedbackProps {
  data: FeedbackData;
  variant?: 'compact' | 'expanded' | 'minimal';
  showTextFeedback?: boolean;
  onFeedbackSubmit?: (rating: 'positive' | 'negative', text?: string) => void;
  className?: string;
}

export const InlineTrainAIFeedback: React.FC<InlineTrainAIFeedbackProps> = ({
  data,
  variant = 'compact',
  showTextFeedback = true,
  onFeedbackSubmit,
  className
}) => {
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
        contribution_type: 'ai_feedback',
        content_summary: JSON.stringify({
          rating: selectedRating,
          context: data.context,
          product: data.product,
          originalContent: data.originalContent?.slice(0, 500), // Limit size
          userInput: data.userInput?.slice(0, 200),
          feedbackText: text
        }),
        rag_enhancement_data: {
          feedback_type: selectedRating,
          context: data.context,
          product: data.product,
          timestamp: new Date().toISOString(),
          metadata: data.metadata
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
          domain: data.product,
          feedback_score: selectedRating === 'positive' ? 5 : 1,
          message_index: 0,
          metadata: {
            context: data.context,
            contentId: data.contentId,
            product: data.product,
            timestamp: new Date().toISOString()
          }
        });

      // 3. Record to Label Studio background service for ML training
      labelStudioService.recordEvent({
        eventType: 'script_enhancement_accepted',
        context: {
          product: data.product as any,
          contentType: data.context,
          originalValue: data.originalContent,
          userAction: selectedRating === 'positive' ? 'accept' : 'reject'
        },
        metadata: {
          feedbackText: text,
          contentId: data.contentId
        }
      });

      setIsSubmitted(true);
      onFeedbackSubmit?.(selectedRating, text);
      
      toast.success('Thank you! Your feedback helps improve our AI.', {
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  }, [data, onFeedbackSubmit]);

  const handleRating = useCallback((newRating: 'positive' | 'negative') => {
    setRating(newRating);
    
    // For minimal variant, submit immediately
    if (variant === 'minimal') {
      submitFeedback(newRating);
    } else if (!showTextFeedback) {
      submitFeedback(newRating);
    }
  }, [variant, showTextFeedback, submitFeedback]);

  const handleSubmitWithText = useCallback(() => {
    if (rating) {
      submitFeedback(rating, feedbackText || undefined);
    }
  }, [rating, feedbackText, submitFeedback]);

  // Already submitted - show thank you
  if (isSubmitted) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className
      )}>
        <Check className="h-3.5 w-3.5 text-green-500" />
        <span>Thanks for your feedback!</span>
      </div>
    );
  }

  // Minimal variant - just icons
  if (variant === 'minimal') {
    return (
      <div className={cn("inline-flex items-center gap-1", className)}>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 p-0",
            rating === 'positive' && "text-green-500 bg-green-500/10"
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
            "h-6 w-6 p-0",
            rating === 'negative' && "text-red-500 bg-red-500/10"
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

  // Compact variant - icons with optional text expansion
  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="inline-flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Was this helpful?</span>
          <div className="inline-flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2 gap-1",
                rating === 'positive' && "text-green-500 bg-green-500/10"
              )}
              onClick={() => handleRating('positive')}
              disabled={isSubmitting}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span className="text-xs">Yes</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2 gap-1",
                rating === 'negative' && "text-red-500 bg-red-500/10"
              )}
              onClick={() => handleRating('negative')}
              disabled={isSubmitting}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              <span className="text-xs">No</span>
            </Button>
            {showTextFeedback && rating && !showTextInput && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => setShowTextInput(true)}
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        
        {showTextInput && (
          <div className="flex flex-col gap-2 animate-in slide-in-from-top-2">
            <Textarea
              placeholder="Tell us how we can improve..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="h-16 text-sm resize-none"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSubmitWithText}
                disabled={isSubmitting}
                className="h-7"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : null}
                Submit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTextInput(false);
                  if (rating) submitFeedback(rating);
                }}
                className="h-7"
              >
                Skip
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Expanded variant - full feedback form
  return (
    <div className={cn(
      "p-3 rounded-lg border bg-card/50",
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Rate this AI response</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsSubmitted(true)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      <div className="flex gap-2 mb-3">
        <Button
          variant={rating === 'positive' ? 'default' : 'outline'}
          size="sm"
          className={cn(
            "flex-1",
            rating === 'positive' && "bg-green-500 hover:bg-green-600"
          )}
          onClick={() => handleRating('positive')}
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Helpful
        </Button>
        <Button
          variant={rating === 'negative' ? 'default' : 'outline'}
          size="sm"
          className={cn(
            "flex-1",
            rating === 'negative' && "bg-red-500 hover:bg-red-600"
          )}
          onClick={() => handleRating('negative')}
        >
          <ThumbsDown className="h-4 w-4 mr-2" />
          Not Helpful
        </Button>
      </div>

      {rating && showTextFeedback && (
        <div className="space-y-2 animate-in slide-in-from-top-2">
          <Textarea
            placeholder={
              rating === 'positive' 
                ? "What did you find most helpful?" 
                : "How can we improve this?"
            }
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="h-20 text-sm"
          />
          <Button
            className="w-full"
            size="sm"
            onClick={handleSubmitWithText}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Submit Feedback
          </Button>
        </div>
      )}
    </div>
  );
};

export default InlineTrainAIFeedback;
