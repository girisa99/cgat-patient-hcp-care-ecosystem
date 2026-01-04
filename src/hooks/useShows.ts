/**
 * Hook for managing shows/productions and scheduling
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  Show, 
  ShowParticipant, 
  ShowAsset, 
  ShowWithParticipants,
  ProductionStage,
  MeetingStage,
  EventStage,
  ShowType,
  EventCategory
} from '@/types/shows';

export function useShows() {
  const [shows, setShows] = useState<ShowWithParticipants[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShows = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setShows([]);
        setIsLoading(false);
        return;
      }

      // Fetch shows with participants
      const { data: showsData, error: showsError } = await supabase
        .from('shows')
        .select(`
          *,
          show_participants (*),
          show_assets (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (showsError) throw showsError;

      const transformedShows: ShowWithParticipants[] = (showsData || []).map((show: any) => ({
        ...show,
        participants: show.show_participants || [],
        assets: show.show_assets || [],
      }));

      setShows(transformedShows);
    } catch (err: any) {
      console.error('Error fetching shows:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  const createShow = async (data: {
    title: string;
    description?: string;
    show_type: ShowType;
    scheduled_date?: string;
    starting_stage?: ProductionStage;
    host_name?: string;
    guest_info?: { name: string; email?: string }[];
    linked_script_id?: string;
    linked_music_id?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: newShow, error } = await supabase
        .from('shows')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description || null,
          show_type: data.show_type,
          scheduled_date: data.scheduled_date || null,
          current_stage: data.starting_stage || 'outreach' as ProductionStage,
          host_name: data.host_name || null,
          guest_info: data.guest_info || [],
          linked_script_id: data.linked_script_id || null,
          linked_music_id: data.linked_music_id || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Show created successfully');
      await fetchShows();
      return newShow as Show;
    } catch (err: any) {
      console.error('Error creating show:', err);
      toast.error('Failed to create show');
      throw err;
    }
  };

  const updateShow = async (id: string, updates: Partial<Show>) => {
    try {
      const { error } = await supabase
        .from('shows')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Show updated');
      await fetchShows();
    } catch (err: any) {
      console.error('Error updating show:', err);
      toast.error('Failed to update show');
      throw err;
    }
  };

  const updateStage = async (id: string, newStage: ProductionStage) => {
    try {
      const { error } = await supabase
        .from('shows')
        .update({ current_stage: newStage })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Moved to ${newStage.replace('_', ' ')}`);
      await fetchShows();
    } catch (err: any) {
      console.error('Error updating stage:', err);
      toast.error('Failed to update stage');
      throw err;
    }
  };

  const deleteShow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shows')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Show deleted');
      await fetchShows();
    } catch (err: any) {
      console.error('Error deleting show:', err);
      toast.error('Failed to delete show');
      throw err;
    }
  };

  // Participant management
  const addParticipant = async (showId: string, participant: {
    name: string;
    email?: string;
    role: ShowParticipant['role'];
  }) => {
    try {
      const { error } = await supabase
        .from('show_participants')
        .insert({
          show_id: showId,
          name: participant.name,
          email: participant.email || null,
          role: participant.role as any, // Cast to avoid type mismatch with new roles
          status: 'invited' as any,
        } as any);

      if (error) throw error;

      toast.success('Participant added');
      await fetchShows();
    } catch (err: any) {
      console.error('Error adding participant:', err);
      toast.error('Failed to add participant');
      throw err;
    }
  };

  const updateParticipantStatus = async (participantId: string, status: ShowParticipant['status']) => {
    try {
      const updates: any = { status };
      if (status === 'confirmed') {
        updates.confirmed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('show_participants')
        .update(updates)
        .eq('id', participantId);

      if (error) throw error;

      toast.success('Participant updated');
      await fetchShows();
    } catch (err: any) {
      console.error('Error updating participant:', err);
      toast.error('Failed to update participant');
      throw err;
    }
  };

  const removeParticipant = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('show_participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;

      toast.success('Participant removed');
      await fetchShows();
    } catch (err: any) {
      console.error('Error removing participant:', err);
      toast.error('Failed to remove participant');
      throw err;
    }
  };

  // Asset management
  const addAsset = async (showId: string, asset: {
    asset_type: ShowAsset['asset_type'];
    name: string;
    file_url?: string;
    stage?: ProductionStage;
    metadata?: Record<string, any>;
  }) => {
    try {
      const { error } = await supabase
        .from('show_assets')
        .insert({
          show_id: showId,
          asset_type: asset.asset_type,
          name: asset.name,
          file_url: asset.file_url || null,
          stage: asset.stage || null,
          metadata: asset.metadata || {},
        });

      if (error) throw error;

      toast.success('Asset added');
      await fetchShows();
    } catch (err: any) {
      console.error('Error adding asset:', err);
      toast.error('Failed to add asset');
      throw err;
    }
  };

  // Get shows by stage for Kanban view - supports all categories
  const getShowsByStage = useCallback((category?: EventCategory) => {
    // Filter shows by category if provided
    const filteredShows = category 
      ? shows.filter(show => show.event_category === category || (!show.event_category && category === 'media_production'))
      : shows;

    // For media productions, use current_stage
    if (!category || category === 'media_production') {
      const stages: Record<string, ShowWithParticipants[]> = {
        outreach: [],
        script: [],
        rehearsal: [],
        recording: [],
        post_production: [],
        published: [],
      };
      filteredShows.forEach(show => {
        if (stages[show.current_stage]) {
          stages[show.current_stage].push(show);
        }
      });
      return stages;
    }

    // For meetings, use meeting_stage
    if (category === 'business_meeting') {
      const stages: Record<string, ShowWithParticipants[]> = {
        scheduled: [],
        confirmed: [],
        agenda_prep: [],
        in_progress: [],
        follow_up: [],
        completed: [],
        cancelled: [],
      };
      filteredShows.forEach(show => {
        const stage = show.meeting_stage || 'scheduled';
        if (stages[stage]) {
          stages[stage].push(show);
        }
      });
      return stages;
    }

    // For events, use event_stage
    if (category === 'event') {
      const stages: Record<string, ShowWithParticipants[]> = {
        planning: [],
        promotion: [],
        registration: [],
        live: [],
        wrap_up: [],
        archived: [],
        cancelled: [],
      };
      filteredShows.forEach(show => {
        const stage = show.event_stage || 'planning';
        if (stages[stage]) {
          stages[stage].push(show);
        }
      });
      return stages;
    }

    return {};
  }, [shows]);

  // Update meeting stage
  const updateMeetingStage = async (id: string, newStage: MeetingStage) => {
    try {
      const { error } = await supabase
        .from('shows')
        .update({ meeting_stage: newStage } as any)
        .eq('id', id);

      if (error) throw error;

      toast.success(`Moved to ${newStage.replace('_', ' ')}`);
      await fetchShows();
    } catch (err: any) {
      console.error('Error updating meeting stage:', err);
      toast.error('Failed to update stage');
      throw err;
    }
  };

  // Update event stage
  const updateEventStage = async (id: string, newStage: EventStage) => {
    try {
      const { error } = await supabase
        .from('shows')
        .update({ event_stage: newStage } as any)
        .eq('id', id);

      if (error) throw error;

      toast.success(`Moved to ${newStage.replace('_', ' ')}`);
      await fetchShows();
    } catch (err: any) {
      console.error('Error updating event stage:', err);
      toast.error('Failed to update stage');
      throw err;
    }
  };

  return {
    shows,
    isLoading,
    error,
    refresh: fetchShows,
    createShow,
    updateShow,
    updateStage,
    updateMeetingStage,
    updateEventStage,
    deleteShow,
    addParticipant,
    updateParticipantStatus,
    removeParticipant,
    addAsset,
    getShowsByStage,
  };
}
