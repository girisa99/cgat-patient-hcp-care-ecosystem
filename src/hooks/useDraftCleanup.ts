import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { toast } from '@/hooks/use-toast';

interface OldDraftAgent {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  days_old: number;
  table_source: 'agents' | 'agent_sessions';
}

interface CleanupResult {
  preview_mode: boolean;
  old_agents_count?: number;
  old_sessions_count?: number;
  total_count?: number;
  deleted_agents?: number;
  deleted_sessions?: number;
  total_deleted?: number;
  cleanup_timestamp?: string;
}

export const useDraftCleanup = () => {
  const { user } = useMasterAuth();
  const queryClient = useQueryClient();
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);

  // Get old draft agents count on load
  const { data: cleanupPreview, refetch: refetchPreview } = useQuery({
    queryKey: ['draft-cleanup-preview', user?.id],
    queryFn: async (): Promise<CleanupResult> => {
      if (!user?.id) return { preview_mode: true, total_count: 0 };

      const { data, error } = await supabase.rpc('cleanup_old_draft_agents', {
        p_user_id: user.id,
        p_confirm: false
      });

      if (error) {
        console.error('Error getting cleanup preview:', error);
        return { preview_mode: true, total_count: 0 };
      }

      return data as unknown as CleanupResult;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get detailed list of old drafts
  const { data: oldDrafts = [] } = useQuery({
    queryKey: ['old-draft-agents', user?.id],
    queryFn: async (): Promise<OldDraftAgent[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase.rpc('get_old_draft_agents', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error fetching old drafts:', error);
        return [];
      }

      return (data || []) as OldDraftAgent[];
    },
    enabled: !!user?.id && showCleanupDialog,
  });

  // Cleanup mutation
  const cleanupMutation = useMutation({
    mutationFn: async (): Promise<CleanupResult> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('cleanup_old_draft_agents', {
        p_user_id: user.id,
        p_confirm: true
      });

      if (error) {
        throw new Error(`Cleanup failed: ${error.message}`);
      }

      return data as unknown as CleanupResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['user-agent-sessions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['draft-cleanup-preview'] });
      queryClient.invalidateQueries({ queryKey: ['old-draft-agents'] });
      
      const totalDeleted = result.total_deleted || 0;
      if (totalDeleted > 0) {
        toast({
          title: "Cleanup Complete",
          description: `Successfully deleted ${totalDeleted} old draft agent${totalDeleted === 1 ? '' : 's'}.`,
        });
      } else {
        toast({
          title: "No Cleanup Needed",
          description: "No old draft agents found to clean up.",
        });
      }
      
      setShowCleanupDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Cleanup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-show dialog if there are old drafts (once per session)
  useEffect(() => {
    if (cleanupPreview?.total_count && cleanupPreview.total_count > 0) {
      const hasShownCleanup = sessionStorage.getItem('has_shown_draft_cleanup');
      if (!hasShownCleanup) {
        setShowCleanupDialog(true);
        sessionStorage.setItem('has_shown_draft_cleanup', 'true');
      }
    }
  }, [cleanupPreview]);

  const performCleanup = () => {
    cleanupMutation.mutate();
  };

  const dismissCleanup = () => {
    setShowCleanupDialog(false);
    // Mark as dismissed for this session
    sessionStorage.setItem('draft_cleanup_dismissed', 'true');
  };

  return {
    // Data
    cleanupPreview,
    oldDrafts,
    
    // UI State
    showCleanupDialog,
    setShowCleanupDialog,
    
    // Actions
    performCleanup,
    dismissCleanup,
    refetchPreview,
    
    // Status
    isCleaningUp: cleanupMutation.isPending,
    cleanupError: cleanupMutation.error,
  };
};