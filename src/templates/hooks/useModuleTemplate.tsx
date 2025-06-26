
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Template hook for new modules
 * 
 * Usage:
 * 1. Copy this template
 * 2. Rename to your module hook (e.g., useOnboarding.tsx)
 * 3. Update the table name and data structure
 * 4. Add module-specific operations
 */
export const useModuleTemplate = (tableName: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const {
    data: items,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [tableName],
    queryFn: async () => {
      console.log(`🔍 Fetching ${tableName} data...`);
      
      const { data, error } = await (supabase as any)
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`❌ Error fetching ${tableName}:`, error);
        throw error;
      }

      console.log(`✅ ${tableName} data fetched:`, data?.length || 0);
      return data || [];
    },
    retry: 2,
    staleTime: 30000
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (newItem: any) => {
      console.log(`🔄 Creating new ${tableName} item:`, newItem);
      
      const { data, error } = await (supabase as any)
        .from(tableName)
        .insert(newItem)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating ${tableName}:`, error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast({
        title: "Item Created",
        description: `New ${tableName} item has been created successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to create ${tableName} item`,
        variant: "destructive",
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      console.log(`🔄 Updating ${tableName} item:`, id, updates);
      
      const { data, error } = await (supabase as any)
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error updating ${tableName}:`, error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast({
        title: "Item Updated",
        description: `${tableName} item has been updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to update ${tableName} item`,
        variant: "destructive",
      });
    }
  });

  return {
    items,
    isLoading,
    error,
    refetch,
    createItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending
  };
};
