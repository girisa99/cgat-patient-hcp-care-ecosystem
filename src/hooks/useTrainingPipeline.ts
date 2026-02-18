/**
 * useTrainingPipeline Hook
 * Frontend hook for the training data capture → Label Studio sync pipeline.
 * Uses training-pipeline edge function + training_data_captures table.
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

export interface TrainingCapture {
  id: string;
  training_type: string;
  data_url: string | null;
  metadata: Record<string, any>;
  label_studio_project_id: number | null;
  label_studio_task_id: number | null;
  sync_status: string;
  quality_score: number | null;
  annotation_result: any;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

export function useTrainingPipeline() {
  const [loading, setLoading] = useState(false);
  const [captures, setCaptures] = useState<TrainingCapture[]>([]);
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const { showSuccess, showError } = useMasterToast();

  const invoke = useCallback(async (action: string, params: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('training-pipeline', {
        body: { action, ...params },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Pipeline request failed');
      return data;
    } catch (err: any) {
      console.error('[Training Pipeline]', err);
      showError(err?.message || 'Training pipeline error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const capture = useCallback(async (
    trainingType: string,
    dataUrl: string,
    metadata?: Record<string, any>,
    projectId?: number
  ) => {
    const result = await invoke('capture', {
      training_type: trainingType,
      data_url: dataUrl,
      metadata,
      label_studio_project_id: projectId,
    });
    showSuccess('Training data captured');
    return result.data as TrainingCapture;
  }, [invoke, showSuccess]);

  const bulkCapture = useCallback(async (
    items: Array<{ training_type: string; data_url: string; metadata?: Record<string, any>; label_studio_project_id?: number }>
  ) => {
    const result = await invoke('bulkCapture', { items });
    showSuccess(`${result.count} items captured`);
    return result.data as TrainingCapture[];
  }, [invoke, showSuccess]);

  const syncToLabelStudio = useCallback(async (captureIds?: string[], projectId?: number) => {
    const result = await invoke('syncToLabelStudio', {
      capture_ids: captureIds,
      project_id: projectId,
    });
    showSuccess(`${result.synced} items synced to Label Studio`);
    return result.synced as number;
  }, [invoke, showSuccess]);

  const fetchStats = useCallback(async () => {
    const result = await invoke('getStats');
    setStats(result.data);
    return result.data as TrainingStats;
  }, [invoke]);

  const fetchCaptures = useCallback(async (filters?: {
    training_type?: string;
    sync_status?: string;
    limit?: number;
  }) => {
    const result = await invoke('list', filters || {});
    setCaptures(result.data || []);
    return result.data as TrainingCapture[];
  }, [invoke]);

  return {
    loading,
    captures,
    stats,
    capture,
    bulkCapture,
    syncToLabelStudio,
    fetchStats,
    fetchCaptures,
  };
}
