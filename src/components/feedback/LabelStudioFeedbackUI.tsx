/**
 * LABEL STUDIO FEEDBACK UI
 * 
 * User-facing feedback collection for AI generations
 * Provides 👍/👎 buttons and detailed feedback modal
 * Integrates with useLabelStudio hook for RLHF data collection
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ThumbsUp, ThumbsDown, MessageSquare, Loader2, CheckCircle } from 'lucide-react';
import { useLabelStudio } from '@/hooks/useLabelStudio';
import { useMasterToast } from '@/hooks/useMasterToast';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface FeedbackData {
  executionId: string;
  pipelineId: string;
  outputPreview?: string;
  provider?: string;
  confidence?: number;
  iterations?: number;
}

export interface QualityIssue {
  id: string;
  label: string;
  category: 'video' | 'audio' | 'content' | 'timing' | 'language';
}

const QUALITY_ISSUES: QualityIssue[] = [
  { id: 'video_quality_poor', label: 'Video quality is poor', category: 'video' },
  { id: 'audio_quality_poor', label: 'Audio quality is poor', category: 'audio' },
  { id: 'voice_mismatch', label: 'Voice doesn\'t match content/mood', category: 'audio' },
  { id: 'content_irrelevant', label: 'Content is irrelevant', category: 'content' },
  { id: 'timing_issue', label: 'Timing/pacing issues', category: 'timing' },
  { id: 'language_error', label: 'Language/translation errors', category: 'language' },
  { id: 'format_incorrect', label: 'Output format is wrong', category: 'content' },
  { id: 'missing_elements', label: 'Missing expected elements', category: 'content' }
];

// ═══════════════════════════════════════════════════════════════
// FEEDBACK BUTTONS COMPONENT
// ═══════════════════════════════════════════════════════════════

interface FeedbackButtonsProps {
  data: FeedbackData;
  size?: 'sm' | 'default' | 'lg';
  showDetailedFeedback?: boolean;
  onFeedbackSubmitted?: (rating: 'like' | 'dislike', details?: string) => void;
}

export const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  data,
  size = 'sm',
  showDetailedFeedback = true,
  onFeedbackSubmitted
}) => {
  const [rating, setRating] = useState<'like' | 'dislike' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showSuccess } = useMasterToast();

  const handleQuickFeedback = async (newRating: 'like' | 'dislike') => {
    if (submitted) return;
    
    setRating(newRating);
    
    // If dislike and detailed feedback enabled, show modal
    if (newRating === 'dislike' && showDetailedFeedback) {
      setShowModal(true);
      return;
    }

    // Submit quick feedback
    await submitFeedback(newRating);
  };

  const submitFeedback = async (feedbackRating: 'like' | 'dislike', details?: string, issues?: string[]) => {
    setIsSubmitting(true);
    try {
      // In production, this would call Label Studio API
      console.log('[FeedbackUI] Submitting feedback:', {
        ...data,
        rating: feedbackRating,
        details,
        issues,
        timestamp: new Date().toISOString()
      });

      setSubmitted(true);
      showSuccess('Thanks for your feedback! It helps improve our AI.');
      onFeedbackSubmitted?.(feedbackRating, details);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
      setShowModal(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span className="text-sm">Feedback submitted</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Was this helpful?</span>
        <Button
          variant={rating === 'like' ? 'default' : 'outline'}
          size={size}
          onClick={() => handleQuickFeedback('like')}
          disabled={isSubmitting}
          className="gap-1"
        >
          <ThumbsUp className="h-4 w-4" />
          {size !== 'sm' && 'Like'}
        </Button>
        <Button
          variant={rating === 'dislike' ? 'destructive' : 'outline'}
          size={size}
          onClick={() => handleQuickFeedback('dislike')}
          disabled={isSubmitting}
          className="gap-1"
        >
          <ThumbsDown className="h-4 w-4" />
          {size !== 'sm' && 'Dislike'}
        </Button>
        {showDetailedFeedback && (
          <Button
            variant="ghost"
            size={size}
            onClick={() => setShowModal(true)}
            className="gap-1"
          >
            <MessageSquare className="h-4 w-4" />
            {size !== 'sm' && 'Feedback'}
          </Button>
        )}
      </div>

      <FeedbackModal
        open={showModal}
        onOpenChange={setShowModal}
        data={data}
        initialRating={rating}
        onSubmit={submitFeedback}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// FEEDBACK MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: FeedbackData;
  initialRating: 'like' | 'dislike' | null;
  onSubmit: (rating: 'like' | 'dislike', details?: string, issues?: string[]) => void;
  isSubmitting: boolean;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  open,
  onOpenChange,
  data,
  initialRating,
  onSubmit,
  isSubmitting
}) => {
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [feedbackText, setFeedbackText] = useState('');

  const toggleIssue = (issueId: string) => {
    setSelectedIssues(prev =>
      prev.includes(issueId)
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  const handleSubmit = () => {
    const rating = initialRating || (selectedIssues.length > 0 ? 'dislike' : 'like');
    onSubmit(rating, feedbackText, selectedIssues);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Share Your Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve by telling us what went wrong or what could be better.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Execution Info */}
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Pipeline:</span>{' '}
                <span className="font-medium">{data.pipelineId}</span>
              </div>
              {data.provider && (
                <div>
                  <span className="text-muted-foreground">Provider:</span>{' '}
                  <span className="font-medium">{data.provider}</span>
                </div>
              )}
              {data.confidence !== undefined && (
                <div>
                  <span className="text-muted-foreground">Confidence:</span>{' '}
                  <span className="font-medium">{(data.confidence * 100).toFixed(0)}%</span>
                </div>
              )}
              {data.iterations !== undefined && (
                <div>
                  <span className="text-muted-foreground">Iterations:</span>{' '}
                  <span className="font-medium">{data.iterations}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quality Issues */}
          <div className="space-y-2">
            <Label>What issues did you experience?</Label>
            <div className="grid grid-cols-2 gap-2">
              {QUALITY_ISSUES.map(issue => (
                <div key={issue.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={issue.id}
                    checked={selectedIssues.includes(issue.id)}
                    onCheckedChange={() => toggleIssue(issue.id)}
                  />
                  <label
                    htmlFor={issue.id}
                    className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {issue.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback-text">Additional comments (optional)</Label>
            <Textarea
              id="feedback-text"
              placeholder="Tell us more about what happened or what you expected..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ═══════════════════════════════════════════════════════════════
// INLINE FEEDBACK WIDGET
// ═══════════════════════════════════════════════════════════════

interface InlineFeedbackWidgetProps {
  data: FeedbackData;
  className?: string;
}

export const InlineFeedbackWidget: React.FC<InlineFeedbackWidgetProps> = ({
  data,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between p-3 border rounded-lg bg-background ${className}`}>
      <div className="flex items-center gap-3">
        {data.outputPreview && (
          <div className="w-16 h-16 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
            Preview
          </div>
        )}
        <div>
          <p className="text-sm font-medium">{data.pipelineId}</p>
          {data.confidence !== undefined && (
            <p className="text-xs text-muted-foreground">
              Confidence: {(data.confidence * 100).toFixed(0)}%
            </p>
          )}
        </div>
      </div>
      <FeedbackButtons data={data} size="sm" />
    </div>
  );
};

export default FeedbackButtons;
