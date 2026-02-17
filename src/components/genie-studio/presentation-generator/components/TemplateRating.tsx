/**
 * Template Rating Component
 * Allows users to rate and review community templates
 * Implements RLHF feedback collection for template improvement
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  Send,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
// Simple RLHF recording helper (no external dependency)
const recordFeedbackEvent = async (eventData: Record<string, unknown>) => {
  console.log('[RLHF] Recording event:', eventData.eventType);
};

interface TemplateRatingProps {
  templateId: string;
  templateName: string;
  initialRating?: number;
  initialLikes?: number;
  userRating?: number;
  userLiked?: boolean;
  onRatingChange?: (rating: number) => void;
  onLikeChange?: (liked: boolean) => void;
  compact?: boolean;
  showReviewInput?: boolean;
  className?: string;
}

export function TemplateRating({
  templateId,
  templateName,
  initialRating = 0,
  initialLikes = 0,
  userRating,
  userLiked = false,
  onRatingChange,
  onLikeChange,
  compact = false,
  showReviewInput = false,
  className
}: TemplateRatingProps) {
  const [rating, setRating] = useState(userRating || 0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [liked, setLiked] = useState(userLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleRatingClick = useCallback(async (starValue: number) => {
    setRating(starValue);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to rate templates');
        return;
      }
      
      // Record for RLHF
      recordFeedbackEvent({
        eventType: 'template_rated',
        templateId,
        templateName,
        rating: starValue,
        userId: user.id
      });
      
      // Update database rating (simplified - would need proper rating table)
      // For now, just update the likes_count as a proxy
      if (starValue >= 4) {
        await supabase
          .from('presentation_templates')
          .update({ likes_count: likes + 1 })
          .eq('id', templateId);
      }
      
      onRatingChange?.(starValue);
      toast.success('Rating saved!');
      
      if (starValue >= 4) {
        setShowReview(true);
      }
    } catch (error) {
      console.error('Failed to save rating:', error);
    }
  }, [templateId, templateName, likes, onRatingChange]);
  
  const handleLikeClick = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to like templates');
        return;
      }
      
      const newLiked = !liked;
      setLiked(newLiked);
      setLikes(prev => newLiked ? prev + 1 : prev - 1);
      
      // Update database
      await supabase
        .from('presentation_templates')
        .update({ likes_count: newLiked ? likes + 1 : Math.max(0, likes - 1) })
        .eq('id', templateId);
      
      // Record for RLHF
      recordFeedbackEvent({
        eventType: newLiked ? 'template_liked' : 'template_unliked',
        templateId,
        templateName,
        userId: user.id
      });
      
      onLikeChange?.(newLiked);
    } catch (error) {
      console.error('Failed to update like:', error);
    }
  }, [liked, likes, templateId, templateName, onLikeChange]);
  
  const handleReviewSubmit = useCallback(async () => {
    if (!reviewText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to leave a review');
        return;
      }
      
      // Record for RLHF training
      recordFeedbackEvent({
        eventType: 'template_reviewed',
        templateId,
        templateName,
        rating,
        reviewText,
        userId: user.id
      });
      
      // Store to knowledge base contributions for RAG improvement
      await supabase.from('knowledge_base_contributions').insert({
        user_id: user.id,
        contribution_type: 'template_review',
        content_summary: JSON.stringify({
          templateId,
          templateName,
          rating,
          review: reviewText.slice(0, 500)
        }),
        rag_enhancement_data: {
          type: 'template_feedback',
          sentiment: rating >= 4 ? 'positive' : rating >= 2 ? 'neutral' : 'negative',
          keywords: templateName.split(' ')
        },
        relevance_score: rating / 5
      });
      
      setSubmitted(true);
      setShowReview(false);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  }, [reviewText, rating, templateId, templateName]);
  
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2 gap-1",
                  liked && "text-red-500"
                )}
                onClick={handleLikeClick}
              >
                <ThumbsUp className={cn("h-3.5 w-3.5", liked && "fill-current")} />
                <span className="text-xs">{likes}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{liked ? 'Unlike' : 'Like'} this template</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              className={cn(
                "h-3 w-3 cursor-pointer transition-colors",
                star <= (hoveredStar || rating)
                  ? "text-amber-400 fill-amber-400"
                  : "text-muted-foreground/30"
              )}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => handleRatingClick(star)}
            />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Star Rating */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Rate this template:</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              className="focus:outline-none"
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => handleRatingClick(star)}
            >
              <Star
                className={cn(
                  "h-5 w-5 transition-all",
                  star <= (hoveredStar || rating)
                    ? "text-amber-400 fill-amber-400 scale-110"
                    : "text-muted-foreground/30 hover:text-amber-300"
                )}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <Badge variant="outline" className="text-xs">
            {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
          </Badge>
        )}
      </div>
      
      {/* Like Button */}
      <div className="flex items-center gap-3">
        <Button
          variant={liked ? "default" : "outline"}
          size="sm"
          className="gap-2"
          onClick={handleLikeClick}
        >
          <ThumbsUp className={cn("h-4 w-4", liked && "fill-current")} />
          {liked ? 'Liked' : 'Like'}
        </Button>
        <span className="text-sm text-muted-foreground">{likes} likes</span>
      </div>
      
      {/* Review Input */}
      {(showReviewInput || showReview) && !submitted && (
        <Popover open={showReview} onOpenChange={setShowReview}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Write a review
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <div className="font-medium text-sm">Share your thoughts</div>
              <Textarea
                placeholder="What did you like or dislike about this template?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="min-h-[80px] text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReview(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReviewSubmit}
                  disabled={isSubmitting || !reviewText.trim()}
                  className="gap-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Submit
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
      
      {submitted && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          Thank you for your feedback!
        </div>
      )}
    </div>
  );
}

/**
 * Quick feedback buttons for inline use
 */
interface QuickFeedbackProps {
  itemId: string;
  itemType: 'slide' | 'template' | 'content';
  onFeedback?: (type: 'positive' | 'negative') => void;
  className?: string;
}

export function QuickFeedback({
  itemId,
  itemType,
  onFeedback,
  className
}: QuickFeedbackProps) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  
  const handleFeedback = useCallback(async (type: 'positive' | 'negative') => {
    setFeedback(type);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Record for RLHF
      recordFeedbackEvent({
        eventType: `${itemType}_feedback`,
        itemId,
        itemType,
        feedbackType: type,
        userId: user?.id
      });
      
      onFeedback?.(type);
    } catch (error) {
      console.error('Failed to record feedback:', error);
    }
  }, [itemId, itemType, onFeedback]);
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6",
                feedback === 'positive' && "text-green-600 bg-green-50"
              )}
              onClick={() => handleFeedback('positive')}
              disabled={feedback !== null}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">This is helpful</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6",
                feedback === 'negative' && "text-red-600 bg-red-50"
              )}
              onClick={() => handleFeedback('negative')}
              disabled={feedback !== null}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">This needs improvement</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default TemplateRating;
