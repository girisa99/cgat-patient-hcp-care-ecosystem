
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ModuleConfig } from '@/utils/moduleValidation';
import { Database } from '@/integrations/supabase/types';

type DatabaseTables = keyof Database['public']['Tables'];

/**
 * Module Mutations Hook
 * Handles create, update, and delete operations for modules
 */
export const useModuleMutations = <T extends DatabaseTables>(
  config: ModuleConfig & { tableName: T }
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Type-safe create mutation using any for flexibility
  const createMutation = useMutation({
    mutationFn: async (newItem: any) => {
      console.log(`🔄 Creating new ${config.tableName} item:`, newItem);
      
      // Validate required fields
      if (config.requiredFields) {
        const missingFields = config.requiredFields.filter(field => !newItem[field]);
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
      }

      // Custom validation if provided
      if (config.customValidation && !config.customValidation(newItem)) {
        throw new Error('Custom validation failed');
      }

      const { data, error } = await supabase
        .from(config.tableName)
        .insert(newItem)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating ${config.tableName}:`, error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.tableName] });
      toast({
        title: `${config.moduleName} Created`,
        description: `New ${config.moduleName.toLowerCase()} has been created successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Error",
        description: error.message || `Failed to create ${config.moduleName.toLowerCase()}`,
        variant: "destructive",
      });
    }
  });

  // Type-safe update mutation - fixed to use proper column reference
  const updateMutation = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: any
    }) => {
      console.log(`🔄 Updating ${config.tableName} item:`, id, updates);
      
      // Use the table's query builder directly to avoid type issues
      const query = supabase
        .from(config.tableName)
        .update(updates)
        .select()
        .single();

      // Apply the id filter using the correct column name
      const { data, error } = await (query as any).eq('id', id);

      if (error) {
        console.error(`❌ Error updating ${config.tableName}:`, error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.tableName] });
      toast({
        title: `${config.moduleName} Updated`,
        description: `${config.moduleName} has been updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Error",
        description: error.message || `Failed to update ${config.moduleName.toLowerCase()}`,
        variant: "destructive",
      });
    }
  });

  return {
    createItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};
