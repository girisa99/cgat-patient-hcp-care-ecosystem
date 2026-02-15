/**
 * useShowCastLinks — Hook for linking Hub/Arc shows to Cast projects
 *
 * Enables the show → Cast publishing pipeline:
 * - Link a show to a cast project for publishing
 * - Schedule publication from the Hub calendar
 * - Track which shows have been published via Cast
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ShowCastLink, ShowCastLinkType } from '@/types/castProjects';

export function useShowCastLinks() {
  const [isLoading, setIsLoading] = useState(false);

  // ──────────────────────────────────────────────────────────────────────
  // FETCH links for a show
  // ──────────────────────────────────────────────────────────────────────

  const getLinksForShow = useCallback(async (showId: string): Promise<ShowCastLink[]> => {
    try {
      const { data, error } = await supabase
        .from('show_cast_links')
        .select('*')
        .eq('show_id', showId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as ShowCastLink[];
    } catch (err: any) {
      console.error('[useShowCastLinks] Error fetching links for show:', err);
      return [];
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────
  // FETCH links for a cast project
  // ──────────────────────────────────────────────────────────────────────

  const getLinksForProject = useCallback(async (castProjectId: string): Promise<ShowCastLink[]> => {
    try {
      const { data, error } = await supabase
        .from('show_cast_links')
        .select('*')
        .eq('cast_project_id', castProjectId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as ShowCastLink[];
    } catch (err: any) {
      console.error('[useShowCastLinks] Error fetching links for project:', err);
      return [];
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────
  // LINK show to cast project (via RPC with ownership verification)
  // ──────────────────────────────────────────────────────────────────────

  const linkShowToCast = async (
    showId: string,
    castProjectId: string,
    linkType: ShowCastLinkType = 'publish',
    publishPlatforms: string[] = [],
    scheduledAt?: string,
  ): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('link_show_to_cast', {
        p_show_id: showId,
        p_cast_project_id: castProjectId,
        p_link_type: linkType,
        p_publish_platforms: publishPlatforms,
        p_scheduled_at: scheduledAt ?? null,
      });

      if (error) throw error;

      toast.success('Show linked to Cast project');
      return data as string;
    } catch (err: any) {
      console.error('[useShowCastLinks] Error linking show to cast:', err);
      toast.error(err.message || 'Failed to link show');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────
  // UNLINK (soft delete — set is_active = false)
  // ──────────────────────────────────────────────────────────────────────

  const unlinkShowFromCast = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('show_cast_links')
        .update({ is_active: false } as any)
        .eq('id', linkId);

      if (error) throw error;
      toast.success('Link removed');
    } catch (err: any) {
      console.error('[useShowCastLinks] Error unlinking:', err);
      toast.error('Failed to remove link');
      throw err;
    }
  };

  // ──────────────────────────────────────────────────────────────────────
  // SCHEDULE PUBLISH
  // ──────────────────────────────────────────────────────────────────────

  const schedulePublish = async (linkId: string, scheduledAt: string) => {
    try {
      const { error } = await supabase
        .from('show_cast_links')
        .update({ scheduled_publish_at: scheduledAt } as any)
        .eq('id', linkId);

      if (error) throw error;
      toast.success('Publish scheduled');
    } catch (err: any) {
      console.error('[useShowCastLinks] Error scheduling publish:', err);
      toast.error('Failed to schedule publish');
      throw err;
    }
  };

  // ──────────────────────────────────────────────────────────────────────
  // MARK PUBLISHED
  // ──────────────────────────────────────────────────────────────────────

  const markPublished = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('show_cast_links')
        .update({ published_at: new Date().toISOString() } as any)
        .eq('id', linkId);

      if (error) throw error;
      toast.success('Marked as published');
    } catch (err: any) {
      console.error('[useShowCastLinks] Error marking published:', err);
      toast.error('Failed to mark as published');
      throw err;
    }
  };

  return {
    isLoading,
    getLinksForShow,
    getLinksForProject,
    linkShowToCast,
    unlinkShowFromCast,
    schedulePublish,
    markPublished,
  };
}
