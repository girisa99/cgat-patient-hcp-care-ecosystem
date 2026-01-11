/**
 * Hook for bidirectional sync between session feedback and Production Hub
 * Syncs review status with Kanban stages and provides real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SessionReviewStatus, FeedbackStatus } from './useSessionFeedback';
import type { ProductionStage } from '@/types/shows';
import type { GenieBrandTheme } from './useGenieBrandConfig';

export interface ProductionFeedbackStatus {
  showId: string;
  sessionId: string | null;
  pendingFeedbackCount: number;
  resolvedFeedbackCount: number;
  scriptStatus: string;
  titleStatus: string;
  recordingStatus: string;
  overallApproval: 'pending' | 'approved' | 'rejected';
  lastActivity: string | null;
  urgentItems: number;
}

export interface BrandedEmailConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  brandName: string;
  fontFamily: string;
}

// Map review status to production stages for auto-progression
const REVIEW_TO_STAGE_MAP: Record<string, ProductionStage> = {
  'script_approved': 'rehearsal',
  'recording_approved': 'post_production',
  'production_approved': 'published',
};

// Map production stages to review fields
const STAGE_TO_REVIEW_FIELD: Record<ProductionStage, string> = {
  'outreach': 'title_review_status',
  'script': 'script_review_status',
  'rehearsal': 'schedule_review_status',
  'recording': 'recording_review_status',
  'post_production': 'production_review_status',
  'published': 'final_approval_status',
};

export const useProductionFeedbackSync = () => {
  const [productionStatuses, setProductionStatuses] = useState<Map<string, ProductionFeedbackStatus>>(new Map());
  const [brandConfig, setBrandConfig] = useState<BrandedEmailConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch linked session for a show
  const getLinkedSession = useCallback(async (showId: string) => {
    const { data: session } = await supabase
      .from('genie_sessions')
      .select('id, title, brand_config_id')
      .eq('show_id', showId)
      .maybeSingle();
    return session;
  }, []);

  // Fetch brand config for styling
  const fetchBrandConfig = useCallback(async (brandConfigId?: string) => {
    if (!brandConfigId) return null;
    
    const { data } = await supabase
      .from('genie_brand_configs')
      .select('brand_name, theme_config')
      .eq('id', brandConfigId)
      .single();

    if (data) {
      const theme = data.theme_config as GenieBrandTheme;
      return {
        primaryColor: theme?.primaryColor || '#3B82F6',
        secondaryColor: theme?.secondaryColor || '#8B5CF6',
        accentColor: theme?.accentColor || '#10B981',
        logoUrl: theme?.logoUrl,
        brandName: data.brand_name,
        fontFamily: theme?.fontFamily || 'system-ui',
      };
    }
    return null;
  }, []);

  // Fetch feedback status for a production/show
  const fetchProductionFeedbackStatus = useCallback(async (showId: string): Promise<ProductionFeedbackStatus | null> => {
    try {
      const session = await getLinkedSession(showId);
      
      if (!session) {
        return {
          showId,
          sessionId: null,
          pendingFeedbackCount: 0,
          resolvedFeedbackCount: 0,
          scriptStatus: 'not_started',
          titleStatus: 'not_started',
          recordingStatus: 'not_started',
          overallApproval: 'pending',
          lastActivity: null,
          urgentItems: 0,
        };
      }

      // Fetch review status
      const { data: reviewStatus } = await supabase
        .from('genie_session_review_status')
        .select('*')
        .eq('session_id', session.id)
        .single();

      // Fetch pending feedback count
      const { count: pendingCount } = await supabase
        .from('genie_session_feedback')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', session.id)
        .in('status', ['pending', 'under_review', 'needs_clarification']);

      // Fetch resolved count
      const { count: resolvedCount } = await supabase
        .from('genie_session_feedback')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', session.id)
        .in('status', ['approved', 'implemented']);

      // Fetch urgent items
      const { count: urgentCount } = await supabase
        .from('genie_session_feedback')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', session.id)
        .eq('priority', 'urgent')
        .eq('status', 'pending');

      // Get last activity
      const { data: lastFeedback } = await supabase
        .from('genie_session_feedback')
        .select('updated_at')
        .eq('session_id', session.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      // Load brand config
      if (session.brand_config_id) {
        const config = await fetchBrandConfig(session.brand_config_id);
        if (config) setBrandConfig(config);
      }

      return {
        showId,
        sessionId: session.id,
        pendingFeedbackCount: pendingCount || 0,
        resolvedFeedbackCount: resolvedCount || 0,
        scriptStatus: reviewStatus?.script_review_status || 'not_started',
        titleStatus: reviewStatus?.title_review_status || 'not_started',
        recordingStatus: reviewStatus?.recording_review_status || 'not_started',
        overallApproval: reviewStatus?.final_approval_status || 'pending',
        lastActivity: lastFeedback?.updated_at || null,
        urgentItems: urgentCount || 0,
      };
    } catch (err) {
      console.error('Error fetching production feedback status:', err);
      return null;
    }
  }, [getLinkedSession, fetchBrandConfig]);

  // Fetch statuses for multiple shows
  const fetchMultipleStatuses = useCallback(async (showIds: string[]) => {
    setIsLoading(true);
    const statusMap = new Map<string, ProductionFeedbackStatus>();

    await Promise.all(
      showIds.map(async (showId) => {
        const status = await fetchProductionFeedbackStatus(showId);
        if (status) {
          statusMap.set(showId, status);
        }
      })
    );

    setProductionStatuses(statusMap);
    setIsLoading(false);
  }, [fetchProductionFeedbackStatus]);

  // Sync review status to production stage (auto-progression)
  const syncReviewToStage = useCallback(async (showId: string, reviewField: string, status: string) => {
    if (status !== 'approved') return;

    const stageKey = reviewField.replace('_review_status', '_approved');
    const newStage = REVIEW_TO_STAGE_MAP[stageKey];

    if (newStage) {
      const { error } = await supabase
        .from('shows')
        .update({ current_stage: newStage })
        .eq('id', showId);

      if (!error) {
        toast.success(`Production auto-advanced to ${newStage.replace('_', ' ')}`);
      }
    }
  }, []);

  // Sync production stage to review status
  const syncStageToReview = useCallback(async (showId: string, newStage: ProductionStage) => {
    const session = await getLinkedSession(showId);
    if (!session) return;

    const reviewField = STAGE_TO_REVIEW_FIELD[newStage];
    if (!reviewField) return;

    // Set previous stage's review to approved
    const stageOrder: ProductionStage[] = ['outreach', 'script', 'rehearsal', 'recording', 'post_production', 'published'];
    const currentIndex = stageOrder.indexOf(newStage);
    
    if (currentIndex > 0) {
      const previousStage = stageOrder[currentIndex - 1];
      const previousReviewField = STAGE_TO_REVIEW_FIELD[previousStage];

      if (previousReviewField && previousReviewField !== 'final_approval_status') {
        await supabase
          .from('genie_session_review_status')
          .upsert({
            session_id: session.id,
            [previousReviewField]: 'approved',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'session_id' });
      }
    }

    // Set current stage to in_review
    if (reviewField !== 'final_approval_status') {
      await supabase
        .from('genie_session_review_status')
        .upsert({
          session_id: session.id,
          [reviewField]: 'in_review',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'session_id' });
    }
  }, [getLinkedSession]);

  // Link a show to a session
  const linkShowToSession = useCallback(async (showId: string, sessionId: string) => {
    const { error } = await supabase
      .from('genie_sessions')
      .update({ show_id: showId })
      .eq('id', sessionId);

    if (error) {
      toast.error('Failed to link session to production');
      return false;
    }

    toast.success('Session linked to production');
    return true;
  }, []);

  // Subscribe to real-time updates for a show's feedback
  const subscribeToShowFeedback = useCallback((showId: string) => {
    let sessionId: string | null = null;

    // Get session ID first
    getLinkedSession(showId).then(session => {
      if (!session) return;
      sessionId = session.id;

      // Subscribe to feedback changes
      const feedbackChannel = supabase
        .channel(`show-feedback-${showId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'genie_session_feedback',
            filter: `session_id=eq.${sessionId}`,
          },
          async () => {
            const status = await fetchProductionFeedbackStatus(showId);
            if (status) {
              setProductionStatuses(prev => new Map(prev).set(showId, status));
            }
          }
        )
        .subscribe();

      // Subscribe to review status changes
      const statusChannel = supabase
        .channel(`show-review-${showId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'genie_session_review_status',
            filter: `session_id=eq.${sessionId}`,
          },
          async (payload) => {
            // Check for auto-stage sync
            const newData = payload.new as any;
            if (newData) {
              for (const [field, value] of Object.entries(newData)) {
                if (field.endsWith('_review_status') && value === 'approved') {
                  await syncReviewToStage(showId, field, value as string);
                }
              }
            }

            const status = await fetchProductionFeedbackStatus(showId);
            if (status) {
              setProductionStatuses(prev => new Map(prev).set(showId, status));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(feedbackChannel);
        supabase.removeChannel(statusChannel);
      };
    });

    return () => {}; // Cleanup placeholder
  }, [getLinkedSession, fetchProductionFeedbackStatus, syncReviewToStage]);

  // Get status indicator color and text for UI
  const getStatusIndicator = useCallback((status: ProductionFeedbackStatus) => {
    if (status.urgentItems > 0) {
      return { color: 'destructive', text: `${status.urgentItems} urgent`, icon: '🔴' };
    }
    if (status.pendingFeedbackCount > 0) {
      return { color: 'warning', text: `${status.pendingFeedbackCount} pending`, icon: '🟡' };
    }
    if (status.overallApproval === 'approved') {
      return { color: 'success', text: 'Approved', icon: '🟢' };
    }
    if (status.overallApproval === 'rejected') {
      return { color: 'destructive', text: 'Rejected', icon: '🔴' };
    }
    return { color: 'muted', text: 'No feedback', icon: '⚪' };
  }, []);

  return {
    productionStatuses,
    brandConfig,
    isLoading,
    fetchProductionFeedbackStatus,
    fetchMultipleStatuses,
    syncReviewToStage,
    syncStageToReview,
    linkShowToSession,
    subscribeToShowFeedback,
    getStatusIndicator,
  };
};

// Status badge color mapping for consistent styling
export const STATUS_BADGE_COLORS: Record<string, string> = {
  'not_started': 'bg-muted text-muted-foreground',
  'in_review': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'changes_requested': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'approved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'implemented': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

// Dynamic feedback type options based on current production stage
export const getFeedbackTypesForStage = (stage: ProductionStage) => {
  const baseTypes = [
    { value: 'general', label: 'General Feedback', icon: '📣' },
  ];

  const stageTypes: Record<ProductionStage, typeof baseTypes> = {
    outreach: [
      { value: 'title_suggestion', label: 'Title Review', icon: '🏷️' },
      { value: 'schedule_change', label: 'Schedule Change', icon: '📅' },
      ...baseTypes,
    ],
    script: [
      { value: 'script_suggestion', label: 'Script Review', icon: '📝' },
      { value: 'title_suggestion', label: 'Title Review', icon: '🏷️' },
      { value: 'content_comment', label: 'Content Comment', icon: '💬' },
      ...baseTypes,
    ],
    rehearsal: [
      { value: 'script_suggestion', label: 'Script Changes', icon: '📝' },
      { value: 'schedule_change', label: 'Schedule Adjustment', icon: '📅' },
      ...baseTypes,
    ],
    recording: [
      { value: 'recording_review', label: 'Recording Review', icon: '🎬' },
      { value: 'content_comment', label: 'Take Feedback', icon: '💬' },
      ...baseTypes,
    ],
    post_production: [
      { value: 'recording_review', label: 'Edit Review', icon: '🎬' },
      { value: 'content_comment', label: 'Post-Production Notes', icon: '💬' },
      ...baseTypes,
    ],
    published: [
      { value: 'content_comment', label: 'Final Review', icon: '💬' },
      ...baseTypes,
    ],
  };

  return stageTypes[stage] || baseTypes;
};

// Category options for feedback dropdown (dynamic based on segment)
export const getFeedbackCategoriesForStage = (stage: ProductionStage) => {
  const baseCategories = [
    { value: 'general', label: 'General' },
  ];

  const stageCategories: Record<ProductionStage, typeof baseCategories> = {
    outreach: [
      { value: 'title', label: 'Title' },
      { value: 'description', label: 'Description' },
      { value: 'schedule', label: 'Schedule' },
      ...baseCategories,
    ],
    script: [
      { value: 'script', label: 'Script' },
      { value: 'title', label: 'Title' },
      { value: 'description', label: 'Description' },
      ...baseCategories,
    ],
    rehearsal: [
      { value: 'script', label: 'Script' },
      { value: 'schedule', label: 'Schedule' },
      { value: 'production', label: 'Production' },
      ...baseCategories,
    ],
    recording: [
      { value: 'recording', label: 'Recording' },
      { value: 'production', label: 'Production' },
      ...baseCategories,
    ],
    post_production: [
      { value: 'recording', label: 'Recording' },
      { value: 'production', label: 'Production' },
      ...baseCategories,
    ],
    published: [
      { value: 'production', label: 'Production' },
      ...baseCategories,
    ],
  };

  return stageCategories[stage] || baseCategories;
};
