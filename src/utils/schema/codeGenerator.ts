
/**
 * Code Generation Utilities
 */

export const generateHookCode = (module: any): string => {
  return `/**
 * ${module.moduleName} Hook - Auto-generated
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const use${module.moduleName} = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all ${module.moduleName.toLowerCase()}
  const { data: ${module.moduleName.toLowerCase()}, isLoading, error } = useQuery({
    queryKey: ['${module.tableName}'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('${module.tableName}')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (newItem: any) => {
      const { data, error } = await supabase
        .from('${module.tableName}')
        .insert([newItem])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${module.tableName}'] });
      toast({
        title: "Success",
        description: "${module.moduleName} created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: \`Failed to create ${module.moduleName.toLowerCase()}: \${error.message}\`,
        variant: "destructive",
      });
    }
  });

  return {
    ${module.moduleName.toLowerCase()},
    isLoading,
    error,
    create: createMutation.mutate,
    isCreating: createMutation.isPending
  };
};
`;
};

export const generateComponentCode = (module: any): string => {
  return `/**
 * ${module.moduleName} Module Component - Auto-generated
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { use${module.moduleName} } from '@/hooks/use${module.moduleName}';

export const ${module.moduleName}Module = () => {
  const { ${module.moduleName.toLowerCase()}, isLoading } = use${module.moduleName}();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">${module.moduleName} Management</h1>
        <Button>Add New</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>${module.moduleName} List</CardTitle>
        </CardHeader>
        <CardContent>
          {${module.moduleName.toLowerCase()} && ${module.moduleName.toLowerCase()}.length > 0 ? (
            <div className="space-y-2">
              {${module.moduleName.toLowerCase()}.map((item: any) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <pre>{JSON.stringify(item, null, 2)}</pre>
                </div>
              ))}
            </div>
          ) : (
            <p>No ${module.moduleName.toLowerCase()} found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
`;
};
