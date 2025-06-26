
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateTableExists, preModuleCreationCheck, ModuleConfig } from '@/utils/moduleValidation';
import { Database } from '@/integrations/supabase/types';

type DatabaseTables = keyof Database['public']['Tables'];
type TableRow<T extends DatabaseTables> = Database['public']['Tables'][T]['Row'];
type TableInsert<T extends DatabaseTables> = Database['public']['Tables'][T]['Insert'];
type TableUpdate<T extends DatabaseTables> = Database['public']['Tables'][T]['Update'];

/**
 * Type-Safe Module Template Hook
 * 
 * This improved template ensures TypeScript validation before database operations
 * and provides extensible patterns for all future modules.
 */
export const useTypeSafeModuleTemplate = <T extends DatabaseTables>(
  config: ModuleConfig & { tableName: T }
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Validate configuration on hook initialization
  React.useEffect(() => {
    preModuleCreationCheck(config).catch((error) => {
      console.error('❌ Module configuration error:', error);
      toast({
        title: "Module Configuration Error",
        description: error.message,
        variant: "destructive",
      });
    });
  }, [config]);

  // Type-safe data fetching
  const {
    data: items,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [config.tableName, config.moduleName],
    queryFn: async (): Promise<TableRow<T>[]> => {
      console.log(`🔍 Fetching ${config.tableName} data for ${config.moduleName}...`);
      
      if (!validateTableExists(config.tableName)) {
        throw new Error(`Invalid table: ${config.tableName}`);
      }

      const { data, error } = await supabase
        .from(config.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`❌ Error fetching ${config.tableName}:`, error);
        throw error;
      }

      console.log(`✅ ${config.tableName} data fetched:`, data?.length || 0);
      return (data as TableRow<T>[]) || [];
    },
    retry: 2,
    staleTime: 30000,
    enabled: validateTableExists(config.tableName), // Only run if table is valid
  });

  // Type-safe create mutation
  const createMutation = useMutation({
    mutationFn: async (newItem: TableInsert<T>) => {
      console.log(`🔄 Creating new ${config.tableName} item:`, newItem);
      
      // Validate required fields
      if (config.requiredFields) {
        const missingFields = config.requiredFields.filter(field => !newItem[field as keyof TableInsert<T>]);
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

      return data as TableRow<T>;
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

  // Type-safe update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: TableUpdate<T>
    }) => {
      console.log(`🔄 Updating ${config.tableName} item:`, id, updates);
      
      const { data, error } = await supabase
        .from(config.tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error updating ${config.tableName}:`, error);
        throw error;
      }

      return data as TableRow<T>;
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
    items,
    isLoading,
    error,
    refetch,
    createItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    // Debugging metadata
    meta: {
      moduleName: config.moduleName,
      tableName: config.tableName,
      totalItems: items?.length || 0,
      isTableValid: validateTableExists(config.tableName),
      lastFetch: new Date().toISOString()
    }
  };
};
