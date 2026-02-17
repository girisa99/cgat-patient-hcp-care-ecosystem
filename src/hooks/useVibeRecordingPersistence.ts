/**
 * useVibeRecordingPersistence - Persist Vibe recordings and timeline clips to database
 * 
 * Handles:
 * - Auto-saving draft sessions
 * - Loading existing drafts on mount
 * - Syncing clips with database
 * - File uploads to genie-media bucket
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TimelineClip } from '@/components/mobile/MultiClipTimeline';
import type { User } from '@supabase/supabase-js';

export interface VibeRecording {
  id: string;
  title: string;
  status: 'draft' | 'processing' | 'completed' | 'archived';
  recording_type: 'video' | 'audio' | 'photo' | 'screen' | 'pip';
  file_url?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  file_size_bytes?: number;
  session_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface VibeClip {
  id: string;
  recording_id: string;
  clip_type: 'video' | 'audio' | 'image' | 'text';
  name: string;
  source_url?: string;
  thumbnail_url?: string;
  start_time: number;
  duration: number;
  in_point: number;
  out_point: number;
  track: number;
  volume: number;
  opacity: number;
  effects?: unknown[];
  metadata?: Record<string, unknown>;
  order_index: number;
}

interface UseVibeRecordingPersistenceOptions {
  autoSave?: boolean;
  autoSaveInterval?: number; // in ms
}

export function useVibeRecordingPersistence(options: UseVibeRecordingPersistenceOptions = {}) {
  const { autoSave = true, autoSaveInterval = 5000 } = options;
  const [user, setUser] = useState<User | null>(null);
  
  const [currentSession, setCurrentSession] = useState<VibeRecording | null>(null);
  const [clips, setClips] = useState<TimelineClip[]>([]);
  const [drafts, setDrafts] = useState<VibeRecording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSavedClips = useRef<string>('');

  // Load user's draft sessions
  const loadDrafts = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('vibe_recordings')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion since we know the structure
      setDrafts((data || []) as unknown as VibeRecording[]);
    } catch (err) {
      console.error('Failed to load drafts:', err);
    }
  }, [user?.id]);

  // Load clips for a session
  const loadSessionClips = useCallback(async (recordingId: string) => {
    if (!user?.id) return [];
    
    try {
      const { data, error } = await supabase
        .from('vibe_timeline_clips')
        .select('*')
        .eq('recording_id', recordingId)
        .eq('user_id', user.id)
        .order('order_index', { ascending: true });

      if (error) throw error;
      
      // Convert from DB format to TimelineClip format
      const timelineClips: TimelineClip[] = (data || []).map((clip) => ({
        id: clip.id,
        type: clip.clip_type as 'video' | 'audio' | 'image' | 'text',
        name: clip.name,
        sourceUrl: clip.source_url ?? undefined,
        thumbnailUrl: clip.thumbnail_url ?? undefined,
        startTime: Number(clip.start_time),
        duration: Number(clip.duration),
        inPoint: Number(clip.in_point),
        outPoint: Number(clip.out_point),
        track: clip.track,
        volume: Number(clip.volume),
        opacity: Number(clip.opacity),
        effects: clip.effects as TimelineClip['effects'],
      }));
      
      return timelineClips;
    } catch (err) {
      console.error('Failed to load clips:', err);
      return [];
    }
  }, [user?.id]);

  // Create or get current draft session
  const ensureSession = useCallback(async (): Promise<VibeRecording | null> => {
    if (!user?.id) return null;
    
    // If we already have a session, return it
    if (currentSession) return currentSession;
    
    try {
      // Check for existing draft
      const { data: existingDrafts, error: fetchError } = await supabase
        .from('vibe_recordings')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;
      
      if (existingDrafts && existingDrafts.length > 0) {
        const draft = existingDrafts[0] as unknown as VibeRecording;
        setCurrentSession(draft);
        
        // Load existing clips
        const existingClips = await loadSessionClips(draft.id);
        setClips(existingClips);
        lastSavedClips.current = JSON.stringify(existingClips);
        
        return draft;
      }
      
      // Create new draft
      const { data: newDraft, error: insertError } = await supabase
        .from('vibe_recordings')
        .insert({
          user_id: user.id,
          title: `Recording ${new Date().toLocaleDateString()}`,
          status: 'draft',
          recording_type: 'video',
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      const session = newDraft as unknown as VibeRecording;
      setCurrentSession(session);
      return session;
    } catch (err) {
      console.error('Failed to ensure session:', err);
      toast.error('Failed to create recording session');
      return null;
    }
  }, [user?.id, currentSession, loadSessionClips]);

  // Save clips to database
  const saveClips = useCallback(async (clipsToSave: TimelineClip[], recordingId?: string) => {
    if (!user?.id) return false;
    
    const sessionId = recordingId || currentSession?.id;
    if (!sessionId) {
      const session = await ensureSession();
      if (!session) return false;
      return saveClips(clipsToSave, session.id);
    }
    
    // Skip if nothing changed
    const clipsJson = JSON.stringify(clipsToSave);
    if (clipsJson === lastSavedClips.current) return true;
    
    setIsSaving(true);
    
    try {
      // Delete existing clips for this session
      const { error: deleteError } = await supabase
        .from('vibe_timeline_clips')
        .delete()
        .eq('recording_id', sessionId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      
      // Insert new clips
      if (clipsToSave.length > 0) {
        const clipRecords = clipsToSave.map((clip, index) => ({
          id: clip.id,
          recording_id: sessionId,
          user_id: user.id,
          clip_type: clip.type,
          name: clip.name,
          source_url: clip.sourceUrl,
          thumbnail_url: clip.thumbnailUrl,
          start_time: clip.startTime,
          duration: clip.duration,
          in_point: clip.inPoint,
          out_point: clip.outPoint,
          track: clip.track,
          volume: clip.volume,
          opacity: clip.opacity,
          effects: clip.effects || [],
          order_index: index,
        }));
        
        const { error: insertError } = await supabase
          .from('vibe_timeline_clips')
          .insert(clipRecords);

        if (insertError) throw insertError;
      }
      
      // Update session timestamp
      await supabase
        .from('vibe_recordings')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);
      
      lastSavedClips.current = clipsJson;
      setHasUnsavedChanges(false);
      
      return true;
    } catch (err) {
      console.error('Failed to save clips:', err);
      toast.error('Failed to save recording');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, currentSession?.id, ensureSession]);

  // Add a new clip
  const addClip = useCallback(async (clip: TimelineClip) => {
    const session = await ensureSession();
    if (!session) return;
    
    setClips(prev => {
      const newClips = [...prev, clip];
      setHasUnsavedChanges(true);
      return newClips;
    });
  }, [ensureSession]);

  // Update clips
  const updateClips = useCallback((newClips: TimelineClip[]) => {
    setClips(newClips);
    setHasUnsavedChanges(true);
  }, []);

  // Manual save
  const save = useCallback(async () => {
    return saveClips(clips);
  }, [clips, saveClips]);

  // Save as new draft
  const saveAsNewDraft = useCallback(async (title: string) => {
    if (!user?.id) return null;
    
    try {
      const { data: newDraft, error } = await supabase
        .from('vibe_recordings')
        .insert({
          user_id: user.id,
          title,
          status: 'draft',
          recording_type: 'video',
        })
        .select()
        .single();

      if (error) throw error;
      
      const session = newDraft as unknown as VibeRecording;
      setCurrentSession(session);
      
      // Save clips to new session
      await saveClips(clips, session.id);
      
      toast.success(`Saved as "${title}"`);
      loadDrafts();
      
      return session;
    } catch (err) {
      console.error('Failed to save as new draft:', err);
      toast.error('Failed to save draft');
      return null;
    }
  }, [user?.id, clips, saveClips, loadDrafts]);

  // Load a specific draft
  const loadDraft = useCallback(async (draftId: string) => {
    if (!user?.id) return false;
    
    try {
      const { data, error } = await supabase
        .from('vibe_recordings')
        .select('*')
        .eq('id', draftId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      const session = data as unknown as VibeRecording;
      setCurrentSession(session);
      
      const loadedClips = await loadSessionClips(draftId);
      setClips(loadedClips);
      lastSavedClips.current = JSON.stringify(loadedClips);
      setHasUnsavedChanges(false);
      
      return true;
    } catch (err) {
      console.error('Failed to load draft:', err);
      toast.error('Failed to load draft');
      return false;
    }
  }, [user?.id, loadSessionClips]);

  // Delete a draft
  const deleteDraft = useCallback(async (draftId: string) => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('vibe_recordings')
        .delete()
        .eq('id', draftId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // If we deleted the current session, clear it
      if (currentSession?.id === draftId) {
        setCurrentSession(null);
        setClips([]);
      }
      
      loadDrafts();
      toast.success('Draft deleted');
      return true;
    } catch (err) {
      console.error('Failed to delete draft:', err);
      toast.error('Failed to delete draft');
      return false;
    }
  }, [user?.id, currentSession?.id, loadDrafts]);

  // Auto-save effect
  useEffect(() => {
    if (!autoSave || !hasUnsavedChanges || !currentSession) return;
    
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    
    autoSaveTimer.current = setTimeout(() => {
      saveClips(clips);
    }, autoSaveInterval);
    
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [autoSave, autoSaveInterval, hasUnsavedChanges, clips, currentSession, saveClips]);

  // Initial load - get user and drafts
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      
      if (!authUser?.id) {
        setIsLoading(false);
        return;
      }
      
      await loadDrafts();
      await ensureSession();
      setIsLoading(false);
    };
    
    init();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => subscription.unsubscribe();
  }, [loadDrafts, ensureSession]);

  return {
    // State
    currentSession,
    clips,
    drafts,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    
    // Actions
    addClip,
    updateClips,
    save,
    saveAsNewDraft,
    loadDraft,
    deleteDraft,
    loadDrafts,
    ensureSession,
  };
}
