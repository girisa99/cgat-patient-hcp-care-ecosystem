/**
 * Hook for managing two-way session feedback between hosts and participants
 * Provides real-time updates for collaborative session management
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type FeedbackType = 
  | 'script_suggestion' 
  | 'title_suggestion' 
  | 'schedule_change' 
  | 'content_comment' 
  | 'recording_review' 
  | 'general'
  | 'reply';

export type FeedbackCategory = 
  | 'script' 
  | 'title' 
  | 'description' 
  | 'schedule' 
  | 'recording' 
  | 'production'
  | 'general';

export type FeedbackStatus = 
  | 'pending' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'implemented' 
  | 'needs_clarification';

export type ReviewStatus = 
  | 'not_started' 
  | 'in_review' 
  | 'changes_requested' 
  | 'approved';

export interface SessionFeedback {
  id: string;
  session_id: string;
  participant_id: string | null;
  host_user_id: string | null;
  feedback_type: FeedbackType;
  category: FeedbackCategory;
  subject: string | null;
  content: string;
  reference_type: string | null;
  reference_value: string | null;
  suggested_value: string | null;
  status: FeedbackStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  host_response: string | null;
  host_responded_at: string | null;
  is_from_host: boolean;
  parent_feedback_id: string | null;
  read_by_host: boolean;
  read_by_participant: boolean;
  created_at: string;
  updated_at: string;
  participant?: any;
  replies?: SessionFeedback[];
}

export interface SessionReviewStatus {
  id: string;
  session_id: string;
  script_review_status: ReviewStatus;
  title_review_status: ReviewStatus;
  schedule_review_status: ReviewStatus;
  recording_review_status: ReviewStatus;
  production_review_status: ReviewStatus;
  final_approval_status: 'pending' | 'approved' | 'rejected';
  pending_feedback_count: number;
  resolved_feedback_count: number;
  created_at: string;
  updated_at: string;
}

interface UseSessionFeedbackReturn {
  feedback: SessionFeedback[];
  reviewStatus: SessionReviewStatus | null;
  isLoading: boolean;
  isSubmitting: boolean;
  
  // Actions
  fetchFeedback: (sessionId: string) => Promise<void>;
  submitFeedback: (params: SubmitFeedbackParams) => Promise<boolean>;
  respondToFeedback: (feedbackId: string, response: string, status?: FeedbackStatus) => Promise<boolean>;
  updateFeedbackStatus: (feedbackId: string, status: FeedbackStatus) => Promise<boolean>;
  updateReviewStatus: (sessionId: string, field: string, status: ReviewStatus) => Promise<boolean>;
  
  // Realtime
  subscribeToFeedback: (sessionId: string) => () => void;
}

interface SubmitFeedbackParams {
  sessionId: string;
  participantToken?: string;
  feedbackType: FeedbackType;
  category: FeedbackCategory;
  subject?: string;
  content: string;
  referenceType?: string;
  referenceValue?: string;
  suggestedValue?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export const useSessionFeedback = (): UseSessionFeedbackReturn => {
  const [feedback, setFeedback] = useState<SessionFeedback[]>([]);
  const [reviewStatus, setReviewStatus] = useState<SessionReviewStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFeedback = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      // Fetch feedback
      const { data: feedbackData, error: feedbackError } = await supabase.functions.invoke('session-feedback', {
        body: { action: 'get_feedback', session_id: sessionId },
      });

      if (feedbackError) throw feedbackError;
      setFeedback(feedbackData?.feedback || []);

      // Fetch review status
      const { data: statusData, error: statusError } = await supabase.functions.invoke('session-feedback', {
        body: { action: 'get_review_status', session_id: sessionId },
      });

      if (statusError) throw statusError;
      setReviewStatus(statusData?.review_status || null);

    } catch (err) {
      console.error('Failed to fetch feedback:', err);
      toast.error('Failed to load feedback');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitFeedback = useCallback(async (params: SubmitFeedbackParams): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('session-feedback', {
        body: {
          action: 'submit',
          session_id: params.sessionId,
          participant_token: params.participantToken,
          feedback_type: params.feedbackType,
          category: params.category,
          subject: params.subject,
          content: params.content,
          reference_type: params.referenceType,
          reference_value: params.referenceValue,
          suggested_value: params.suggestedValue,
          priority: params.priority,
        },
      });

      if (error) throw error;
      
      toast.success('Feedback submitted successfully');
      
      // Refresh feedback list
      await fetchFeedback(params.sessionId);
      
      return true;
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      toast.error('Failed to submit feedback');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchFeedback]);

  const respondToFeedback = useCallback(async (
    feedbackId: string, 
    response: string,
    status?: FeedbackStatus
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const feedbackItem = feedback.find(f => f.id === feedbackId);
      if (!feedbackItem) throw new Error('Feedback not found');

      const { error } = await supabase.functions.invoke('session-feedback', {
        body: {
          action: 'respond',
          session_id: feedbackItem.session_id,
          feedback_id: feedbackId,
          response,
          status,
        },
      });

      if (error) throw error;
      
      toast.success('Response sent');
      await fetchFeedback(feedbackItem.session_id);
      
      return true;
    } catch (err) {
      console.error('Failed to respond:', err);
      toast.error('Failed to send response');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [feedback, fetchFeedback]);

  const updateFeedbackStatus = useCallback(async (
    feedbackId: string, 
    status: FeedbackStatus
  ): Promise<boolean> => {
    try {
      const feedbackItem = feedback.find(f => f.id === feedbackId);
      if (!feedbackItem) throw new Error('Feedback not found');

      const { error } = await supabase.functions.invoke('session-feedback', {
        body: {
          action: 'update_status',
          session_id: feedbackItem.session_id,
          feedback_id: feedbackId,
          status,
        },
      });

      if (error) throw error;
      
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
      await fetchFeedback(feedbackItem.session_id);
      
      return true;
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update status');
      return false;
    }
  }, [feedback, fetchFeedback]);

  const updateReviewStatus = useCallback(async (
    sessionId: string,
    field: string,
    status: ReviewStatus
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke('session-feedback', {
        body: {
          action: 'update_status',
          session_id: sessionId,
          review_field: field,
          status,
        },
      });

      if (error) throw error;
      
      toast.success('Review status updated');
      await fetchFeedback(sessionId);
      
      return true;
    } catch (err) {
      console.error('Failed to update review status:', err);
      toast.error('Failed to update review status');
      return false;
    }
  }, [fetchFeedback]);

  const subscribeToFeedback = useCallback((sessionId: string) => {
    // Subscribe to feedback changes
    const feedbackChannel = supabase
      .channel(`feedback-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'genie_session_feedback',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Feedback change:', payload);
          fetchFeedback(sessionId);
        }
      )
      .subscribe();

    // Subscribe to review status changes
    const statusChannel = supabase
      .channel(`review-status-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'genie_session_review_status',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Review status change:', payload);
          if (payload.new) {
            setReviewStatus(payload.new as SessionReviewStatus);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(feedbackChannel);
      supabase.removeChannel(statusChannel);
    };
  }, [fetchFeedback]);

  return {
    feedback,
    reviewStatus,
    isLoading,
    isSubmitting,
    fetchFeedback,
    submitFeedback,
    respondToFeedback,
    updateFeedbackStatus,
    updateReviewStatus,
    subscribeToFeedback,
  };
};

// Status options for dropdown
export const FEEDBACK_STATUS_OPTIONS: { value: FeedbackStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'under_review', label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'implemented', label: 'Implemented', color: 'bg-purple-100 text-purple-800' },
  { value: 'needs_clarification', label: 'Needs Clarification', color: 'bg-orange-100 text-orange-800' },
];

export const REVIEW_STATUS_OPTIONS: { value: ReviewStatus; label: string; color: string }[] = [
  { value: 'not_started', label: 'Not Started', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_review', label: 'In Review', color: 'bg-blue-100 text-blue-800' },
  { value: 'changes_requested', label: 'Changes Requested', color: 'bg-orange-100 text-orange-800' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
];

export const FEEDBACK_TYPE_OPTIONS: { value: FeedbackType; label: string; icon: string }[] = [
  { value: 'script_suggestion', label: 'Script Suggestion', icon: '📝' },
  { value: 'title_suggestion', label: 'Title Suggestion', icon: '🏷️' },
  { value: 'schedule_change', label: 'Schedule Change', icon: '📅' },
  { value: 'content_comment', label: 'Content Comment', icon: '💬' },
  { value: 'recording_review', label: 'Recording Review', icon: '🎬' },
  { value: 'general', label: 'General Feedback', icon: '📣' },
];

export const FEEDBACK_CATEGORY_OPTIONS: { value: FeedbackCategory; label: string }[] = [
  { value: 'script', label: 'Script' },
  { value: 'title', label: 'Title' },
  { value: 'description', label: 'Description' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'recording', label: 'Recording' },
  { value: 'production', label: 'Production' },
  { value: 'general', label: 'General' },
];
