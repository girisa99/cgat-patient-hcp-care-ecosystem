/**
 * Hook for managing Video Blueprints (Templates)
 * Database-driven template system for Genie Cast
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BlueprintScene {
  id: string;
  blueprint_id: string;
  scene_key: string;
  title: string;
  description: string | null;
  order_index: number;
  scene_type: string;
  script_template: string | null;
  script_variables: any[];
  duration_seconds: number;
  min_duration_seconds: number;
  max_duration_seconds: number;
  visual_config: Record<string, any>;
  audio_config: Record<string, any>;
  transition_config: Record<string, any>;
  is_optional: boolean;
  is_repeatable: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoBlueprint {
  id: string;
  name: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  estimated_duration_seconds: number;
  target_platform: string[];
  industry_tags: string[];
  default_settings: Record<string, any>;
  style_preset: Record<string, any>;
  is_system_default: boolean;
  created_by: string | null;
  is_active: boolean;
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
  scenes?: BlueprintScene[];
}

export interface BlueprintAssignment {
  id: string;
  blueprint_id: string;
  product_id: string | null;
  campaign_id: string | null;
  scene_overrides: Record<string, any>;
  style_overrides: Record<string, any>;
  assigned_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useVideoBlueprints = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all blueprints
  const blueprintsQuery = useQuery({
    queryKey: ['video-blueprints'],
    queryFn: async () => {
      console.log('🔍 Fetching video blueprints...');
      
      const { data, error } = await supabase
        .from('video_blueprints')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching blueprints:', error);
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} blueprints`);
      return data as VideoBlueprint[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch blueprint with scenes
  const useBlueprintWithScenes = (blueprintId: string | null) => {
    return useQuery({
      queryKey: ['video-blueprint', blueprintId],
      queryFn: async () => {
        if (!blueprintId) return null;

        console.log('🔍 Fetching blueprint with scenes:', blueprintId);

        // Fetch blueprint
        const { data: blueprint, error: bpError } = await supabase
          .from('video_blueprints')
          .select('*')
          .eq('id', blueprintId)
          .single();

        if (bpError) throw bpError;

        // Fetch scenes
        const { data: scenes, error: scenesError } = await supabase
          .from('blueprint_scenes')
          .select('*')
          .eq('blueprint_id', blueprintId)
          .order('order_index', { ascending: true });

        if (scenesError) throw scenesError;

        return {
          ...blueprint,
          scenes: scenes || []
        } as VideoBlueprint;
      },
      enabled: !!blueprintId,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Seed blueprints (call edge function)
  const seedBlueprintsMutation = useMutation({
    mutationFn: async () => {
      console.log('🌱 Seeding blueprints...');
      
      const { data, error } = await supabase.functions.invoke('seed-blueprints');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['video-blueprints'] });
      toast({
        title: "Blueprints Seeded",
        description: `Created ${data.blueprints?.length || 0} templates`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Seeding Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Assign blueprint to product
  const assignBlueprintMutation = useMutation({
    mutationFn: async ({ blueprintId, productId }: { blueprintId: string; productId: string }) => {
      console.log('📌 Assigning blueprint to product:', blueprintId, productId);

      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('blueprint_assignments')
        .insert({
          blueprint_id: blueprintId,
          product_id: productId,
          assigned_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blueprint-assignments'] });
      toast({
        title: "Blueprint Assigned",
        description: "Template linked to product successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Increment usage count
  const trackUsageMutation = useMutation({
    mutationFn: async (blueprintId: string) => {
      // Simple increment by fetching current count and updating
      const { data: current } = await supabase
        .from('video_blueprints')
        .select('usage_count')
        .eq('id', blueprintId)
        .single();
      
      await supabase
        .from('video_blueprints')
        .update({ usage_count: (current?.usage_count || 0) + 1 })
        .eq('id', blueprintId);
    }
  });

  // Group blueprints by category
  const blueprintsByCategory = (blueprintsQuery.data || []).reduce((acc, bp) => {
    const category = bp.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(bp);
    return acc;
  }, {} as Record<string, VideoBlueprint[]>);

  // Get category display names
  const categoryLabels: Record<string, string> = {
    marketing: 'Marketing',
    educational: 'Educational',
    storytelling: 'Storytelling',
    announcement: 'Announcements',
    healthcare: 'Healthcare',
    entertainment: 'Entertainment',
    corporate: 'Corporate',
    other: 'Other'
  };

  return {
    blueprints: blueprintsQuery.data || [],
    blueprintsByCategory,
    categoryLabels,
    isLoading: blueprintsQuery.isLoading,
    error: blueprintsQuery.error,
    refetch: blueprintsQuery.refetch,
    useBlueprintWithScenes,
    seedBlueprints: seedBlueprintsMutation.mutate,
    isSeeding: seedBlueprintsMutation.isPending,
    assignBlueprint: assignBlueprintMutation.mutate,
    isAssigning: assignBlueprintMutation.isPending,
    trackUsage: trackUsageMutation.mutate,
  };
};
