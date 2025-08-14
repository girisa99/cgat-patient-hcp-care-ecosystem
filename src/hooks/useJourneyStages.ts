import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const sb = supabase as unknown as any;

export interface JourneyStage {
  id?: string;
  template_id: string;
  order_index: number;
  title: string;
  description?: string | null;
  owner_role?: string | null;
  entry_criteria?: any[];
  tasks_checklist?: any[];
  expected_duration_minutes?: number | null;
  sla?: Record<string, any>;
  outputs_success_criteria?: any[];
  risks?: any[];
  dependencies?: any[];
  validation_checkpoints?: any[];
  created_at?: string;
  updated_at?: string;
}

export const useJourneyStages = (templateId?: string | null) => {
  const queryClient = useQueryClient();
  const enabled = !!templateId;

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['journey-stages', templateId],
    queryFn: async () => {
      if (!templateId) return [] as JourneyStage[];
      const { data, error } = await sb
        .from('agent_template_journey_stages')
        .select('*')
        .eq('template_id', templateId)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return (data || []) as JourneyStage[];
    },
    enabled,
    staleTime: 10_000,
    retry: 1,
  });

  const createStage = useMutation({
    mutationFn: async (input: Partial<JourneyStage>) => {
      if (!templateId) throw new Error('No templateId provided');
      const nextIndex = ((data || []).length ?? 0);
      const payload = {
        template_id: templateId,
        title: input.title || 'New Stage',
        order_index: input.order_index ?? nextIndex,
        description: input.description ?? null,
        owner_role: input.owner_role ?? null,
        entry_criteria: input.entry_criteria ?? [],
        tasks_checklist: input.tasks_checklist ?? [],
        expected_duration_minutes: input.expected_duration_minutes ?? null,
        sla: input.sla ?? {},
        outputs_success_criteria: input.outputs_success_criteria ?? [],
        risks: input.risks ?? [],
        dependencies: input.dependencies ?? [],
        validation_checkpoints: input.validation_checkpoints ?? [],
      } as JourneyStage;
      const { data: inserted, error } = await sb
        .from('agent_template_journey_stages')
        .insert(payload)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return inserted as JourneyStage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-stages', templateId] });
      toast({ title: 'Stage added' });
    },
    onError: (e: any) => toast({ title: 'Failed to add stage', description: e?.message, variant: 'destructive' }),
  });

  const updateStage = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<JourneyStage> }) => {
      const { error } = await sb
        .from('agent_template_journey_stages')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-stages', templateId] });
      toast({ title: 'Stage updated' });
    },
    onError: (e: any) => toast({ title: 'Failed to update stage', description: e?.message, variant: 'destructive' }),
  });

  const deleteStage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb
        .from('agent_template_journey_stages')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-stages', templateId] });
      toast({ title: 'Stage removed' });
    },
    onError: (e: any) => toast({ title: 'Failed to remove stage', description: e?.message, variant: 'destructive' }),
  });

  const reorderStages = useMutation({
    mutationFn: async ({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) => {
      if (!data) return;
      const list = [...data];
      const a = list[fromIndex];
      const b = list[toIndex];
      if (!a || !b) return;
      // swap their order_index
      const { error: e1 } = await sb
        .from('agent_template_journey_stages')
        .update({ order_index: b.order_index })
        .eq('id', a.id);
      if (e1) throw e1;
      const { error: e2 } = await sb
        .from('agent_template_journey_stages')
        .update({ order_index: a.order_index })
        .eq('id', b.id);
      if (e2) throw e2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-stages', templateId] });
      toast({ title: 'Stages reordered' });
    },
    onError: (e: any) => toast({ title: 'Failed to reorder', description: e?.message, variant: 'destructive' }),
  });

  return {
    stages: (data || []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    isLoading: isLoading || isFetching,
    error,
    refetch,
    createStage: createStage.mutateAsync,
    updateStage: updateStage.mutateAsync,
    deleteStage: deleteStage.mutateAsync,
    reorderStages: reorderStages.mutateAsync,
  };
};
