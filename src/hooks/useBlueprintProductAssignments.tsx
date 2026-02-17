/**
 * Hook for managing Blueprint ↔ Product many-to-many assignments
 * Enables template-to-product mapping so the right screenshots get assigned to the right templates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BlueprintProductAssignment {
  id: string;
  blueprint_id: string;
  product_id: string;
  is_primary: boolean;
  assigned_by: string | null;
  created_at: string;
}

export interface BlueprintWithProducts {
  blueprint_id: string;
  product_ids: string[];
  primary_product_id: string | null;
}

export const useBlueprintProductAssignments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all assignments
  const assignmentsQuery = useQuery({
    queryKey: ['blueprint-product-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blueprint_product_assignments')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as BlueprintProductAssignment[];
    },
    staleTime: 60 * 1000,
  });

  // Get products for a specific blueprint
  const getProductsForBlueprint = (blueprintId: string): string[] => {
    return (assignmentsQuery.data || [])
      .filter(a => a.blueprint_id === blueprintId)
      .map(a => a.product_id);
  };

  // Get primary product for a blueprint
  const getPrimaryProduct = (blueprintId: string): string | null => {
    const primary = (assignmentsQuery.data || [])
      .find(a => a.blueprint_id === blueprintId && a.is_primary);
    return primary?.product_id || null;
  };

  // Get blueprints for a specific product
  const getBlueprintsForProduct = (productId: string): string[] => {
    return (assignmentsQuery.data || [])
      .filter(a => a.product_id === productId)
      .map(a => a.blueprint_id);
  };

  // Assign blueprint to product
  const assignMutation = useMutation({
    mutationFn: async ({ 
      blueprintId, 
      productId, 
      isPrimary = false 
    }: { 
      blueprintId: string; 
      productId: string; 
      isPrimary?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('blueprint_product_assignments')
        .upsert({
          blueprint_id: blueprintId,
          product_id: productId,
          is_primary: isPrimary,
          assigned_by: user?.id || null,
        }, {
          onConflict: 'blueprint_id,product_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blueprint-product-assignments'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Assignment Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Bulk assign blueprint to multiple products
  const bulkAssignMutation = useMutation({
    mutationFn: async ({ 
      blueprintId, 
      productIds, 
      primaryProductId 
    }: { 
      blueprintId: string; 
      productIds: string[]; 
      primaryProductId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Delete existing assignments for this blueprint
      await supabase
        .from('blueprint_product_assignments')
        .delete()
        .eq('blueprint_id', blueprintId);

      // Insert new assignments
      if (productIds.length === 0) return [];

      const inserts = productIds.map(productId => ({
        blueprint_id: blueprintId,
        product_id: productId,
        is_primary: productId === primaryProductId,
        assigned_by: user?.id || null,
      }));

      const { data, error } = await supabase
        .from('blueprint_product_assignments')
        .insert(inserts)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blueprint-product-assignments'] });
      toast({
        title: 'Products Assigned',
        description: 'Blueprint product mapping updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Bulk Assignment Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Unassign blueprint from product
  const unassignMutation = useMutation({
    mutationFn: async ({ blueprintId, productId }: { blueprintId: string; productId: string }) => {
      const { error } = await supabase
        .from('blueprint_product_assignments')
        .delete()
        .eq('blueprint_id', blueprintId)
        .eq('product_id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blueprint-product-assignments'] });
    },
  });

  // Build lookup map: blueprintId -> product IDs
  const blueprintProductMap = (assignmentsQuery.data || []).reduce((acc, a) => {
    if (!acc[a.blueprint_id]) acc[a.blueprint_id] = [];
    acc[a.blueprint_id].push(a.product_id);
    return acc;
  }, {} as Record<string, string[]>);

  return {
    assignments: assignmentsQuery.data || [],
    isLoading: assignmentsQuery.isLoading,
    blueprintProductMap,
    getProductsForBlueprint,
    getPrimaryProduct,
    getBlueprintsForProduct,
    assign: assignMutation.mutate,
    bulkAssign: bulkAssignMutation.mutate,
    unassign: unassignMutation.mutate,
    isAssigning: assignMutation.isPending || bulkAssignMutation.isPending,
  };
};
